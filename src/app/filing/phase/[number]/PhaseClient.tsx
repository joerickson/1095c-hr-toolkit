"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import {
  getFilingChecklist,
  getGateItems,
  PHASE_METADATA,
  type FilingChecklistItem,
} from "@/lib/filing-checklist-items";

interface FilingPhaseRow {
  id: string;
  tax_year: number;
  phase_number: number;
  phase_name: string;
  status: "locked" | "in_progress" | "complete" | "blocked";
}

interface ProgressRow {
  id?: string;
  tax_year: number;
  item_key: string;
  is_complete: boolean;
  finding?: string | null;
  action_taken?: string | null;
}

interface Props {
  userId: string;
  phaseNumber: 1 | 2 | 3 | 4;
  taxYear: number;
  initialPhase: FilingPhaseRow | null;
  initialProgress: ProgressRow[];
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: "badge-critical",
  required: "badge-required",
  recommended: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critical",
  required: "Required",
  recommended: "Recommended",
};

// Issue logger drawer state
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

export default function PhaseClient({
  userId,
  phaseNumber,
  taxYear,
  initialPhase,
  initialProgress,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const checklist = getFilingChecklist(taxYear);
  const phaseItems = checklist.filter((i) => i.phase === phaseNumber);
  const gateItems = phaseItems.filter((i) => i.isGate);

  // Group items by section
  const sections = Array.from(new Set(phaseItems.map((i) => i.section)));

  const [completed, setCompleted] = useState<Set<string>>(
    new Set(
      initialProgress
        .filter((p) => p.is_complete && p.tax_year === taxYear)
        .map((p) => p.item_key)
    )
  );

  const [findings, setFindings] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialProgress.forEach((p) => {
      if (p.finding) map[p.item_key] = p.finding;
    });
    return map;
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [issueForm, setIssueForm] = useState<IssueForm>(DEFAULT_ISSUE);
  const [issueItemContext, setIssueItemContext] = useState<string>("");
  const [savingIssue, setSavingIssue] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const doneCount = phaseItems.filter((i) => completed.has(i.key)).length;
  const gatesComplete = gateItems.every((i) => completed.has(i.key));
  const gateRemaining = gateItems.filter((i) => !completed.has(i.key)).length;
  const pct = phaseItems.length > 0 ? Math.round((doneCount / phaseItems.length) * 100) : 0;

  async function toggleItem(key: string) {
    const nowComplete = !completed.has(key);

    setCompleted((prev) => {
      const next = new Set(prev);
      if (nowComplete) next.add(key);
      else next.delete(key);
      return next;
    });

    startTransition(async () => {
      const { error } = await supabase
        .from("filing_checklist_progress")
        .upsert(
          {
            tax_year: taxYear,
            item_key: key,
            is_complete: nowComplete,
            completed_by: nowComplete ? userId : null,
            completed_at: nowComplete ? new Date().toISOString() : null,
          },
          { onConflict: "tax_year,item_key" }
        );

      if (error) {
        setCompleted((prev) => {
          const next = new Set(prev);
          if (nowComplete) next.delete(key);
          else next.add(key);
          return next;
        });
        showToast("Failed to save. Please try again.", "error");
      } else if (nowComplete) {
        showToast("Item checked off.", "success");
      }
    });
  }

  const saveFinding = useCallback(
    async (key: string, finding: string) => {
      await supabase
        .from("filing_checklist_progress")
        .upsert(
          { tax_year: taxYear, item_key: key, finding, is_complete: completed.has(key) },
          { onConflict: "tax_year,item_key" }
        );
    },
    [supabase, taxYear, completed]
  );

  async function advancePhase() {
    if (!gatesComplete) return;
    if (phaseNumber === 4) {
      // Phase 4 is the last phase — just mark complete
      setAdvancing(true);
      const { error } = await supabase
        .from("filing_phases")
        .update({
          status: "complete",
          completed_by: userId,
          completed_at: new Date().toISOString(),
        })
        .eq("tax_year", taxYear)
        .eq("phase_number", phaseNumber);

      if (error) {
        showToast("Failed to complete phase. Please try again.", "error");
        setAdvancing(false);
        return;
      }
      showToast("Phase 4 complete! Filing is done 🎉", "success");
      router.push("/filing");
      return;
    }

    setAdvancing(true);
    const nextPhase = (phaseNumber + 1) as 2 | 3 | 4;

    // Mark current phase complete
    const { error: e1 } = await supabase
      .from("filing_phases")
      .update({
        status: "complete",
        completed_by: userId,
        completed_at: new Date().toISOString(),
      })
      .eq("tax_year", taxYear)
      .eq("phase_number", phaseNumber);

    // Unlock next phase
    const { error: e2 } = await supabase
      .from("filing_phases")
      .update({ status: "in_progress", started_by: userId, started_at: new Date().toISOString() })
      .eq("tax_year", taxYear)
      .eq("phase_number", nextPhase);

    if (e1 || e2) {
      showToast("Failed to advance phase. Please try again.", "error");
      setAdvancing(false);
      return;
    }

    showToast(`Phase ${phaseNumber} complete! Moving to Phase ${nextPhase}.`, "success");
    router.push("/filing");
  }

  function openIssueDrawer(item?: FilingChecklistItem) {
    setIssueForm({
      ...DEFAULT_ISSUE,
      title: item ? `Issue with: ${item.label}` : "",
      winteamFixPath: item?.winteamPath ?? "",
    });
    setIssueItemContext(item?.key ?? "");
    setIssueDrawerOpen(true);
  }

  async function submitIssue() {
    if (!issueForm.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    setSavingIssue(true);
    const { error } = await supabase.from("filing_issues").insert({
      tax_year: taxYear,
      phase_found: phaseNumber,
      category: issueForm.category,
      severity: issueForm.severity,
      title: issueForm.title.trim(),
      description: issueForm.description.trim() || null,
      winteam_fix_path: issueForm.winteamFixPath.trim() || null,
      fix_instructions: issueForm.fixInstructions.trim() || null,
      affected_count: issueForm.affectedCount ? Number(issueForm.affectedCount) : 0,
      created_by: userId,
    });
    setSavingIssue(false);
    if (error) {
      showToast("Failed to log issue.", "error");
    } else {
      showToast("Issue logged.", "success");
      setIssueDrawerOpen(false);
      setIssueForm(DEFAULT_ISSUE);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a href="/filing" className="text-navy-600 hover:text-navy-800 text-sm">
              ← Filing Assistant
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Phase {phaseNumber}: {initialPhase?.phase_name ?? `Phase ${phaseNumber}`}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {PHASE_METADATA[phaseNumber].description} · Tax Year {taxYear}
          </p>
        </div>
        <button
          onClick={() => openIssueDrawer()}
          className="btn-secondary text-sm"
        >
          + Log Issue
        </button>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Phase Progress</span>
          <span className="text-sm font-bold text-navy-700">
            {doneCount} / {phaseItems.length} items ({pct}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              pct === 100 ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {gateRemaining > 0 && (
          <p className="text-amber-700 text-sm mt-3 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              <strong>{gateRemaining} gate {gateRemaining === 1 ? "item" : "items"}</strong> must be checked before you can advance to Phase {phaseNumber < 4 ? phaseNumber + 1 : "completion"}.
            </span>
          </p>
        )}
        {gatesComplete && pct < 100 && (
          <p className="text-green-700 text-sm mt-3 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            All gate items complete — you can advance this phase.
          </p>
        )}
      </div>

      {/* Checklist sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const sectionItems = phaseItems.filter((i) => i.section === section).sort((a, b) => a.order - b.order);
          const sectionDone = sectionItems.filter((i) => completed.has(i.key)).length;

          return (
            <div key={section} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{section}</h2>
                <span className="text-xs text-gray-500">{sectionDone}/{sectionItems.length}</span>
              </div>

              <div className="space-y-3">
                {sectionItems.map((item) => {
                  const isDone = completed.has(item.key);
                  const isExpandedItem = expanded.has(item.key);

                  return (
                    <div
                      key={item.key}
                      className={`rounded-lg border p-4 transition-colors ${
                        isDone
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleItem(item.key)}
                          disabled={isPending}
                          className="mt-0.5 w-5 h-5 text-navy-600 rounded border-gray-300 focus:ring-navy-500 flex-shrink-0 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0">
                          {/* Label row */}
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <span
                              className={`text-sm font-semibold leading-snug ${
                                isDone ? "line-through text-gray-400" : "text-gray-900"
                              }`}
                              style={{ fontSize: "15px" }}
                            >
                              {item.label}
                            </span>
                          </div>

                          {/* Badge row */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={SEVERITY_BADGE[item.severity]}>
                              {SEVERITY_LABEL[item.severity]}
                            </span>
                            {item.isGate && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-navy-50 text-navy-700 border border-navy-200">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Gate item
                              </span>
                            )}
                            {item.winteamPath && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-navy-700 text-white">
                                {item.winteamPath}
                              </span>
                            )}
                          </div>

                          {/* Detail toggle */}
                          <button
                            onClick={() => setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(item.key)) next.delete(item.key);
                              else next.add(item.key);
                              return next;
                            })}
                            className="text-xs text-navy-600 hover:text-navy-800 mb-2"
                          >
                            {isExpandedItem ? "Hide detail ▲" : "Show detail ▼"}
                          </button>

                          {isExpandedItem && (
                            <p className="text-sm text-gray-600 mb-3 bg-white rounded border border-gray-200 p-3">
                              {item.detail}
                            </p>
                          )}

                          {/* Finding input */}
                          <div className="flex gap-2 items-start">
                            <input
                              type="text"
                              placeholder="What did you find? (optional note)"
                              value={findings[item.key] ?? ""}
                              onChange={(e) =>
                                setFindings((prev) => ({ ...prev, [item.key]: e.target.value }))
                              }
                              onBlur={(e) => saveFinding(item.key, e.target.value)}
                              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy-500"
                            />
                            <button
                              onClick={() => openIssueDrawer(item)}
                              className="text-xs btn-secondary py-1.5 px-2 whitespace-nowrap"
                            >
                              Log Issue
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Phase button */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {phaseNumber < 4
                ? `Advance to Phase ${phaseNumber + 1}`
                : "Complete Filing Process"}
            </p>
            {!gatesComplete && (
              <p className="text-sm text-gray-500 mt-0.5">
                {gateRemaining} gate {gateRemaining === 1 ? "item" : "items"} must be checked first
              </p>
            )}
          </div>
          <button
            onClick={advancePhase}
            disabled={!gatesComplete || advancing || isPending}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {advancing
              ? "Saving..."
              : phaseNumber < 4
              ? `Complete Phase ${phaseNumber} →`
              : "Mark Filing Complete ✓"}
          </button>
        </div>
      </div>

      {/* Issue Logger Drawer */}
      {issueDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIssueDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-lg mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-lg">Log Filing Issue</h2>
                <button
                  onClick={() => setIssueDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issueForm.title}
                    onChange={(e) => setIssueForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={issueForm.category}
                      onChange={(e) => setIssueForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select
                      value={issueForm.severity}
                      onChange={(e) => setIssueForm((f) => ({ ...f, severity: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="blocking">Blocking</option>
                      <option value="warning">Warning</option>
                      <option value="informational">Informational</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={issueForm.description}
                    onChange={(e) => setIssueForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Details about the issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WinTeam Fix Path (optional)
                  </label>
                  <input
                    type="text"
                    value={issueForm.winteamFixPath}
                    onChange={(e) => setIssueForm((f) => ({ ...f, winteamFixPath: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 font-mono"
                    placeholder="e.g. INS > Benefit Setup > Plan 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fix Instructions (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={issueForm.fixInstructions}
                    onChange={(e) => setIssueForm((f) => ({ ...f, fixInstructions: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Steps to resolve..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affected Employee Count (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={issueForm.affectedCount}
                    onChange={(e) => setIssueForm((f) => ({ ...f, affectedCount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={submitIssue}
                    disabled={savingIssue}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {savingIssue ? "Saving..." : "Log Issue"}
                  </button>
                  <button
                    onClick={() => setIssueDrawerOpen(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
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
