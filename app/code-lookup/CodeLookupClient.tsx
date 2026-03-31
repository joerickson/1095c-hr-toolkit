"use client";

import { useState } from "react";
import { line14Codes } from "@/lib/data/line14-codes";
import { line16Codes } from "@/lib/data/line16-codes";
import type { Line14Code, Line16Code } from "@/lib/types";

type WizardStep = "start" | "line14" | "line15" | "line16" | "result";
type Tab = "wizard" | "reference";

interface WizardState {
  // Line 14 questions
  wasEmployed: boolean | null;
  wasFullTime: boolean | null;
  offerMadeForMonth: boolean | null;
  offerMeetsMinValue: boolean | null;
  dependentCovered: boolean | null;
  spouseCovered: boolean | null;
  isEnrolledSelfInsured: boolean | null;
  isFPLOffer: boolean | null;
  // Line 15
  employeeContribution: string;
  // Line 16
  wasEnrolled: boolean | null;
  inLimitedPeriod: boolean | null;
  isMultiemployer: boolean | null;
  safeHarborUsed: "2F" | "2G" | "2H" | null;
}

const defaultState: WizardState = {
  wasEmployed: null,
  wasFullTime: null,
  offerMadeForMonth: null,
  offerMeetsMinValue: null,
  dependentCovered: null,
  spouseCovered: null,
  isEnrolledSelfInsured: null,
  isFPLOffer: null,
  employeeContribution: "",
  wasEnrolled: null,
  inLimitedPeriod: null,
  isMultiemployer: null,
  safeHarborUsed: null,
};

function YesNoButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg font-medium text-sm border transition-all ${
        active
          ? "bg-blue-700 border-blue-700 text-white shadow"
          : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
      }`}
    >
      {label}
    </button>
  );
}

function determineLine14(s: WizardState): string {
  if (!s.wasEmployed) return "1H";
  if (!s.wasFullTime) {
    if (s.isEnrolledSelfInsured) return "1G";
    return "1H";
  }
  if (!s.offerMadeForMonth) return "1H";
  if (!s.offerMeetsMinValue) return "1F";
  if (s.isFPLOffer) return "1A";
  if (s.dependentCovered && s.spouseCovered) return "1E";
  if (s.dependentCovered && !s.spouseCovered) return "1C";
  if (!s.dependentCovered && s.spouseCovered) return "1D";
  return "1B";
}

function determineLine16(s: WizardState, line14: string): string {
  if (!s.wasEmployed) return "2A";
  if (s.wasEnrolled) return "2C";
  if (s.inLimitedPeriod) return "2D";
  if (s.isMultiemployer) return "2E";
  if (s.safeHarborUsed) return s.safeHarborUsed;
  if (!s.wasFullTime) return "2B";
  return line14 === "1H" ? "" : "2C";
}

export default function CodeLookupClient() {
  const [tab, setTab] = useState<Tab>("wizard");
  const [step, setStep] = useState<WizardStep>("start");
  const [state, setState] = useState<WizardState>(defaultState);
  const [selectedCode14, setSelectedCode14] = useState<Line14Code | null>(null);
  const [selectedCode16, setSelectedCode16] = useState<Line16Code | null>(null);

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setState(defaultState);
    setStep("start");
  }

  const line14Result = step === "result" ? determineLine14(state) : "";
  const line16Result = step === "result" ? determineLine16(state, line14Result) : "";

  const line14Info = line14Codes.find((c) => c.code === line14Result);
  const line16Info = line16Codes.find((c) => c.code === line16Result);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Code Lookup Wizard</h1>
        <p className="text-gray-500 mt-1">
          Identify the correct IRS codes for Lines 14, 15, and 16 of Form 1095-C.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["wizard", "reference"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "wizard" ? "Step-by-Step Wizard" : "Full Code Reference"}
          </button>
        ))}
      </div>

      {/* ── Wizard Tab ── */}
      {tab === "wizard" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === "start" && (
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Identify 1095-C Codes for a Month
              </h2>
              <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                Answer a few questions about an employee&apos;s situation for a specific calendar
                month and we&apos;ll determine the correct Line 14, 15, and 16 codes.
              </p>
              <button
                onClick={() => setStep("line14")}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Start Wizard
              </button>
            </div>
          )}

          {step === "line14" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Line 14 — Offer of Coverage
              </h2>

              {/* Q1 */}
              <div>
                <p className="font-medium text-gray-700 mb-3">
                  Was the employee employed during this month?
                </p>
                <div className="flex gap-3">
                  <YesNoButton label="Yes" active={state.wasEmployed === true} onClick={() => set("wasEmployed", true)} />
                  <YesNoButton label="No" active={state.wasEmployed === false} onClick={() => set("wasEmployed", false)} />
                </div>
              </div>

              {state.wasEmployed === false && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  If not employed, Line 14 = <strong>1H</strong> and Line 16 = <strong>2A</strong>. Proceed to see final result.
                </div>
              )}

              {state.wasEmployed === true && (
                <>
                  <div>
                    <p className="font-medium text-gray-700 mb-3">
                      Was the employee full-time (avg 30+ hrs/week or 130+ hrs/month)?
                    </p>
                    <div className="flex gap-3">
                      <YesNoButton label="Yes" active={state.wasFullTime === true} onClick={() => set("wasFullTime", true)} />
                      <YesNoButton label="No" active={state.wasFullTime === false} onClick={() => set("wasFullTime", false)} />
                    </div>
                  </div>

                  {state.wasFullTime === false && (
                    <div>
                      <p className="font-medium text-gray-700 mb-3">
                        Was the employee enrolled in a self-insured plan for this month?
                      </p>
                      <div className="flex gap-3">
                        <YesNoButton label="Yes" active={state.isEnrolledSelfInsured === true} onClick={() => set("isEnrolledSelfInsured", true)} />
                        <YesNoButton label="No" active={state.isEnrolledSelfInsured === false} onClick={() => set("isEnrolledSelfInsured", false)} />
                      </div>
                    </div>
                  )}

                  {state.wasFullTime === true && (
                    <>
                      <div>
                        <p className="font-medium text-gray-700 mb-3">
                          Was the employee offered health coverage this month?
                        </p>
                        <div className="flex gap-3">
                          <YesNoButton label="Yes" active={state.offerMadeForMonth === true} onClick={() => set("offerMadeForMonth", true)} />
                          <YesNoButton label="No" active={state.offerMadeForMonth === false} onClick={() => set("offerMadeForMonth", false)} />
                        </div>
                      </div>

                      {state.offerMadeForMonth === true && (
                        <>
                          <div>
                            <p className="font-medium text-gray-700 mb-3">
                              Does the plan provide Minimum Value (pays at least 60% of costs)?
                            </p>
                            <div className="flex gap-3">
                              <YesNoButton label="Yes" active={state.offerMeetsMinValue === true} onClick={() => set("offerMeetsMinValue", true)} />
                              <YesNoButton label="No" active={state.offerMeetsMinValue === false} onClick={() => set("offerMeetsMinValue", false)} />
                            </div>
                          </div>

                          {state.offerMeetsMinValue === true && (
                            <>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">
                                  Is this a Qualifying Offer (employee contribution ≤ 9.5% of Federal Poverty Line)?
                                </p>
                                <p className="text-xs text-gray-500 mb-3">
                                  FPL single threshold 2024: ~$103.28/month. If contribution is at or below this, it&apos;s a qualifying offer.
                                </p>
                                <div className="flex gap-3">
                                  <YesNoButton label="Yes (use 1A)" active={state.isFPLOffer === true} onClick={() => set("isFPLOffer", true)} />
                                  <YesNoButton label="No" active={state.isFPLOffer === false} onClick={() => set("isFPLOffer", false)} />
                                </div>
                              </div>

                              {state.isFPLOffer === false && (
                                <>
                                  <div>
                                    <p className="font-medium text-gray-700 mb-3">
                                      Was dependent coverage (children to age 26) offered?
                                    </p>
                                    <div className="flex gap-3">
                                      <YesNoButton label="Yes" active={state.dependentCovered === true} onClick={() => set("dependentCovered", true)} />
                                      <YesNoButton label="No" active={state.dependentCovered === false} onClick={() => set("dependentCovered", false)} />
                                    </div>
                                  </div>

                                  {state.dependentCovered !== null && (
                                    <div>
                                      <p className="font-medium text-gray-700 mb-3">
                                        Was spouse coverage offered?
                                      </p>
                                      <div className="flex gap-3">
                                        <YesNoButton label="Yes" active={state.spouseCovered === true} onClick={() => set("spouseCovered", true)} />
                                        <YesNoButton label="No" active={state.spouseCovered === false} onClick={() => set("spouseCovered", false)} />
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Start over
                </button>
                <button
                  onClick={() => setStep("line15")}
                  disabled={
                    state.wasEmployed === null ||
                    (state.wasEmployed && state.wasFullTime === null) ||
                    (state.wasEmployed && state.wasFullTime === false && state.isEnrolledSelfInsured === null) ||
                    (state.wasFullTime && state.offerMadeForMonth === null) ||
                    (state.offerMadeForMonth && state.offerMeetsMinValue === null) ||
                    (state.offerMeetsMinValue && state.isFPLOffer === null) ||
                    (state.isFPLOffer === false && state.dependentCovered === null) ||
                    (state.isFPLOffer === false && state.dependentCovered !== null && state.spouseCovered === null)
                  }
                  className="ml-auto bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Next: Line 15 →
                </button>
              </div>
            </div>
          )}

          {step === "line15" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Line 15 — Employee Required Contribution
              </h2>
              <p className="text-gray-600 text-sm">
                Line 15 is only required when Line 14 shows{" "}
                <strong>1B, 1C, 1D, or 1E</strong>. Enter the employee&apos;s monthly share of
                the lowest-cost self-only Minimum Essential Coverage plan.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly employee premium contribution ($)
                </label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={state.employeeContribution}
                    onChange={(e) => set("employeeContribution", e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Leave blank or $0 if not applicable (e.g., Line 14 = 1A, 1F, or 1H).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("line14")} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("line16")}
                  className="ml-auto bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Next: Line 16 →
                </button>
              </div>
            </div>
          )}

          {step === "line16" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Line 16 — Section 4980H Safe Harbor
              </h2>

              <div>
                <p className="font-medium text-gray-700 mb-3">
                  Was the employee enrolled in the coverage offered?
                </p>
                <div className="flex gap-3">
                  <YesNoButton label="Yes" active={state.wasEnrolled === true} onClick={() => set("wasEnrolled", true)} />
                  <YesNoButton label="No" active={state.wasEnrolled === false} onClick={() => set("wasEnrolled", false)} />
                </div>
                {state.wasEnrolled && (
                  <p className="text-sm text-green-700 mt-2 bg-green-50 border border-green-200 rounded-lg p-2.5">
                    Line 16 = <strong>2C</strong> (enrolled in coverage). 2C takes priority over other safe harbors.
                  </p>
                )}
              </div>

              {state.wasEnrolled === false && (
                <>
                  <div>
                    <p className="font-medium text-gray-700 mb-3">
                      Was the employee in a Limited Non-Assessment Period (waiting period, initial measurement period)?
                    </p>
                    <div className="flex gap-3">
                      <YesNoButton label="Yes" active={state.inLimitedPeriod === true} onClick={() => set("inLimitedPeriod", true)} />
                      <YesNoButton label="No" active={state.inLimitedPeriod === false} onClick={() => set("inLimitedPeriod", false)} />
                    </div>
                  </div>

                  {state.inLimitedPeriod === false && (
                    <>
                      <div>
                        <p className="font-medium text-gray-700 mb-3">
                          Does a multiemployer plan (union/CBA) apply?
                        </p>
                        <div className="flex gap-3">
                          <YesNoButton label="Yes" active={state.isMultiemployer === true} onClick={() => set("isMultiemployer", true)} />
                          <YesNoButton label="No" active={state.isMultiemployer === false} onClick={() => set("isMultiemployer", false)} />
                        </div>
                      </div>

                      {state.isMultiemployer === false && (
                        <div>
                          <p className="font-medium text-gray-700 mb-3">
                            Which affordability safe harbor applies?
                          </p>
                          <div className="space-y-2">
                            {[
                              { code: "2F" as const, label: "2F — W-2 Safe Harbor", desc: "Employee contribution ≤ 9.5% of W-2 Box 1 wages" },
                              { code: "2G" as const, label: "2G — Federal Poverty Line Safe Harbor", desc: "Employee contribution ≤ 9.5% of FPL / 12" },
                              { code: "2H" as const, label: "2H — Rate of Pay Safe Harbor", desc: "Employee contribution ≤ 9.5% of 130 hrs × hourly rate" },
                            ].map((sh) => (
                              <button
                                key={sh.code}
                                onClick={() => set("safeHarborUsed", sh.code)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                  state.safeHarborUsed === sh.code
                                    ? "border-blue-600 bg-blue-50 text-blue-800"
                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                                }`}
                              >
                                <div className="font-medium text-sm">{sh.label}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{sh.desc}</div>
                              </button>
                            ))}
                            <button
                              onClick={() => set("safeHarborUsed", null)}
                              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                state.safeHarborUsed === null && state.isMultiemployer === false
                                  ? "border-gray-400 bg-gray-50"
                                  : "border-gray-200 hover:border-gray-300 text-gray-500"
                              }`}
                            >
                              <div className="text-sm">None / Leave blank</div>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("line15")} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Back
                </button>
                <button
                  onClick={() => setStep("result")}
                  disabled={state.wasEnrolled === null}
                  className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  See Results →
                </button>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Your 1095-C Codes</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Line 14</div>
                  <div className="text-4xl font-black text-blue-800">{line14Result}</div>
                  <div className="text-sm text-blue-700 mt-1 font-medium">{line14Info?.name}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
                  <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Line 15</div>
                  <div className="text-4xl font-black text-purple-800">
                    {state.employeeContribution ? `$${parseFloat(state.employeeContribution).toFixed(2)}` : "N/A"}
                  </div>
                  <div className="text-sm text-purple-700 mt-1 font-medium">Employee Contribution</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Line 16</div>
                  <div className="text-4xl font-black text-green-800">{line16Result || "—"}</div>
                  <div className="text-sm text-green-700 mt-1 font-medium">{line16Info?.name ?? "Not required"}</div>
                </div>
              </div>

              {/* Explanations */}
              {line14Info && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="font-semibold text-blue-800 mb-1">Line 14 — {line14Info.code}: {line14Info.name}</div>
                  <p className="text-sm text-blue-700">{line14Info.description}</p>
                  <div className="mt-2 text-xs bg-blue-100 rounded-lg p-2.5 text-blue-800">
                    <strong>Tip:</strong> {line14Info.tip}
                  </div>
                </div>
              )}

              {line16Info && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <div className="font-semibold text-green-800 mb-1">Line 16 — {line16Info.code}: {line16Info.name}</div>
                  <p className="text-sm text-green-700">{line16Info.description}</p>
                  <div className="mt-2 text-xs bg-green-100 rounded-lg p-2.5 text-green-800">
                    <strong>Tip:</strong> {line16Info.tip}
                  </div>
                </div>
              )}

              <button
                onClick={reset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-colors"
              >
                ← Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Reference Tab ── */}
      {tab === "reference" && (
        <div className="space-y-8">
          {/* Line 14 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-700 text-white text-xs font-bold px-2.5 py-1 rounded">LINE 14</div>
              <h2 className="text-xl font-semibold text-gray-800">Offer of Coverage Codes</h2>
            </div>
            <div className="grid gap-3">
              {line14Codes.map((code) => (
                <button
                  key={code.code}
                  onClick={() => setSelectedCode14(selectedCode14?.code === code.code ? null : code)}
                  className={`text-left w-full bg-white rounded-xl border p-4 transition-all ${
                    selectedCode14?.code === code.code
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  } ${code.retired ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-blue-800 w-10 shrink-0">{code.code}</span>
                    <div>
                      <span className="font-semibold text-gray-800">{code.name}</span>
                      {code.retired && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Retired</span>
                      )}
                      {selectedCode14?.code === code.code && (
                        <p className="text-sm text-gray-600 mt-2">{code.description}</p>
                      )}
                      {selectedCode14?.code === code.code && (
                        <p className="text-xs bg-blue-50 text-blue-800 rounded-lg p-2 mt-2">
                          <strong>Tip:</strong> {code.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Line 15 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-700 text-white text-xs font-bold px-2.5 py-1 rounded">LINE 15</div>
              <h2 className="text-xl font-semibold text-gray-800">Employee Required Contribution</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-gray-700 text-sm leading-relaxed">
                Line 15 reports the <strong>employee&apos;s share of the lowest-cost monthly premium</strong> for
                self-only Minimum Essential Coverage that provides Minimum Value.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span> Only complete Line 15 when Line 14 = 1B, 1C, 1D, or 1E</li>
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span> Report the amount even if the employee declined coverage</li>
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span> Enter the monthly amount, not the annual total</li>
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span> Used by the IRS to assess affordability under §4980H(b)</li>
              </ul>
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                <strong>2024 Affordability threshold:</strong> 9.02% of household income (W-2, FPL, or Rate of Pay safe harbor)
              </div>
            </div>
          </section>

          {/* Line 16 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded">LINE 16</div>
              <h2 className="text-xl font-semibold text-gray-800">Section 4980H Safe Harbor Codes</h2>
            </div>
            <div className="grid gap-3">
              {line16Codes.map((code) => (
                <button
                  key={code.code}
                  onClick={() => setSelectedCode16(selectedCode16?.code === code.code ? null : code)}
                  className={`text-left w-full bg-white rounded-xl border p-4 transition-all ${
                    selectedCode16?.code === code.code
                      ? "border-green-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-green-800 w-10 shrink-0">{code.code}</span>
                    <div>
                      <span className="font-semibold text-gray-800">{code.name}</span>
                      {selectedCode16?.code === code.code && (
                        <p className="text-sm text-gray-600 mt-2">{code.description}</p>
                      )}
                      {selectedCode16?.code === code.code && (
                        <p className="text-xs bg-green-50 text-green-800 rounded-lg p-2 mt-2">
                          <strong>Tip:</strong> {code.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
