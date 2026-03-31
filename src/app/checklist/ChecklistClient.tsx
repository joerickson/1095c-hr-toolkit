"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { CHECKLIST_ITEMS, CHECKLIST_SECTIONS } from "@/lib/checklist-items";
import { useToast } from "@/components/Toast";
import type { ChecklistSeverity } from "@/lib/types";

interface Props {
  initialCompleted: string[];
  userId: string;
  taxYear: number;
  companyName: string;
}

const SEVERITY_LABELS: Record<ChecklistSeverity, string> = {
  critical: "Critical",
  required: "Required",
  deadline: "Deadline",
};

const SEVERITY_BADGE_CLASS: Record<ChecklistSeverity, string> = {
  critical: "badge-critical",
  required: "badge-required",
  deadline: "badge-deadline",
};

export default function ChecklistClient({ initialCompleted, userId, taxYear, companyName }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted));
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const supabase = createClient();

  const total = CHECKLIST_ITEMS.length;
  const doneCount = completed.size;
  const pct = Math.round((doneCount / total) * 100);

  async function toggleItem(key: string) {
    const nowComplete = !completed.has(key);

    // Optimistic update
    setCompleted((prev) => {
      const next = new Set(prev);
      if (nowComplete) next.add(key);
      else next.delete(key);
      return next;
    });

    startTransition(async () => {
      const { error } = await supabase
        .from("audit_checklist_progress")
        .upsert(
          {
            user_id: userId,
            tax_year: taxYear,
            checklist_item_key: key,
            is_complete: nowComplete,
            completed_at: nowComplete ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,tax_year,checklist_item_key" }
        );

      if (error) {
        // Revert on error
        setCompleted((prev) => {
          const next = new Set(prev);
          if (nowComplete) next.delete(key);
          else next.add(key);
          return next;
        });
        showToast("Failed to save. Please try again.", "error");
      }
    });
  }

  async function markSectionComplete(section: string) {
    const sectionItems = CHECKLIST_ITEMS.filter((i) => i.section === section);
    const keys = sectionItems.map((i) => i.key);

    setCompleted((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.add(k));
      return next;
    });

    const { error } = await supabase.from("audit_checklist_progress").upsert(
      keys.map((key) => ({
        user_id: userId,
        tax_year: taxYear,
        checklist_item_key: key,
        is_complete: true,
        completed_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,tax_year,checklist_item_key" }
    );

    if (error) {
      showToast("Failed to save section. Please try again.", "error");
    } else {
      showToast(`Section marked complete`, "success");
    }
  }

  async function resetAll() {
    if (!confirm("Reset all checklist progress? This cannot be undone.")) return;

    const { error } = await supabase
      .from("audit_checklist_progress")
      .delete()
      .eq("user_id", userId)
      .eq("tax_year", taxYear);

    if (error) {
      showToast("Failed to reset checklist.", "error");
    } else {
      setCompleted(new Set());
      showToast("Checklist reset.", "info");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ACA Audit Checklist</h1>
            <p className="text-gray-500 text-sm mt-1">
              {companyName} · Tax Year {taxYear}
            </p>
          </div>
          <button
            onClick={resetAll}
            className="btn-secondary text-sm no-print"
          >
            Reset All
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-navy-700">
              {doneCount} / {total} items ({pct}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                pct === 100 ? "bg-green-500" : pct >= 75 ? "bg-blue-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
              Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />
              Required
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full inline-block" />
              Deadline
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((section) => {
          const items = CHECKLIST_ITEMS.filter((i) => i.section === section);
          const sectionDone = items.filter((i) => completed.has(i.key)).length;
          const sectionPct = Math.round((sectionDone / items.length) * 100);
          const allDone = sectionDone === items.length;

          return (
            <div key={section} className="card">
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      allDone ? "bg-green-500" : "bg-gray-200"
                    }`}
                  >
                    {allDone && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900">{section}</h2>
                  <span className="text-xs text-gray-500">
                    {sectionDone}/{items.length}
                  </span>
                </div>
                {!allDone && (
                  <button
                    onClick={() => markSectionComplete(section)}
                    className="text-xs text-navy-600 hover:text-navy-800 font-medium no-print"
                  >
                    Mark all complete
                  </button>
                )}
              </div>

              {/* Section progress */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    allDone ? "bg-green-500" : "bg-navy-500"
                  }`}
                  style={{ width: `${sectionPct}%` }}
                />
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => {
                  const isDone = completed.has(item.key);
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                        isDone
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleItem(item.key)}
                        className="mt-0.5 w-4 h-4 text-navy-600 rounded border-gray-300 focus:ring-navy-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span className={`${SEVERITY_BADGE_CLASS[item.severity]} flex-shrink-0`}>
                        {SEVERITY_LABELS[item.severity]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {pct === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
          <div className="text-green-800 font-semibold text-lg">
            All checklist items complete!
          </div>
          <p className="text-green-600 text-sm mt-1">
            You are ready to generate and file your 1095-C forms.
          </p>
        </div>
      )}
    </div>
  );
}
