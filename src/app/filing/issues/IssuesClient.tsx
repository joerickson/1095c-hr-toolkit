"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

interface FilingIssue {
  id: string;
  tax_year: number;
  phase_found: number;
  category: string;
  severity: "blocking" | "warning" | "informational";
  title: string;
  description: string | null;
  winteam_fix_path: string | null;
  fix_instructions: string | null;
  affected_count: number;
  status: "open" | "in_progress" | "resolved" | "wont_fix";
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  created_by: string | null;
}

interface Props {
  userId: string;
  initialIssues: FilingIssue[];
  defaultTaxYear: number;
}

const SEVERITY_BADGE: Record<string, string> = {
  blocking: "badge-critical",
  warning: "badge-required",
  informational: "badge-info",
};

const SEVERITY_LABEL: Record<string, string> = {
  blocking: "Blocking",
  warning: "Warning",
  informational: "Info",
};

const STATUS_BADGE: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  wont_fix: "bg-gray-100 text-gray-600",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  wont_fix: "Won't Fix",
};

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface IssueForm {
  title: string;
  category: string;
  severity: string;
  description: string;
  winteamFixPath: string;
  fixInstructions: string;
  affectedCount: string;
}

const DEFAULT_ISSUE: IssueForm = {
  title: "",
  category: "other",
  severity: "warning",
  description: "",
  winteamFixPath: "",
  fixInstructions: "",
  affectedCount: "",
};

const CATEGORIES = [
  { value: "benefit_setup", label: "Benefit Setup" },
  { value: "eligibility_setup", label: "Eligibility Setup" },
  { value: "company_setup", label: "Company Setup" },
  { value: "employee_data", label: "Employee Data" },
  { value: "dependent_data", label: "Dependent Data" },
  { value: "benefit_assignment", label: "Benefit Assignment" },
  { value: "hours_data", label: "Hours Data" },
  { value: "measurement_period", label: "Measurement Period" },
  { value: "other", label: "Other" },
];

export default function IssuesClient({ userId, initialIssues, defaultTaxYear }: Props) {
  const tIssues = useTranslations("issues");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const supabase = createClient();

  const [issues, setIssues] = useState<FilingIssue[]>(initialIssues);
  const [filter, setFilter] = useState<"all" | "blocking" | "open" | "resolved">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<IssueForm>(DEFAULT_ISSUE);
  const [savingForm, setSavingForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [savingResolve, setSavingResolve] = useState(false);

  const filtered = issues.filter((issue) => {
    if (filter === "blocking") return issue.severity === "blocking";
    if (filter === "open") return issue.status === "open" || issue.status === "in_progress";
    if (filter === "resolved") return issue.status === "resolved" || issue.status === "wont_fix";
    return true;
  });

  async function refreshIssues() {
    const { data } = await supabase
      .from("filing_issues")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setIssues(data as FilingIssue[]);
  }

  async function submitIssue() {
    if (!form.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    setSavingForm(true);
    const { error } = await supabase.from("filing_issues").insert({
      tax_year: defaultTaxYear,
      phase_found: 1,
      category: form.category,
      severity: form.severity,
      title: form.title.trim(),
      description: form.description.trim() || null,
      winteam_fix_path: form.winteamFixPath.trim() || null,
      fix_instructions: form.fixInstructions.trim() || null,
      affected_count: form.affectedCount ? Number(form.affectedCount) : 0,
      created_by: userId,
    });
    setSavingForm(false);
    if (error) {
      showToast("Failed to log issue.", "error");
    } else {
      showToast("Issue logged.", "success");
      setDrawerOpen(false);
      setForm(DEFAULT_ISSUE);
      await refreshIssues();
    }
  }

  async function markResolved(id: string) {
    setSavingResolve(true);
    const { error } = await supabase
      .from("filing_issues")
      .update({
        status: "resolved",
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolveNotes.trim() || null,
      })
      .eq("id", id);
    setSavingResolve(false);
    if (error) {
      showToast("Failed to resolve issue.", "error");
    } else {
      showToast("Issue marked resolved.", "success");
      setResolvingId(null);
      setResolveNotes("");
      await refreshIssues();
    }
  }

  const openCount = issues.filter((i) => i.status === "open" || i.status === "in_progress").length;
  const blockingCount = issues.filter((i) => i.severity === "blocking" && i.status !== "resolved" && i.status !== "wont_fix").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1">
            <a href="/filing" className="text-navy-600 hover:text-navy-800 text-sm">
              ← Filing Assistant
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{tIssues("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tIssues("subtitle")}
          </p>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary">
          + {tIssues("logIssue")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-gray-900">{issues.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Issues</div>
        </div>
        <div className="card text-center py-4">
          <div className={`text-2xl font-bold ${openCount > 0 ? "text-red-600" : "text-gray-400"}`}>{openCount}</div>
          <div className="text-xs text-gray-500 mt-1">Open / In Progress</div>
        </div>
        <div className="card text-center py-4">
          <div className={`text-2xl font-bold ${blockingCount > 0 ? "text-red-800" : "text-gray-400"}`}>{blockingCount}</div>
          <div className="text-xs text-gray-500 mt-1">Blocking</div>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
          {(["all", "blocking", "open", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-navy-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? tCommon("all") : f === "blocking" ? tIssues("severity.blocking") : f === "open" ? tIssues("status.open") : tIssues("status.resolved")}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} shown</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500">
            {filter === "all" ? "No issues logged yet." : `No ${filter} issues.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phase</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fix Path</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_BADGE[issue.severity]}`}>
                        {tIssues(`severity.${issue.severity}` as "severity.blocking")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{issue.title}</div>
                      {issue.description && (
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{issue.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{formatCategory(issue.category)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">Phase {issue.phase_found}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[issue.status]}`}>
                        {tIssues(`status.${issue.status}` as "status.open")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {issue.winteam_fix_path ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600">
                          {issue.winteam_fix_path}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {issue.status !== "resolved" && issue.status !== "wont_fix" ? (
                        <div>
                          {resolvingId === issue.id ? (
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="text"
                                placeholder={tIssues("resolutionNotes")}
                                value={resolveNotes}
                                onChange={(e) => setResolveNotes(e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-navy-500"
                              />
                              <button
                                onClick={() => markResolved(issue.id)}
                                disabled={savingResolve}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded disabled:opacity-50"
                              >
                                {tCommon("save")}
                              </button>
                              <button
                                onClick={() => { setResolvingId(null); setResolveNotes(""); }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                {tCommon("cancel")}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setResolvingId(issue.id)}
                              className="text-xs text-green-700 hover:text-green-900 font-medium"
                            >
                              {tIssues("markResolved")}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {issue.resolved_at
                            ? new Date(issue.resolved_at).toLocaleDateString()
                            : "Resolved"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Issue Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-lg mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-lg">{tIssues("logIssue")}</h2>
                <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tIssues("fields.title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{tIssues("fields.category")}</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{tIssues("fields.severity")}</label>
                    <select
                      value={form.severity}
                      onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="blocking">{tIssues("severity.blocking")}</option>
                      <option value="warning">{tIssues("severity.warning")}</option>
                      <option value="informational">{tIssues("severity.informational")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tIssues("fields.description")}</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Details about the issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tIssues("fields.winteamPath")} ({tCommon("optional")})</label>
                  <input
                    type="text"
                    value={form.winteamFixPath}
                    onChange={(e) => setForm((f) => ({ ...f, winteamFixPath: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="e.g. INS > Benefit Setup > Plan 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tIssues("fields.fixInstructions")} ({tCommon("optional")})</label>
                  <textarea
                    rows={2}
                    value={form.fixInstructions}
                    onChange={(e) => setForm((f) => ({ ...f, fixInstructions: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Steps to resolve..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tIssues("fields.affectedCount")} ({tCommon("optional")})</label>
                  <input
                    type="number"
                    min="0"
                    value={form.affectedCount}
                    onChange={(e) => setForm((f) => ({ ...f, affectedCount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={submitIssue} disabled={savingForm} className="btn-primary flex-1 disabled:opacity-50">
                    {savingForm ? tCommon("loading") : tIssues("logIssue")}
                  </button>
                  <button onClick={() => setDrawerOpen(false)} className="btn-secondary flex-1">
                    {tCommon("cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
