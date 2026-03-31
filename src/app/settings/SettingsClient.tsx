"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { AppSettings } from "@/lib/types";

interface Props {
  settings: AppSettings | null;
  userId: string;
}

const DEFAULT: Partial<AppSettings> = {
  tax_year: 2025,
  company_name: "ABC Janitorial Services LLC",
  company_ein: "87-1234567",
  contact_phone: "(801) 555-0100",
  plan_start_month: "01",
  mec_monthly_premium: 145.0,
  safe_harbor_method: "rate_of_pay",
  affordability_threshold: 0.0902,
  fpl_monthly_threshold: 105.29,
};

export default function SettingsClient({ settings, userId }: Props) {
  const { showToast } = useToast();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tax_year: String(settings?.tax_year ?? DEFAULT.tax_year),
    company_name: settings?.company_name ?? DEFAULT.company_name ?? "",
    company_ein: settings?.company_ein ?? DEFAULT.company_ein ?? "",
    contact_phone: settings?.contact_phone ?? DEFAULT.contact_phone ?? "",
    plan_start_month: settings?.plan_start_month ?? DEFAULT.plan_start_month ?? "01",
    mec_monthly_premium: String(settings?.mec_monthly_premium ?? DEFAULT.mec_monthly_premium),
    safe_harbor_method: settings?.safe_harbor_method ?? DEFAULT.safe_harbor_method ?? "rate_of_pay",
    affordability_threshold: String(settings?.affordability_threshold ?? DEFAULT.affordability_threshold),
    fpl_monthly_threshold: String(settings?.fpl_monthly_threshold ?? DEFAULT.fpl_monthly_threshold),
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      tax_year: parseInt(form.tax_year),
      company_name: form.company_name,
      company_ein: form.company_ein,
      contact_phone: form.contact_phone,
      plan_start_month: form.plan_start_month,
      mec_monthly_premium: parseFloat(form.mec_monthly_premium),
      safe_harbor_method: form.safe_harbor_method as AppSettings["safe_harbor_method"],
      affordability_threshold: parseFloat(form.affordability_threshold),
      fpl_monthly_threshold: parseFloat(form.fpl_monthly_threshold),
      updated_by: userId,
    };

    let error;
    if (settings?.id) {
      const r = await supabase.from("app_settings").update(payload).eq("id", settings.id);
      error = r.error;
    } else {
      const r = await supabase.from("app_settings").insert(payload);
      error = r.error;
    }

    setSaving(false);
    if (error) {
      showToast("Failed to save settings: " + error.message, "error");
    } else {
      showToast("Settings saved successfully.", "success");
    }
  }

  const safeHarborLabels = {
    rate_of_pay: "Rate of Pay (2H) — Recommended for hourly workforce",
    w2: "W-2 Safe Harbor (2F)",
    fpl: "Federal Poverty Line (2G)",
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Company-wide ACA configuration. Changes affect wizard calculations and all forms.
        </p>
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Admin only.</strong> These settings are shared across all users and affect how Line 14, 15, and 16 codes are calculated.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Company Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
                <input
                  type="number"
                  value={form.tax_year}
                  onChange={(e) => set("tax_year", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="2020" max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Start Month</label>
                <select
                  value={form.plan_start_month}
                  onChange={(e) => set("plan_start_month", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, "0");
                    const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                    return <option key={m} value={m}>{m} — {names[i]}</option>;
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer EIN</label>
                <input
                  value={form.company_ein}
                  onChange={(e) => set("company_ein", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1095-C Contact Phone</label>
                <input
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACA / Line 15 */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-1">Line 15 — MEC Monthly Premium</h2>
          <p className="text-sm text-gray-500 mb-4">
            This is the Plan 1 (MEC) employee-only monthly premium. It appears on Line 15 of every 1095-C form.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan 1 MEC Employee-Only Monthly Premium
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-48">
              <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">$</span>
              <input
                type="number"
                step="0.01"
                value={form.mec_monthly_premium}
                onChange={(e) => set("mec_monthly_premium", e.target.value)}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
              <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-300">/mo</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Default: $145.00/month (confirm with client each year)</p>
          </div>
        </div>

        {/* Safe Harbor */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-1">Line 16 — Safe Harbor Method</h2>
          <p className="text-sm text-gray-500 mb-4">
            The safe harbor method used for employees who declined all coverage. Applied company-wide.
          </p>
          <div className="space-y-2">
            {(["rate_of_pay", "w2", "fpl"] as const).map((method) => (
              <label key={method} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.safe_harbor_method === method
                  ? "bg-navy-50 border-navy-400"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}>
                <input
                  type="radio"
                  name="safe_harbor_method"
                  value={method}
                  checked={form.safe_harbor_method === method}
                  onChange={() => set("safe_harbor_method", method)}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium text-sm text-gray-900">{safeHarborLabels[method]}</div>
                  {method === "rate_of_pay" && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Formula: (hourly rate × 130 hours) × 9.02% — recommended for hourly workforce
                    </div>
                  )}
                  {method === "w2" && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Formula: (W-2 Box 1 ÷ 12) × 9.02%
                    </div>
                  )}
                  {method === "fpl" && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Premium must be ≤ FPL threshold ($105.29/month for 2025)
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Affordability thresholds */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Affordability Thresholds (2025)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affordability Threshold %
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="number"
                  step="0.0001"
                  value={form.affordability_threshold}
                  onChange={(e) => set("affordability_threshold", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                />
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-300">decimal</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">2025: 0.0902 (9.02%)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                FPL Monthly Threshold
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.fpl_monthly_threshold}
                  onChange={(e) => set("fpl_monthly_threshold", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">2025: $105.29/month</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
