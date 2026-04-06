import AppLayout from "@/components/AppLayout";
import PrintButton from "./PrintButton";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function GuidePage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("app_settings")
    .select("tax_year, company_name")
    .single();
  const taxYear = settings?.tax_year ?? new Date().getFullYear();
  const companyName = settings?.company_name ?? "RBM Services Inc.";

  return (
    <AppLayout>
      <GuideContent taxYear={taxYear} companyName={companyName} />
    </AppLayout>
  );
}

async function GuideContent({ taxYear, companyName }: { taxYear: number; companyName: string }) {
  const t = await getTranslations("guide");

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {companyName} · Tax Year {taxYear}
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Critical Warning */}
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg mb-6">
        <div className="font-bold text-red-800 mb-1">Critical Setup Requirement</div>
        <p className="text-red-700 text-sm">
          {t("importantNote")}
        </p>
      </div>

      {/* Section 1: SYS Company Setup */}
      <Section
        title={t("steps.step1Title")}
        subtitle={t("steps.step1Sub")}
        color="bg-blue-50 border-blue-200"
        headerColor="bg-blue-700"
      >
        <FieldTable rows={[
          { field: "ACA Configuration", location: "SYS: Company Setup → ACA tab", value: "Must be Enabled", critical: true },
          { field: "Employer EIN", location: "SYS: Company Setup → General tab", value: "87-1234567", critical: true },
          { field: "1095-C Contact Phone", location: "SYS: Company Setup → ACA tab", value: "(801) 555-0100 — must route to Benefits Administrator", critical: false },
          { field: "Company Name", location: "SYS: Company Setup → General tab", value: "RBM Services Inc.", critical: false },
        ]} />
      </Section>

      {/* Section 2: INS Eligibility Setup */}
      <Section
        title={t("steps.step2Title")}
        subtitle={t("steps.step2Sub")}
        color="bg-green-50 border-green-200"
        headerColor="bg-green-700"
      >
        <FieldTable rows={[
          { field: "ACA Compliant Eligibility", location: "INS: Eligibility Setup → each rule", value: "Checkbox must be CHECKED on all ACA eligibility rules", critical: true },
          { field: "Plan Start Month", location: "INS: Eligibility Setup → each rule", value: "Must be set to '01' (January)", critical: false },
        ]} />
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <strong>Note:</strong> Plan Start Month is set automatically when you check the ACA Compliant Eligibility box. Verify it shows "01" for all rules.
        </div>
      </Section>

      {/* Section 3: Benefit Plan Setup */}
      <Section
        title={t("steps.step3Title")}
        subtitle={t("steps.step3Sub")}
        color="bg-purple-50 border-purple-200"
        headerColor="bg-purple-700"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">Setting</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                  <span className="text-blue-700">Plan 1 — MEC</span>
                  <div className="text-xs font-normal text-gray-500">Self-insured, no min value</div>
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                  <span className="text-green-700">Plan 2 — Self-Insured Full</span>
                  <div className="text-xs font-normal text-gray-500">Self-insured, meets min value</div>
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                  <span className="text-orange-700">Plan 3 — Select Health</span>
                  <div className="text-xs font-normal text-gray-500">Fully insured, meets min value</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                {
                  setting: "ACA Checkbox (Pricing tab)",
                  p1: { v: "CHECKED ✓", ok: true },
                  p2: { v: "CHECKED ✓", ok: true },
                  p3: { v: "CHECKED ✓", ok: true },
                },
                {
                  setting: "Self Insured Checkbox",
                  p1: { v: "CHECKED ✓ (Part III generated)", ok: true },
                  p2: { v: "CHECKED ✓ (Part III generated)", ok: true },
                  p3: { v: "NOT checked ✕ (Select Health issues 1095-B)", ok: false },
                },
                {
                  setting: "Minimum Value Checkbox",
                  p1: { v: "NOT checked ✕ (MEC-only)", ok: false },
                  p2: { v: "CHECKED ✓ (full coverage)", ok: true },
                  p3: { v: "CHECKED ✓ (full coverage)", ok: true },
                },
                {
                  setting: "Plan Options tab",
                  p1: { v: "Employee, Spouse, Dependents", ok: true },
                  p2: { v: "Employee, Spouse, Dependents", ok: true },
                  p3: { v: "Employee, Spouse, Dependents", ok: true },
                },
                {
                  setting: "Line 15 Source",
                  p1: { v: "Employee-only premium → $145.00/mo", ok: true },
                  p2: { v: "N/A — Line 15 always uses Plan 1 rate", ok: null },
                  p3: { v: "N/A — Line 15 always uses Plan 1 rate", ok: null },
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-700">{row.setting}</td>
                  {[row.p1, row.p2, row.p3].map((cell, j) => (
                    <td key={j} className={`px-4 py-2.5 text-sm ${
                      cell.ok === true ? "text-green-700" : cell.ok === false ? "text-red-700" : "text-gray-500"
                    }`}>
                      {cell.v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section 4: Benefits by Employee */}
      <Section
        title={t("steps.step4Title")}
        subtitle={t("steps.step4Sub")}
        color="bg-amber-50 border-amber-200"
        headerColor="bg-amber-600"
      >
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-800">Package Assignment Rule</p>
            <p className="text-red-700 mt-1">
              Every employee benefit package must include ALL THREE plans. Do not create separate packages for each plan.
              WinTeam generates the Line 14 code based on which plans are in the package — if only MEC is included,
              the form will incorrectly show 1F.
            </p>
          </div>

          <FieldTable rows={[
            { field: "Stability Start Date", location: "INS: Benefits by Employee → Availability Date", value: "Required — this date drives monthly Line 14/16 codes. Missing = 1H.", critical: true },
            { field: "Coverage dates", location: "INS: Benefits by Employee → Start/End dates", value: "Must be accurate for all months covered", critical: false },
            { field: "Covered Individuals (Part III)", location: "INS: Benefits by Employee → Covered Individuals sub-record", value: "Required for Plan 1 and Plan 2 only. NOT for Plan 3.", critical: true },
          ]} />

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold text-blue-800 mb-2">Part III — Covered Individuals Requirements</p>
            <ul className="text-blue-700 space-y-1">
              <li>• <strong>Employee SSN:</strong> Always required</li>
              <li>• <strong>Spouse:</strong> SSN required (DOB not acceptable)</li>
              <li>• <strong>Minor dependents (under 18):</strong> Date of Birth acceptable in place of SSN</li>
              <li>• <strong>Adult dependents (18+):</strong> SSN required (DOB not sufficient)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Data Source Reference Table */}
      <Section
        title={t("dataSourceTitle")}
        subtitle={t("dataSourceSubtitle")}
        color="bg-gray-50 border-gray-200"
        headerColor="bg-gray-600"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left font-medium text-gray-700">1095-C Field</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">WinTeam Location</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { field: "Employee name, SSN, address, DOB", location: "Employee Master File", notes: "DOB required for age calc (minor vs adult dependents)" },
                { field: "Employer name, EIN, contact phone", location: "SYS: Company Setup", notes: "Same on every form — verify once" },
                { field: "Plan Start Month", location: "INS: Eligibility Setup", notes: "Set automatically when ACA Compliant Eligibility checked" },
                { field: "Line 14 offer code", location: "INS: Benefit Setup (computed)", notes: "Derived from plan package assigned to employee — must include all 3 plans" },
                { field: "Line 15 employee premium", location: "INS: Benefit Setup — Pricing tab", notes: "Always Plan 1 MEC employee-only rate ($145.00/mo)" },
                { field: "Which plan + effective dates", location: "INS: Benefits by Employee", notes: "Stability Start Date (Availability Date) drives monthly codes" },
                { field: "Part III dependent data", location: "INS: Benefits by Employee — Covered Individuals", notes: "Plan 1 and Plan 2 only — not Plan 3" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.field}</td>
                  <td className="px-4 py-2.5 text-navy-700 font-medium">{row.location}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Key Rules Summary */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Business Rules — Never Get These Wrong</h2>
        <div className="space-y-3">
          {[
            {
              num: "1",
              title: "Line 14 is ALWAYS 1E",
              body: "Every eligible employee at RBM Services Inc. gets 1E because all three plans are offered to everyone. Never generate 1F for this employer.",
            },
            {
              num: "2",
              title: "Line 15 is ALWAYS the Plan 1 MEC employee-only premium",
              body: "The Line 15 amount ($145.00/month) is the same on every form, regardless of which plan the employee enrolled in.",
            },
            {
              num: "3",
              title: "Part III required for Plan 1 and Plan 2 only",
              body: "Do NOT populate Part III for Plan 3 (Select Health) employees — Select Health issues their own 1095-B forms.",
            },
            {
              num: "4",
              title: "2C = enrolled, 2H = declined (Rate of Pay safe harbor)",
              body: "Code 2C means the employee enrolled in coverage. Code 2H (Rate of Pay) is used when an employee declined all plans.",
            },
            {
              num: "5",
              title: "Spouse SSN is required in Part III",
              body: "Minor dependent DOB is acceptable in place of SSN. Adult dependent (18+) SSN is required — DOB alone is not sufficient.",
            },
            {
              num: "6",
              title: "Benefit packages must include all three plans",
              body: "In WinTeam, every employee's benefit package must list all three plans to generate the correct 1E code — not just the plan they chose.",
            },
          ].map((rule) => (
            <div key={rule.num} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="flex-shrink-0 w-7 h-7 bg-navy-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {rule.num}
              </span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{rule.title}</div>
                <div className="text-gray-600 text-sm mt-0.5">{rule.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  color,
  headerColor,
  children,
}: {
  title: string;
  subtitle?: string;
  color: string;
  headerColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border rounded-lg mb-4 overflow-hidden ${color}`}>
      <div className={`px-4 py-3 ${headerColor} text-white`}>
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-sm opacity-80 mt-0.5">{subtitle}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FieldTable({
  rows,
}: {
  rows: { field: string; location: string; value: string; critical: boolean }[];
}) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-white/50">
          <th className="px-3 py-2 text-left font-medium text-gray-700 w-1/4">Field</th>
          <th className="px-3 py-2 text-left font-medium text-gray-700 w-1/3">WinTeam Location</th>
          <th className="px-3 py-2 text-left font-medium text-gray-700">Required Value / Note</th>
          <th className="px-3 py-2 w-20"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row, i) => (
          <tr key={i} className="bg-white/40">
            <td className="px-3 py-2.5 font-medium text-gray-800">{row.field}</td>
            <td className="px-3 py-2.5 text-gray-600">{row.location}</td>
            <td className="px-3 py-2.5 text-gray-700">{row.value}</td>
            <td className="px-3 py-2.5">
              {row.critical && <span className="badge-critical">Critical</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
