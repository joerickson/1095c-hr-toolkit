"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateCodes, testAffordability, LINE14_CODES, LINE16_CODES } from "@/lib/wizard-logic";
import { useToast } from "@/components/Toast";
import { useTranslations } from "next-intl";
import type { AppSettings, WizardAnswers, WizardResult, WizardSession } from "@/lib/types";

interface Props {
  settings: AppSettings | null;
  userId: string;
  recentSessions: WizardSession[];
}

const DEFAULT_SETTINGS: AppSettings = {
  id: "",
  tax_year: 2025,
  company_name: "RBM Services Inc.",
  company_ein: "87-1234567",
  contact_phone: "(801) 555-0100",
  plan_start_month: "01",
  mec_monthly_premium: 145.0,
  safe_harbor_method: "rate_of_pay",
  affordability_threshold: 0.0902,
  fpl_monthly_threshold: 105.29,
  updated_at: "",
  updated_by: null,
};

type Step = 1 | 2 | 3 | 4 | 5;

export default function WizardClient({ settings, userId, recentSessions }: Props) {
  const cfg = settings ?? DEFAULT_SETTINGS;
  const { showToast } = useToast();
  const supabase = createClient();
  const t = useTranslations("wizard");

  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [result, setResult] = useState<WizardResult | null>(null);
  const [showAffordability, setShowAffordability] = useState(false);
  const [hourlyRate, setHourlyRate] = useState("");
  const [annualW2, setAnnualW2] = useState("");
  const [savedSession, setSavedSession] = useState(false);
  const [activeTab, setActiveTab] = useState<"wizard" | "reference" | "history">("wizard");

  function reset() {
    setStep(1);
    setAnswers({});
    setResult(null);
    setShowAffordability(false);
    setHourlyRate("");
    setAnnualW2("");
    setSavedSession(false);
  }

  function computeResult(finalAnswers: WizardAnswers) {
    const r = calculateCodes(finalAnswers, cfg);
    setResult(r);
    setStep(5);
  }

  async function saveSession(finalAnswers: WizardAnswers, r: WizardResult) {
    if (savedSession) return;
    const { error } = await supabase.from("wizard_sessions").insert({
      user_id: userId,
      tax_year: cfg.tax_year,
      answers: finalAnswers,
      result_line14: r.line14,
      result_line15: r.line15,
      result_line16: r.line16,
      part3_required: r.part3Required,
    });
    if (!error) {
      setSavedSession(true);
      showToast("Lookup saved to history", "success");
    }
  }

  const progressPct = (step / 5) * 100;

  const affordabilityResult =
    showAffordability && result
      ? testAffordability(
          result.line15,
          cfg.safe_harbor_method,
          hourlyRate ? parseFloat(hourlyRate) : undefined,
          annualW2 ? parseFloat(annualW2) : undefined,
          cfg.fpl_monthly_threshold
        )
      : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["wizard", "reference", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-navy-700 text-navy-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "history" ? "History" : tab === "reference" ? "Code Reference" : "Wizard"}
          </button>
        ))}
      </div>

      {/* Wizard tab */}
      {activeTab === "wizard" && (
        <div className="max-w-2xl">
          {step < 5 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Step {step} of 4</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-navy-700 h-2 rounded-full transition-all"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step 1: Is employee full-time this month? */}
          {step === 1 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("step1Title")}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {t("step1Question")}
              </p>
              <div className="space-y-3">
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-navy-400 hover:bg-navy-50 transition-all"
                  onClick={() => {
                    setAnswers({ ...answers, fullTime: true });
                    setStep(2);
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step1OptionYes")}</div>
                </button>
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-navy-400 hover:bg-navy-50 transition-all"
                  onClick={() => {
                    setAnswers({ ...answers, fullTime: false });
                    setStep(2);
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step1OptionNo")}</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Was coverage offered? */}
          {step === 2 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("step2Title")}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {t("step2Question")}
              </p>
              <div className="space-y-3">
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-navy-400 hover:bg-navy-50 transition-all"
                  onClick={() => {
                    setAnswers({ ...answers, offered: "yes" });
                    setStep(3);
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step2OptionYes")}</div>
                </button>
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all"
                  onClick={() => {
                    const a = { ...answers, offered: "waiting_period" as const, who: "all" as const, enrolled: "no" as const };
                    computeResult(a as WizardAnswers);
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step2OptionWaiting")}</div>
                </button>
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all"
                  onClick={() => {
                    const a = { ...answers, offered: "no" as const, who: "all" as const, enrolled: "no" as const };
                    computeResult(a as WizardAnswers);
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step2OptionNo")}</div>
                </button>
              </div>
              <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
                {t("backButton")}
              </button>
            </div>
          )}

          {/* Step 3: Who was coverage offered to? */}
          {step === 3 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("step3Title")}
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                {t("step3Question")}
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4 text-sm text-blue-800">
                <strong>Note for RBM Services Inc.:</strong> All three plans are offered to every eligible employee, spouse, and dependents — so this should always be the last option (→ Code 1E).
              </div>
              <div className="space-y-3">
                {[
                  { value: "all", label: t("step4OptionAll"), desc: "All three categories → Code 1E (standard for RBM Services Inc.)" },
                  { value: "employee_only", label: t("step4OptionEmployee"), desc: "Code 1B" },
                  { value: "employee_dependents", label: t("step4OptionEmployeeDep"), desc: "Code 1C" },
                  { value: "employee_spouse", label: t("step4OptionEmployeeSp"), desc: "Code 1D" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-navy-400 hover:bg-navy-50 transition-all"
                    onClick={() => {
                      setAnswers({ ...answers, who: opt.value as WizardAnswers["who"] });
                      setStep(4);
                    }}
                  >
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
                {t("backButton")}
              </button>
            </div>
          )}

          {/* Step 4: Did employee enroll? */}
          {step === 4 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t("step5Title")}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                {t("step5Question")}
              </p>
              <div className="space-y-3">
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
                  onClick={() => {
                    const a = { ...answers, enrolled: "yes" as const } as WizardAnswers;
                    computeResult(a);
                    saveSession(a, calculateCodes(a, cfg));
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step5OptionYes")}</div>
                  <div className="text-sm text-gray-500 mt-0.5">Employee accepted and enrolled in Plan 1, 2, or 3 → Code 2C</div>
                </button>
                <button
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all"
                  onClick={() => {
                    const a = { ...answers, enrolled: "no" as const } as WizardAnswers;
                    computeResult(a);
                    saveSession(a, calculateCodes(a, cfg));
                  }}
                >
                  <div className="font-medium text-gray-900">{t("step5OptionNo")}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Employee declined all plans → Safe harbor code ({cfg.safe_harbor_method === "w2" ? "2F" : cfg.safe_harbor_method === "fpl" ? "2G" : "2H"})
                  </div>
                </button>
              </div>
              <button onClick={() => setStep(3)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
                {t("backButton")}
              </button>
            </div>
          )}

          {/* Step 5: Results */}
          {step === 5 && result && (
            <div className="space-y-4">
              <div className="card border-2 border-navy-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("resultTitle")}</h2>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: t("line14Label"), value: result.line14, desc: result.line14Description },
                    { label: t("line15Label"), value: `$${result.line15.toFixed(2)}`, desc: "MEC employee-only monthly premium" },
                    { label: t("line16Label"), value: result.line16, desc: result.line16Description },
                  ].map((r) => (
                    <div key={r.label} className="bg-navy-50 border border-navy-200 rounded-lg p-4 text-center">
                      <div className="text-xs font-medium text-navy-600 uppercase tracking-wide mb-1">{r.label}</div>
                      <div className="text-2xl font-bold text-navy-800">{r.value}</div>
                      <div className="text-xs text-navy-600 mt-1">{r.desc}</div>
                    </div>
                  ))}
                </div>

                {result.warnings.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                        <strong>⚠ Note:</strong> {w}
                      </div>
                    ))}
                  </div>
                )}

                {/* Affordability calculator */}
                {result.line16 !== "2C" && result.line16 !== "2A" && result.line16 !== "2D" && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => setShowAffordability(!showAffordability)}
                      className="text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1"
                    >
                      {showAffordability ? "▼" : "▶"} {t("affordabilityTitle")}
                    </button>
                    {showAffordability && (
                      <div className="mt-3 space-y-3">
                        {cfg.safe_harbor_method === "rate_of_pay" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Hourly Rate</label>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                className="w-32 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="e.g. 15.00"
                              />
                              <span className="text-gray-500 text-sm">/hr</span>
                            </div>
                          </div>
                        )}
                        {cfg.safe_harbor_method === "w2" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Annual W-2 Box 1 Wages</label>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                value={annualW2}
                                onChange={(e) => setAnnualW2(e.target.value)}
                                className="w-40 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                placeholder="e.g. 25000"
                              />
                            </div>
                          </div>
                        )}
                        {affordabilityResult && (
                          <div className={`p-3 rounded-md border text-sm ${
                            affordabilityResult.affordable
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}>
                            <div className="font-semibold mb-1">
                              {affordabilityResult.affordable ? `✓ ${t("affordabilityPass")}` : `✕ ${t("affordabilityFail")}`}
                            </div>
                            <div>{affordabilityResult.detail}</div>
                            <div className="mt-1">
                              Line 15 premium: ${result.line15.toFixed(2)} / Max affordable: ${affordabilityResult.maxAffordable.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={reset} className="btn-primary">
                {t("lookupAnother")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Code Reference tab */}
      {activeTab === "reference" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line 14 — Offer of Coverage Codes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700 w-20">Code</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(LINE14_CODES).map(([code, desc]) => (
                    <tr key={code} className={code === "1E" ? "bg-blue-50" : ""}>
                      <td className="px-4 py-2.5 font-bold text-navy-700">{code}</td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {desc}
                        {code === "1E" && (
                          <span className="ml-2 badge-info">Standard for RBM Services Inc.</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line 16 — Section 4980H Safe Harbor Codes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700 w-20">Code</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(LINE16_CODES).map(([code, desc]) => {
                    const isStandard = (code === "2C") || (code === "2H" && cfg.safe_harbor_method === "rate_of_pay");
                    return (
                      <tr key={code} className={isStandard ? "bg-blue-50" : ""}>
                        <td className="px-4 py-2.5 font-bold text-navy-700">{code}</td>
                        <td className="px-4 py-2.5 text-gray-700">
                          {desc}
                          {isStandard && (
                            <span className="ml-2 badge-info">Common for RBM Services Inc.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Rules for RBM Services Inc.</h2>
            <div className="space-y-2 text-sm">
              {[
                { icon: "1", text: "Line 14 is ALWAYS 1E for every eligible employee — all three plans are offered to everyone." },
                { icon: "2", text: `Line 15 is ALWAYS $${cfg.mec_monthly_premium.toFixed(2)}/month (Plan 1 MEC employee-only premium).` },
                { icon: "3", text: "Line 16 is 2C if enrolled in ANY plan, or 2H (Rate of Pay safe harbor) if declined." },
                { icon: "4", text: "Part III required ONLY for Plan 1 (MEC) and Plan 2 (Self-Insured Full) employees — NOT Plan 3." },
                { icon: "5", text: "Code 1F should NEVER appear on these forms — full-coverage plans are always offered." },
              ].map((rule) => (
                <div key={rule.icon} className="flex gap-3 p-3 bg-gray-50 rounded-md">
                  <span className="flex-shrink-0 w-6 h-6 bg-navy-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {rule.icon}
                  </span>
                  <span className="text-gray-700">{rule.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Lookups</h2>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-sm">No lookups yet. Run the wizard to see history here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">{t("line14Label")}</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">{t("line15Label")}</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">{t("line16Label")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSessions.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 text-gray-500">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 font-bold text-navy-700">{s.result_line14 ?? "—"}</td>
                      <td className="px-3 py-2">{s.result_line15 ? `$${Number(s.result_line15).toFixed(2)}` : "—"}</td>
                      <td className="px-3 py-2 font-bold text-navy-700">{s.result_line16 ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
