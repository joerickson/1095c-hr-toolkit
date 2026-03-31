"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { auditChecklistItems } from "@/lib/data/audit-checklist";

interface Props {
  userId: string;
  initialCheckedIds: string[];
}

export default function AuditChecklistClient({ userId, initialCheckedIds }: Props) {
  const [checked, setChecked] = useState<Set<string>>(
    new Set(initialCheckedIds)
  );
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // Group items by category
  const categories = Array.from(
    new Set(auditChecklistItems.map((item) => item.category))
  );

  const totalItems = auditChecklistItems.length;
  const completedItems = auditChecklistItems.filter((item) =>
    checked.has(item.id)
  ).length;
  const progressPct = Math.round((completedItems / totalItems) * 100);

  const handleToggle = useCallback(
    async (itemId: string) => {
      const newChecked = new Set(checked);
      const isNowChecked = !checked.has(itemId);
      if (isNowChecked) {
        newChecked.add(itemId);
      } else {
        newChecked.delete(itemId);
      }
      setChecked(newChecked);

      // Optimistic update — persist to Supabase
      setSaving((prev) => new Set(prev).add(itemId));
      await supabase
        .from("user_checklist_states")
        .upsert(
          {
            user_id: userId,
            item_id: itemId,
            is_checked: isNowChecked,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,item_id" }
        );
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    },
    [checked, userId, supabase]
  );

  async function handleResetAll() {
    if (!confirm("Reset all checklist items for your account?")) return;
    setChecked(new Set());
    await supabase
      .from("user_checklist_states")
      .update({ is_checked: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Checklist</h1>
            <p className="text-gray-500 mt-1">
              ACA 1095-C compliance checklist — your progress is saved automatically.
            </p>
          </div>
          <button
            onClick={handleResetAll}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Reset all
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {completedItems} / {totalItems} complete
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                progressPct === 100 ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 text-right text-sm font-medium text-gray-600">
            {progressPct}%
            {progressPct === 100 && (
              <span className="ml-2 text-green-600 font-semibold">
                All done! 🎉
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Checklist by category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const items = auditChecklistItems.filter(
            (item) => item.category === category
          );
          const catCompleted = items.filter((item) => checked.has(item.id)).length;

          return (
            <div
              key={category}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">{category}</h2>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    catCompleted === items.length
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {catCompleted}/{items.length}
                </span>
              </div>

              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isChecked = checked.has(item.id);
                  const isSaving = saving.has(item.id);

                  return (
                    <li key={item.id} className="px-6 py-4">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="mt-0.5 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggle(item.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium text-sm ${
                                isChecked ? "line-through text-gray-400" : "text-gray-800"
                              }`}
                            >
                              {item.label}
                            </span>
                            {isSaving && (
                              <span className="text-xs text-gray-400">saving…</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </main>
  );
}
