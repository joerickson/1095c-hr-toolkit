"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { EmployeeStatus } from "@/lib/types";

interface Props {
  employee?: EmployeeStatus | null;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function EmployeeModal({ employee, onClose, onSaved, userId }: Props) {
  const t = useTranslations("tracker");
  const tCommon = useTranslations("common");
  const supabase = createClient();
  const isEdit = !!employee;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: employee?.first_name ?? "",
    last_name: employee?.last_name ?? "",
    middle_initial: employee?.middle_initial ?? "",
    ssn_last_four: employee?.ssn_last_four ?? "",
    ssn_on_file: employee?.ssn_on_file ?? false,
    dob: employee?.dob ?? "",
    dob_on_file: employee?.dob_on_file ?? false,
    address_line1: employee?.address_line1 ?? "",
    city: employee?.city ?? "",
    state: employee?.state ?? "",
    zip: employee?.zip ?? "",
    employment_status: employee?.employment_status ?? "active",
    employee_type: employee?.employee_type ?? "full_time",
    hourly_rate: employee?.hourly_rate ? String(employee.hourly_rate) : "",
    hire_date: employee?.hire_date ?? "",
    termination_date: employee?.termination_date ?? "",
    plan_enrolled: employee?.plan_enrolled ?? "",
    stability_start_date: employee?.stability_start_date ?? "",
    notes: employee?.notes ?? "",
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      middle_initial: form.middle_initial || null,
      ssn_last_four: form.ssn_last_four || null,
      ssn_on_file: form.ssn_on_file,
      dob: form.dob || null,
      dob_on_file: form.dob_on_file,
      address_line1: form.address_line1 || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      employment_status: form.employment_status,
      employee_type: form.employee_type,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      hire_date: form.hire_date || null,
      termination_date: form.termination_date || null,
      plan_enrolled: form.plan_enrolled || null,
      stability_start_date: form.stability_start_date || null,
      notes: form.notes || null,
    };

    let err;
    if (isEdit) {
      const r = await supabase
        .from("employees")
        .update({ ...payload, updated_by: userId })
        .eq("id", employee!.id);
      err = r.error;
    } else {
      const r = await supabase
        .from("employees")
        .insert({ ...payload, created_by: userId, updated_by: userId });
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? t("modals.editTitle") : t("modals.addTitle")}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
          )}

          {/* Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.firstName")} *</label>
              <input required value={form.first_name} onChange={(e) => set("first_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.lastName")} *</label>
              <input required value={form.last_name} onChange={(e) => set("last_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.middleInitial")}</label>
              <input value={form.middle_initial} onChange={(e) => set("middle_initial", e.target.value)}
                maxLength={1} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>

          {/* SSN + DOB */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.ssnLastFour")}</label>
              <input value={form.ssn_last_four} onChange={(e) => set("ssn_last_four", e.target.value)}
                maxLength={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="e.g. 1234" />
              <label className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                <input type="checkbox" checked={form.ssn_on_file}
                  onChange={(e) => set("ssn_on_file", e.target.checked)} className="rounded" />
                {t("fields.ssn")}
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.dob")}</label>
              <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <label className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                <input type="checkbox" checked={form.dob_on_file}
                  onChange={(e) => set("dob_on_file", e.target.checked)} className="rounded" />
                {t("fields.dobOnFile")}
              </label>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.address")}</label>
            <input value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
              placeholder="Street address" />
            <div className="grid grid-cols-3 gap-2">
              <input value={form.city} onChange={(e) => set("city", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder={t("fields.city")} />
              <select value={form.state} onChange={(e) => set("state", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">{t("fields.state")}</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={form.zip} onChange={(e) => set("zip", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder={t("fields.zip")} />
            </div>
          </div>

          {/* Employment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.employmentStatus")}</label>
              <select value={form.employment_status} onChange={(e) => set("employment_status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="active">{t("employmentStatus.active")}</option>
                <option value="terminated">{t("employmentStatus.terminated")}</option>
                <option value="leave_of_absence">{t("employmentStatus.leave_of_absence")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.employeeType")}</label>
              <select value={form.employee_type} onChange={(e) => set("employee_type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="full_time">{t("employeeType.full_time")}</option>
                <option value="part_time">{t("employeeType.part_time")}</option>
                <option value="variable">{t("employeeType.variable")}</option>
                <option value="seasonal">{t("employeeType.seasonal")}</option>
              </select>
            </div>
          </div>

          {/* Dates + Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.hireDate")}</label>
              <input type="date" value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.terminationDate")}</label>
              <input type="date" value={form.termination_date} onChange={(e) => set("termination_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.hourlyRate")}</label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-2 text-gray-500 bg-gray-50 text-sm">$</span>
                <input type="number" step="0.01" value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)}
                  className="flex-1 px-2 py-2 text-sm focus:outline-none" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Plan + Stability */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("fields.planEnrolled")}</label>
              <select value={form.plan_enrolled} onChange={(e) => set("plan_enrolled", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">— Not Set —</option>
                <option value="P1">{t("plans.P1")}</option>
                <option value="P2">{t("plans.P2")}</option>
                <option value="P3">{t("plans.P3")}</option>
                <option value="declined">{t("plans.declined")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("fields.stabilityStartDate")}
                <span className="text-amber-600 text-xs ml-1">(required for Line 14)</span>
              </label>
              <input type="date" value={form.stability_start_date} onChange={(e) => set("stability_start_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("notes")}</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">{tCommon("cancel")}</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? tCommon("loading") : isEdit ? tCommon("save") : t("modals.addTitle")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
