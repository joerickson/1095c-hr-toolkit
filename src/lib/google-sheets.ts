import crypto from "crypto";

// ── Types ────────────────────────────────────────────────────────────────────

export type PlanCategory = "mec" | "selecthealth" | "selfinsured" | "waived" | "unknown";

export interface RosterEmployee {
  name: string;
  employeeNumber: string;
  plan: string;
  dependents: string[];
  planCategory: PlanCategory;
}

export interface RosterSummary {
  total: number;
  mecOnly: number;
  otherPlans: number;
  selectHealth: number;
  selfInsured: number;
}

export interface RosterData {
  employees: RosterEmployee[];
  summary: RosterSummary;
}

// ── Plan categorisation ──────────────────────────────────────────────────────

function categorizePlan(plan: string): PlanCategory {
  const p = plan.toLowerCase().trim();
  if (!p || p.includes("waiv") || p.includes("declin") || p.includes("none")) return "waived";
  if (p.includes("select health")) return "selecthealth";
  if (p === "mec" || p.startsWith("mec ") || p.includes("mec only") || p.includes("minimum essential")) return "mec";
  // Bronze / Gold IHC / Non-IHC are self-insured
  if (p.includes("bronze") || p.includes("gold") || p.includes("self-insur") || p.includes("self insur")) return "selfinsured";
  return "unknown";
}

// ── Service-account JWT auth (Node.js built-in crypto, no extra packages) ───

async function getServiceAccountAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Vercel stores the key as one line with literal \n — convert back to newlines
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY must be set"
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(privateKey, "base64url");

  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Failed to obtain Google access token: ${body}`);
  }

  const json = await tokenRes.json();
  return json.access_token as string;
}

// ── Sheet fetcher ────────────────────────────────────────────────────────────

/**
 * Expected sheet format (header row required):
 *
 * | Employee Name | Employee Number | Plan | Dependent 1 | Dependent 2 | … |
 *
 * Column detection is header-name based (case-insensitive) so the exact
 * column order does not matter.  Columns containing "dep" in their header
 * are treated as dependent name columns.
 */
export async function fetchRosterFromSheets(): Promise<RosterData> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEETS_ID environment variable is not set");

  const token = await getServiceAccountAccessToken();

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    // Revalidate at most once per minute so repeated lookups are fast
    next: { revalidate: 60 },
  } as RequestInit);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Sheets API error (${res.status}): ${body}`);
  }

  const json = await res.json();
  const values: string[][] = json.values ?? [];

  if (values.length < 2) {
    return {
      employees: [],
      summary: { total: 0, mecOnly: 0, otherPlans: 0, selectHealth: 0, selfInsured: 0 },
    };
  }

  const headers = values[0].map((h) => h.toLowerCase().trim());

  // Find column indices by header name patterns
  const nameIdx = headers.findIndex((h) => h.includes("name") && !h.includes("dep"));
  const empNumIdx = headers.findIndex(
    (h) =>
      (h.includes("emp") || h.includes("employee")) &&
      (h.includes("num") || h.includes("id") || h.includes("#") || h.includes("number"))
  );
  const planIdx = headers.findIndex((h) => h.includes("plan") || h.includes("coverage"));
  const depIndices = headers
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => h.includes("dep"))
    .map(({ i }) => i);

  const employees: RosterEmployee[] = values
    .slice(1)
    .filter((row) => row.some((cell) => cell?.trim()))
    .map((row) => {
      const name = nameIdx >= 0 ? (row[nameIdx] ?? "") : "";
      const employeeNumber = empNumIdx >= 0 ? (row[empNumIdx] ?? "") : "";
      const plan = planIdx >= 0 ? (row[planIdx] ?? "") : "";
      const dependents = depIndices
        .map((i) => row[i]?.trim() ?? "")
        .filter(Boolean);

      return {
        name: name.trim(),
        employeeNumber: employeeNumber.trim(),
        plan: plan.trim(),
        dependents,
        planCategory: categorizePlan(plan),
      };
    })
    .filter((e) => e.name || e.employeeNumber);

  const summary: RosterSummary = {
    total: employees.length,
    mecOnly: employees.filter((e) => e.planCategory === "mec").length,
    otherPlans: employees.filter(
      (e) => e.planCategory !== "mec" && e.planCategory !== "waived"
    ).length,
    selectHealth: employees.filter((e) => e.planCategory === "selecthealth").length,
    selfInsured: employees.filter((e) => e.planCategory === "selfinsured").length,
  };

  return { employees, summary };
}
