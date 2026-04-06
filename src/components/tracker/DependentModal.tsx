"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { EmployeeStatus, EmployeeDependent, DependentRelationship } from "@/lib/types";

interface Props {
  employee: EmployeeStatus;
  onClose: () => void;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function DependentModal({ employee, onClose }: Props) {
  const t = useTranslations("tracker");
  const tCommon = useTranslations("common");
  const supabase = createClient();
  const { showToast } = useToast();
  const [dependents, setDependents] = useState<EmployeeDependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editDep, setEditDep] = useState<EmployeeDependent | null>(null);

  const RELATIONSHIP_LABELS: Record<DependentRelationship, string> = {
    spouse: t("relationships.spouse"),
    dependent_minor: t("relationships.dependent_minor"),
    dependent_adult: t("relationships.dependent_adult"),
  };

  useEffect(() => {
    loadDependents();
  }, []);

  async function loadDependents() {
    setLoading(true);
    const { data } = await supabase
      .from("employee_dependents")
      .select("*")
      .eq("employee_id", employee.id)
      .order("created_at");
    setDependents((data as EmployeeDependent[]) || []);
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(t("modals.deleteDepConfirm"))) return;
    const { error } = await supabase.from("employee_dependents").delete().eq("id", id);
    if (error) {
      showToast("Failed to delete dependent.", "error");
    } else {
      showToast(`${name} removed.`, "success");
      await loadDependents();
    }
  }

  function hasIssue(dep: EmployeeDependent): string | null {
    if (dep.relationship === "spouse" && !dep.ssn_on_file) return "Spouse is missing SSN";
    if (dep.relationship === "dependent_adult" && !dep.ssn_on_file) return "Adult dependent missing SSN";
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t("modals.dependentsTitle", { name: employee.full_name })}</h2>
            <p className="text-sm text-gray-500">{employee.full_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 mb-4">
            Part III is required because this employee is enrolled in Plan 1 (MEC) or Plan 2 (Self-Insured).
            Spouse SSN is required. Minor dependent DOB is acceptable. Adult dependent SSN is required.
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400">{tCommon("loading")}</div>
          ) : (
            <>
              {dependents.length === 0 && (
                <div className="py-4 text-center text-gray-400 text-sm mb-4">
                  No covered individuals on file. Add dependents below.
                </div>
              )}

              {dependents.map((dep) => {
                const issue = hasIssue(dep);
                return (
                  <div
                    key={dep.id}
                    className={`p-4 rounded-lg border mb-3 ${
                      issue ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{dep.full_name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {RELATIONSHIP_LABELS[dep.relationship]} ·{" "}
                          SSN: {dep.ssn_on_file ? <span className="text-green-600">{t("status.onFile")}</span> : <span className="text-red-500">{t("status.missing")}</span>} ·{" "}
                          DOB: {dep.dob ?? <span className="text-gray-400">Not entered</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dep.covered_all_12_months
                            ? "Covered all 12 months"
                            : `Covered: ${dep.months_covered?.map((m) => MONTHS[m - 1]).join(", ") ?? "—"}`}
                        </div>
                        {issue && (
                          <div className="text-xs text-amber-700 mt-1 font-medium">⚠ {issue}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditDep(dep)} className="text-navy-600 hover:text-navy-800 text-xs font-medium">{tCommon("edit")}</button>
                        <button onClick={() => handleDelete(dep.id, dep.full_name)} className="text-red-500 hover:text-red-700 text-xs font-medium">{tCommon("remove")}</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!showAdd && !editDep && (
                <button onClick={() => setShowAdd(true)} className="btn-secondary w-full text-sm mt-2">
                  + {t("modals.addDependent")}
                </button>
              )}

              {(showAdd || editDep) && (
                <DependentForm
                  employeeId={employee.id}
                  dependent={editDep}
                  onSaved={async () => {
                    setShowAdd(false);
                    setEditDep(null);
                    await loadDependents();
                    showToast(editDep ? "Dependent updated." : "Dependent added.", "success");
                  }}
                  onCancel={() => { setShowAdd(false); setEditDep(null); }}
                />
              )}
            </>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="btn-primary">{tCommon("complete")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DependentForm({
  employeeId,
  dependent,
  onSaved,
  onCancel,
}: {
  employeeId: string;
  dependent: EmployeeDependent | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("tracker");
  const tCommon = useTranslations("common");
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: dependent?.full_name ?? "",
    relationship: dependent?.relationship ?? "spouse" as DependentRelationship,
    ssn_on_file: dependent?.ssn_on_file ?? false,
    dob: dependent?.dob ?? "",
    covered_all_12_months: dependent?.covered_all_12_months ?? true,
    months_covered: dependent?.months_covered ?? [1,2,3,4,5,6,7,8,9,10,11,12],
  });

  function toggleMonth(m: number) {
    setForm((prev) => {
      const next = prev.months_covered.includes(m)
        ? prev.months_covered.filter((x) => x !== m)
        : [...prev.months_covered, m].sort((a, b) => a - b);
      return { ...prev, months_covered: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      employee_id: employeeId,
      full_name: form.full_name,
      relationship: form.relationship,
      ssn_on_file: form.ssn_on_file,
      dob: form.dob || null,
      covered_all_12_months: form.covered_all_12_months,
      months_covered: form.covered_all_12_months ? [1,2,3,4,5,6,7,8,9,10,11,12] : form.months_covered,
    };

    let err;
    if (dependent) {
      const r = await supabase.from("employee_dependents").update(payload).eq("id", dependent.id);
      err = r.error;
    } else {
      const r = await supabase.from("employee_dependents").insert(payload);
      err = r.error;
    }

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      onSaved();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 mt-3 space-y-3">
      <h3 className="font-medium text-gray-900 text-sm">
        {dependent ? "Edit Dependent" : t("modals.addDependent")}
      </h3>

      {error && <div className="p-2 bg-red-50 text-red-700 text-xs rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">{tCommon("name")} *</label>
          <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">{t("fields.relationship")} *</label>
          <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value as DependentRelationship })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="spouse">{t("relationships.spouse")}</option>
            <option value="dependent_minor">{t("relationships.dependent_minor")}</option>
            <option value="dependent_adult">{t("relationships.dependent_adult")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">{t("fields.dob")}</label>
          <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div className="flex items-center gap-2 mt-5">
          <input type="checkbox" id="ssn_on_file" checked={form.ssn_on_file}
            onChange={(e) => setForm({ ...form, ssn_on_file: e.target.checked })} className="rounded" />
          <label htmlFor="ssn_on_file" className="text-sm text-gray-700">
            {t("fields.ssn")}
            {(form.relationship === "spouse" || form.relationship === "dependent_adult") && (
              <span className="text-red-500 ml-1">*{tCommon("required")}</span>
            )}
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <input type="checkbox" checked={form.covered_all_12_months}
            onChange={(e) => setForm({ ...form, covered_all_12_months: e.target.checked })} className="rounded" />
          {t("fields.coverageMonths")}
        </label>
        {!form.covered_all_12_months && (
          <div className="flex flex-wrap gap-1.5">
            {MONTHS.map((m, i) => (
              <button
                type="button"
                key={m}
                onClick={() => toggleMonth(i + 1)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  form.months_covered.includes(i + 1)
                    ? "bg-navy-700 text-white border-navy-700"
                    : "bg-white text-gray-600 border-gray-300 hover:border-navy-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">{tCommon("cancel")}</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? tCommon("loading") : dependent ? tCommon("save") : tCommon("add")}
        </button>
      </div>
    </form>
  );
}
