'use client'

import { useState } from 'react'

// Line 14 codes
const LINE14_CODES = [
  { code: '1A', label: 'Qualifying Offer', desc: 'MEC providing MV offered to FT employee with employee contribution ≤ 9.5% of mainland federal poverty line (self-only).' },
  { code: '1B', label: 'Employee Only', desc: 'MEC providing MV offered to employee only.' },
  { code: '1C', label: 'Employee + Dependents', desc: 'MEC providing MV offered to employee and at least MEC offered to dependent(s) — NOT offered to spouse.' },
  { code: '1D', label: 'Employee + Spouse', desc: 'MEC providing MV offered to employee and at least MEC offered to spouse — NOT offered to dependents.' },
  { code: '1E', label: 'Employee + Spouse + Dependents', desc: 'MEC providing MV offered to employee and at least MEC offered to dependents and spouse.' },
  { code: '1F', label: 'No MV Plan Offered', desc: 'MEC NOT providing MV offered to employee; or at least MEC (not MV) offered to employee, spouse, or dependents.' },
  { code: '1G', label: 'Self-Insured, Not Full-Time', desc: 'Offer of coverage to employee who was not full-time for any month of the year AND enrolled in employer self-insured coverage.' },
  { code: '1H', label: 'No Offer', desc: 'No offer of coverage (employee not offered any MEC).' },
  { code: '1J', label: 'MV to Employee; No MEC to Spouse; MEC to Dependents', desc: 'MEC providing MV offered to employee; MEC NOT offered to spouse; MEC offered to dependents.' },
  { code: '1K', label: 'MV to Employee; Conditional MEC to Spouse; MEC to Dependents', desc: 'MEC providing MV offered to employee; MEC conditionally offered to spouse; MEC offered to dependents.' },
]

// Line 16 codes
const LINE16_CODES = [
  { code: '2A', label: 'Not Employed', desc: 'Employee not employed during the month.' },
  { code: '2B', label: 'Not Full-Time', desc: 'Employee not a full-time employee for the month.' },
  { code: '2C', label: 'Enrolled in Coverage', desc: 'Employee enrolled in coverage offered by the employer for the month.' },
  { code: '2D', label: 'Waiting Period (LNAP)', desc: 'Employee in a Limited Non-Assessment Period (e.g., initial measurement period or waiting period).' },
  { code: '2E', label: 'Multiemployer Relief', desc: 'Multiemployer interim rule relief — employer contributing to a multiemployer plan.' },
  { code: '2F', label: 'W-2 Safe Harbor', desc: 'Section 4980H affordability Form W-2 wages safe harbor.' },
  { code: '2G', label: 'Federal Poverty Line Safe Harbor', desc: 'Section 4980H affordability federal poverty line safe harbor.' },
  { code: '2H', label: 'Rate of Pay Safe Harbor', desc: 'Section 4980H affordability rate of pay safe harbor.' },
]

type Step = 'start' | 'line14' | 'line16' | 'result'

type Answers = {
  wasEmployed: boolean | null
  wasFullTime: boolean | null
  wasMecOffered: boolean | null
  wasMvOffered: boolean | null
  wasQualifyingOffer: boolean | null
  dependentCovered: boolean | null
  spouseCovered: boolean | null
  spouseConditional: boolean | null
  enrolledInCoverage: boolean | null
  inWaitingPeriod: boolean | null
  multiemployer: boolean | null
  safeHarbor: '2F' | '2G' | '2H' | 'none' | null
  employeeShare: string
}

const defaultAnswers: Answers = {
  wasEmployed: null,
  wasFullTime: null,
  wasMecOffered: null,
  wasMvOffered: null,
  wasQualifyingOffer: null,
  dependentCovered: null,
  spouseCovered: null,
  spouseConditional: null,
  enrolledInCoverage: null,
  inWaitingPeriod: null,
  multiemployer: null,
  safeHarbor: null,
  employeeShare: '',
}

function YesNo({ question, value, onChange }: { question: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-6">
      <p className="text-gray-800 font-medium mb-3">{question}</p>
      <div className="flex gap-3">
        <button
          onClick={() => onChange(true)}
          className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value === true
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value === false
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          No
        </button>
      </div>
    </div>
  )
}

function CodeBadge({ code, label, desc }: { code: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-2xl font-bold text-blue-700 leading-none mt-0.5 w-8 flex-shrink-0">{code}</span>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-gray-600 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function derive14(a: Answers): string {
  if (a.wasEmployed === false) return '1H'
  if (a.wasFullTime === false && a.wasMecOffered === true) return '1G'
  if (a.wasMecOffered === false) return '1H'
  if (a.wasMvOffered === false) return '1F'
  if (a.wasQualifyingOffer === true) return '1A'
  if (a.dependentCovered === true && a.spouseCovered === true) {
    if (a.spouseConditional === true) return '1K'
    return '1E'
  }
  if (a.dependentCovered === true && a.spouseCovered === false) return '1J'
  if (a.spouseCovered === true && a.dependentCovered === false) return '1D'
  if (a.dependentCovered === false && a.spouseCovered === false) return '1B'
  return '1B'
}

function derive16(a: Answers): string {
  if (a.wasEmployed === false) return '2A'
  if (a.wasFullTime === false) return '2B'
  if (a.enrolledInCoverage === true) return '2C'
  if (a.inWaitingPeriod === true) return '2D'
  if (a.multiemployer === true) return '2E'
  if (a.safeHarbor === '2F') return '2F'
  if (a.safeHarbor === '2G') return '2G'
  if (a.safeHarbor === '2H') return '2H'
  return ''
}

export default function CodeLookupPage() {
  const [answers, setAnswers] = useState<Answers>(defaultAnswers)
  const [step, setStep] = useState<'line14' | 'line16' | 'result'>('line14')

  const set = (key: keyof Answers, val: boolean | string | '2F' | '2G' | '2H' | 'none') =>
    setAnswers((prev) => ({ ...prev, [key]: val }))

  const handleReset = () => {
    setAnswers(defaultAnswers)
    setStep('line14')
  }

  const line14Code = derive14(answers)
  const line16Code = derive16(answers)

  const l14 = LINE14_CODES.find((c) => c.code === line14Code)
  const l16 = LINE16_CODES.find((c) => c.code === line16Code)

  // Determine if Line 14 questions are sufficient to move to result
  const line14Complete =
    answers.wasEmployed !== null &&
    (answers.wasEmployed === false ||
      (answers.wasFullTime !== null &&
        (answers.wasFullTime === false ||
          (answers.wasMecOffered !== null &&
            (answers.wasMecOffered === false ||
              (answers.wasMvOffered !== null &&
                (answers.wasMvOffered === false ||
                  (answers.wasQualifyingOffer !== null &&
                    (answers.wasQualifyingOffer === true ||
                      (answers.dependentCovered !== null && answers.spouseCovered !== null))))))))))

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Code Lookup Wizard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Answer questions about the employee&apos;s situation to determine the correct codes for Lines 14, 15, and 16.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['line14', 'line16', 'result'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-blue-600 text-white' :
              (i === 0 && (step === 'line16' || step === 'result')) || (i === 1 && step === 'result')
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {((i === 0 && (step === 'line16' || step === 'result')) || (i === 1 && step === 'result')) ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {s === 'line14' ? 'Line 14' : s === 'line16' ? 'Line 16' : 'Result'}
            </span>
            {i < 2 && <div className="w-6 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Line 14 Questions */}
        {step === 'line14' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Line 14 — Offer of Coverage</h2>
            <p className="text-xs text-gray-500 mb-5">Answer for the relevant month(s).</p>

            <YesNo
              question="Was the employee employed during this period?"
              value={answers.wasEmployed}
              onChange={(v) => set('wasEmployed', v)}
            />

            {answers.wasEmployed === true && (
              <YesNo
                question="Was the employee a full-time employee (averaging 30+ hours/week)?"
                value={answers.wasFullTime}
                onChange={(v) => set('wasFullTime', v)}
              />
            )}

            {answers.wasEmployed === true && answers.wasFullTime !== null && (
              <YesNo
                question="Was Minimum Essential Coverage (MEC) offered to the employee?"
                value={answers.wasMecOffered}
                onChange={(v) => set('wasMecOffered', v)}
              />
            )}

            {answers.wasMecOffered === true && (
              <YesNo
                question="Did the offered plan provide Minimum Value (MV) — covering at least 60% of costs?"
                value={answers.wasMvOffered}
                onChange={(v) => set('wasMvOffered', v)}
              />
            )}

            {answers.wasMvOffered === true && (
              <YesNo
                question="Was this a Qualifying Offer? (Employee's required contribution ≤ 9.5% of the federal poverty line for self-only coverage)"
                value={answers.wasQualifyingOffer}
                onChange={(v) => set('wasQualifyingOffer', v)}
              />
            )}

            {answers.wasMvOffered === true && answers.wasQualifyingOffer === false && (
              <>
                <YesNo
                  question="Was MEC offered to the employee's dependents (children)?"
                  value={answers.dependentCovered}
                  onChange={(v) => set('dependentCovered', v)}
                />
                <YesNo
                  question="Was MEC offered to the employee's spouse?"
                  value={answers.spouseCovered}
                  onChange={(v) => set('spouseCovered', v)}
                />
                {answers.spouseCovered === true && (
                  <YesNo
                    question="Was the spouse offer conditional (e.g., not eligible if covered elsewhere)?"
                    value={answers.spouseConditional}
                    onChange={(v) => set('spouseConditional', v)}
                  />
                )}
              </>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                {line14Complete && (
                  <span className="text-sm text-green-600 font-medium">
                    Suggested: <strong>{line14Code}</strong>
                  </span>
                )}
              </div>
              <button
                disabled={!line14Complete}
                onClick={() => setStep('line16')}
                className="btn-primary"
              >
                Next: Line 16 →
              </button>
            </div>
          </div>
        )}

        {/* Line 16 Questions */}
        {step === 'line16' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Line 16 — Safe Harbor</h2>
            <p className="text-xs text-gray-500 mb-5">Determines affordability safe harbor or other relief.</p>

            {answers.wasEmployed === false ? (
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                Since the employee was not employed, code <strong>2A</strong> applies automatically.
              </p>
            ) : answers.wasFullTime === false ? (
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                Since the employee was not full-time, code <strong>2B</strong> applies automatically.
              </p>
            ) : (
              <>
                <YesNo
                  question="Was the employee enrolled in the employer's offered coverage this month?"
                  value={answers.enrolledInCoverage}
                  onChange={(v) => set('enrolledInCoverage', v)}
                />

                {answers.enrolledInCoverage === false && (
                  <YesNo
                    question="Was the employee in an initial measurement period or waiting period (LNAP)?"
                    value={answers.inWaitingPeriod}
                    onChange={(v) => set('inWaitingPeriod', v)}
                  />
                )}

                {answers.enrolledInCoverage === false && answers.inWaitingPeriod === false && (
                  <YesNo
                    question="Does the multiemployer interim rule relief apply?"
                    value={answers.multiemployer}
                    onChange={(v) => set('multiemployer', v)}
                  />
                )}

                {answers.enrolledInCoverage === false && answers.inWaitingPeriod === false && answers.multiemployer === false && (
                  <div className="mb-6">
                    <p className="text-gray-800 font-medium mb-3">Which affordability safe harbor applies?</p>
                    <div className="space-y-2">
                      {[
                        { val: '2F', label: 'W-2 Wages Safe Harbor (2F)', desc: 'Based on employee\'s prior year W-2 wages' },
                        { val: '2G', label: 'Federal Poverty Line Safe Harbor (2G)', desc: 'Based on the mainland federal poverty line' },
                        { val: '2H', label: 'Rate of Pay Safe Harbor (2H)', desc: 'Based on employee\'s rate of pay' },
                        { val: 'none', label: 'None / Leave blank', desc: 'No safe harbor applies' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => set('safeHarbor', opt.val as '2F' | '2G' | '2H' | 'none')}
                          className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                            answers.safeHarbor === opt.val
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="font-medium text-gray-900">{opt.label}</span>
                          <p className="text-gray-500 text-xs mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Line 15 */}
            <div className="mb-6 mt-4">
              <label className="label">
                Line 15 — Employee Required Contribution (monthly, $)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 123.45"
                value={answers.employeeShare}
                onChange={(e) => set('employeeShare', e.target.value)}
                className="input max-w-xs"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank if Line 14 code is 1A, 1F, 1G, or 1H.</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
              <button onClick={() => setStep('line14')} className="btn-secondary">
                ← Back
              </button>
              <button onClick={() => setStep('result')} className="btn-primary">
                See Results →
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Recommended Codes</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Line 14 — Offer of Coverage</p>
                {l14 ? (
                  <CodeBadge code={l14.code} label={l14.label} desc={l14.desc} />
                ) : (
                  <p className="text-sm text-gray-500">Unable to determine — please review answers.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Line 15 — Employee Share</p>
                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-2xl font-bold text-gray-700 w-8">$</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {answers.employeeShare ? `$${parseFloat(answers.employeeShare).toFixed(2)} / month` : 'Not entered'}
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">Required if employee contribution is less than 9.5% affordability threshold.</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Line 16 — Safe Harbor / Relief</p>
                {line16Code && l16 ? (
                  <CodeBadge code={l16.code} label={l16.label} desc={l16.desc} />
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">Leave blank — no safe harbor or relief code applies.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
              <strong>Important:</strong> These codes are suggestions based on your answers. Always verify against the latest IRS Form 1095-C instructions and consult your benefits advisor for complex situations.
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={() => setStep('line16')} className="btn-secondary">
                ← Back
              </button>
              <button onClick={handleReset} className="btn-primary">
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reference */}
      <details className="mt-6 card p-4">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer">View All Codes Reference</summary>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Line 14 Codes</h3>
            <div className="space-y-2">
              {LINE14_CODES.map((c) => (
                <div key={c.code} className="text-sm">
                  <span className="font-bold text-blue-700">{c.code}</span>
                  <span className="text-gray-600 ml-2">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Line 16 Codes</h3>
            <div className="space-y-2">
              {LINE16_CODES.map((c) => (
                <div key={c.code} className="text-sm">
                  <span className="font-bold text-blue-700">{c.code}</span>
                  <span className="text-gray-600 ml-2">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
