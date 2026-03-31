'use client'

import { useState } from 'react'

type Section = {
  id: string
  title: string
  badge?: string
  badgeColor?: string
  content: React.ReactNode
}

function AccordionSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          {section.badge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${section.badgeColor ?? 'bg-gray-100 text-gray-600'}`}>
              {section.badge}
            </span>
          )}
          <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-700 border-t border-gray-100">
          <div className="pt-4">{section.content}</div>
        </div>
      )}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-5 last:mb-0">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">{title}</p>
        <div className="text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
      <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

const sections: Section[] = [
  {
    id: 'overview',
    title: 'Overview: WinTeam & ACA Reporting',
    badge: 'Start Here',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: (
      <div>
        <p className="mb-3">
          WinTeam (now rebranded as <strong>Aspire Software</strong>) is a workforce management platform widely used by janitorial and facility services companies. It includes an ACA module that tracks employee eligibility and generates 1095-C data for reporting.
        </p>
        <p className="mb-3">
          For ABC Janitorial Services, WinTeam is the <strong>source of truth</strong> for:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-1">
          <li>Employee hours worked per month (for FTE determination)</li>
          <li>Benefits enrollment status</li>
          <li>Offer of coverage tracking</li>
          <li>Generation of 1095-C data for IRS filing</li>
        </ul>
        <Note>
          Ensure WinTeam is updated to the latest version before beginning ACA reporting. Contact Aspire support if your version predates 2022.
        </Note>
      </div>
    ),
  },
  {
    id: 'initial-setup',
    title: 'Step 1: Initial System Setup',
    badge: 'Setup',
    badgeColor: 'bg-slate-100 text-slate-700',
    content: (
      <div>
        <Step n={1} title="Configure Company Information">
          Navigate to <code className="bg-gray-100 px-1 rounded">System → Company Setup → ACA Settings</code>.
          Enter your company EIN, contact name, address, and confirm the applicable large employer (ALE) status. For ABC Janitorial, select <strong>ALE Member</strong> if you have 50+ FTE employees.
        </Step>
        <Step n={2} title="Set the Plan Year">
          In <code className="bg-gray-100 px-1 rounded">ACA Settings → Plan Year</code>, confirm your plan year type:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li><strong>Calendar Year</strong>: Jan 1 – Dec 31 (most common)</li>
            <li><strong>Non-Calendar Year</strong>: requires transition relief documentation</li>
          </ul>
        </Step>
        <Step n={3} title="Configure Benefit Plans">
          Go to <code className="bg-gray-100 px-1 rounded">Human Resources → Benefits → Plan Setup</code>.
          For each health plan:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>Mark whether the plan provides <strong>Minimum Value (MV)</strong></li>
            <li>Enter employee-only monthly premium amount</li>
            <li>Mark as <strong>MEC</strong> (Minimum Essential Coverage)</li>
            <li>Set plan effective dates</li>
          </ul>
        </Step>
        <Step n={4} title="Verify Employee Profiles">
          In <code className="bg-gray-100 px-1 rounded">HR → Employee → Employee Master</code>, verify:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>SSN is entered correctly for all employees</li>
            <li>Date of birth and hire date are accurate</li>
            <li>Employment status and job classification are current</li>
          </ul>
        </Step>
        <Note>
          SSN errors are one of the top IRS rejection reasons. Run the <strong>SSN Verification Report</strong> (under HR Reports) before generating 1095-Cs.
        </Note>
      </div>
    ),
  },
  {
    id: 'measurement-periods',
    title: 'Step 2: Measurement Periods & ALE Determination',
    badge: 'Compliance',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    content: (
      <div>
        <Step n={1} title="Configure Measurement Method">
          Navigate to <code className="bg-gray-100 px-1 rounded">ACA → Measurement Settings</code>.
          Choose your method:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li><strong>Monthly Measurement</strong>: Track hours month-by-month. Simpler for janitorial with variable staff.</li>
            <li><strong>Look-Back Measurement</strong>: Use a standard measurement period (3–12 months) to determine full-time status. Better for stable workforces.</li>
          </ul>
        </Step>
        <Step n={2} title="Set Standard Hours Threshold">
          In Measurement Settings, confirm the FTE threshold is set to <strong>130 hours/month</strong> (30 hours/week × 4.33 weeks) as required by the ACA.
        </Step>
        <Step n={3} title="Review Variable Hour Employee Classifications">
          For janitorial staff with variable hours, ensure employees are classified as:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li><strong>Variable Hour Employee</strong> — if their hours are uncertain at hire</li>
            <li><strong>Seasonal Employee</strong> — if employed ≤ 6 months and annually recurring</li>
            <li><strong>Part-Time</strong> — if consistently under 130 hours/month</li>
          </ul>
        </Step>
        <Step n={4} title="Run ALE Determination Report">
          Go to <code className="bg-gray-100 px-1 rounded">ACA → Reports → ALE Determination</code>. This report calculates your average monthly FTEs using the prior calendar year and confirms whether you meet the 50+ FTE threshold.
        </Step>
      </div>
    ),
  },
  {
    id: 'offer-tracking',
    title: 'Step 3: Tracking Offers of Coverage',
    badge: 'Line 14',
    badgeColor: 'bg-blue-100 text-blue-700',
    content: (
      <div>
        <Step n={1} title="Enter Offer of Coverage Records">
          Navigate to <code className="bg-gray-100 px-1 rounded">HR → Benefits → Offer of Coverage</code>.
          For each eligible employee, enter:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>Date coverage was offered</li>
            <li>Plan offered (must be linked to a configured benefit plan)</li>
            <li>Whether offer was extended to spouse and dependents</li>
            <li>Employee response (accepted/declined/no response)</li>
          </ul>
        </Step>
        <Step n={2} title="Batch Offer Entry for Open Enrollment">
          If all employees were offered the same plan, use <code className="bg-gray-100 px-1 rounded">ACA → Batch Offer Entry</code> to process offers in bulk. Filter by department or job class to process janitorial staff separately.
        </Step>
        <Step n={3} title="Verify Offer Dates Align with Hire Dates">
          Run <code className="bg-gray-100 px-1 rounded">ACA → Reports → Offer Compliance</code> to identify any employees who should have been offered coverage but weren't, or where offer dates fall outside the allowable waiting period.
        </Step>
        <Note>
          The maximum waiting period for coverage is 90 days from the employee's first day. Employees in the waiting period receive code <strong>2D</strong> on Line 16.
        </Note>
      </div>
    ),
  },
  {
    id: 'enrollment-line15',
    title: 'Step 4: Enrollment & Employee Contributions (Line 15)',
    badge: 'Line 15',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    content: (
      <div>
        <Step n={1} title="Verify Employee Enrollment Records">
          Go to <code className="bg-gray-100 px-1 rounded">HR → Benefits → Enrollment</code>.
          Confirm that enrollment and waiver records are complete for all full-time employees throughout the year.
        </Step>
        <Step n={2} title="Configure Employee Premium Contributions">
          In <code className="bg-gray-100 px-1 rounded">Benefits → Plan Setup → Employee Rates</code>:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>Enter the employee-only (self-only) monthly premium amount</li>
            <li>This is the amount used for <strong>Line 15</strong> — the employee's required contribution</li>
            <li>Enter separate rates if premiums changed during the year</li>
          </ul>
        </Step>
        <Step n={3} title="Run Affordability Check">
          Use <code className="bg-gray-100 px-1 rounded">ACA → Reports → Affordability Analysis</code>. This checks employee contributions against:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li><strong>W-2 Safe Harbor</strong>: ≤ 9.02% of Box 1 W-2 wages (2024)</li>
            <li><strong>Federal Poverty Line Safe Harbor</strong>: ≤ $103.28/month (2024)</li>
            <li><strong>Rate of Pay Safe Harbor</strong>: ≤ 9.02% of monthly rate of pay</li>
          </ul>
        </Step>
        <Note>
          For 2024, the ACA affordability threshold is 8.39% (for plan years beginning in 2024). Confirm the current year percentage in WinTeam's ACA Settings.
        </Note>
      </div>
    ),
  },
  {
    id: 'generating-1095c',
    title: 'Step 5: Generating 1095-C Forms',
    badge: 'Filing',
    badgeColor: 'bg-purple-100 text-purple-700',
    content: (
      <div>
        <Step n={1} title="Run the Pre-Generation Validation Report">
          Before generating forms, go to <code className="bg-gray-100 px-1 rounded">ACA → Reports → Pre-Filing Validation</code>. Resolve all errors (red items) before proceeding. Warnings (yellow) should be reviewed but may not require correction.
        </Step>
        <Step n={2} title="Generate 1095-C Forms">
          Navigate to <code className="bg-gray-100 px-1 rounded">ACA → 1095-C Processing → Generate Forms</code>:
          <ol className="list-decimal list-inside mt-1 ml-2 space-y-1 text-gray-600">
            <li>Select tax year (e.g., 2024)</li>
            <li>Confirm company EIN and contact info</li>
            <li>Select employee groups to include (or All)</li>
            <li>Click <strong>Generate</strong></li>
          </ol>
          WinTeam will auto-populate Lines 14, 15, and 16 based on entered data.
        </Step>
        <Step n={3} title="Review Generated Forms">
          In <code className="bg-gray-100 px-1 rounded">ACA → 1095-C → Review</code>, spot-check a sample of forms:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>Long-tenured full-time employees should typically show code <strong>1E</strong> or <strong>1A</strong> on Line 14</li>
            <li>Enrolled employees should show <strong>2C</strong> on Line 16</li>
            <li>Line 15 should match your plan&apos;s employee-only premium</li>
          </ul>
        </Step>
        <Step n={4} title="Generate 1094-C Transmittal">
          After reviewing 1095-Cs, go to <code className="bg-gray-100 px-1 rounded">ACA → 1094-C → Generate Transmittal</code>. Confirm:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>Total number of 1095-Cs submitted</li>
            <li>Minimum Essential Coverage Offer Indicator (Part II, Line 22)</li>
            <li>Full-time employee count per month</li>
            <li>Total employee count per month</li>
          </ul>
        </Step>
      </div>
    ),
  },
  {
    id: 'distribution',
    title: 'Step 6: Form Distribution to Employees',
    badge: 'Jan 31',
    badgeColor: 'bg-red-100 text-red-700',
    content: (
      <div>
        <Step n={1} title="Print or Export Forms">
          Go to <code className="bg-gray-100 px-1 rounded">ACA → 1095-C → Print / Export</code>. You can:
          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 text-gray-600">
            <li>Print forms for mailing (use IRS-approved paper stock)</li>
            <li>Export as PDF for email/electronic distribution</li>
          </ul>
        </Step>
        <Step n={2} title="Electronic Consent for Janitorial Staff">
          Electronic distribution is allowed only with employee consent. In WinTeam Employee Self-Service (ESS), ensure employees have opted in. For field staff without ESS access, provide paper copies.
        </Step>
        <Step n={3} title="Document Undeliverable Forms">
          Maintain a log of any forms returned as undeliverable. Make reasonable attempts to locate correct addresses. Document these efforts in the employee record under <code className="bg-gray-100 px-1 rounded">HR → Employee → Notes</code>.
        </Step>
        <Note>
          Deadline: Employee copies must be furnished (postmarked or distributed electronically) by <strong>January 31</strong>.
        </Note>
      </div>
    ),
  },
  {
    id: 'irs-submission',
    title: 'Step 7: IRS Electronic Submission',
    badge: 'Mar 31',
    badgeColor: 'bg-red-100 text-red-700',
    content: (
      <div>
        <Step n={1} title="Export ACA XML File">
          Go to <code className="bg-gray-100 px-1 rounded">ACA → IRS Submission → Export XML</code>. WinTeam generates an IRS-compliant ACA XML file for electronic filing via the IRS AIR (Affordable Care Act Information Returns) system.
        </Step>
        <Step n={2} title="Register with IRS AIR System">
          If not already registered, go to the IRS e-Services portal and register for the ACA Transmitter Control Code (TCC). This is required for electronic filing. The TCC is typically obtained by the company or a third-party filer.
        </Step>
        <Step n={3} title="Submit via IRS AIR">
          Upload the XML to the IRS AIR Production Environment. After submission, download and save the IRS acknowledgment file. A status of <strong>Accepted</strong> means your filing is complete.
        </Step>
        <Step n={4} title="Handle Corrections if Needed">
          If the IRS returns errors, navigate to <code className="bg-gray-100 px-1 rounded">ACA → Corrections</code> in WinTeam to make targeted corrections and resubmit. Common errors include incorrect SSNs, missing offer codes, and name/SSN mismatches.
        </Step>
        <Note>
          Electronic filing deadline: <strong>March 31</strong>. Paper filing deadline: February 28. Companies filing 10+ returns must file electronically.
        </Note>
      </div>
    ),
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Troubleshooting',
    badge: 'Tips',
    badgeColor: 'bg-gray-100 text-gray-700',
    content: (
      <div className="space-y-4">
        {[
          {
            issue: 'Employee missing from 1095-C generation',
            fix: 'Check that the employee has an active record for the tax year. Go to HR → Employee and verify their termination date is not set incorrectly. Also check that their hours exceeded the FTE threshold in at least one month.',
          },
          {
            issue: 'Line 14 shows 1H (No Offer) unexpectedly',
            fix: 'Verify the offer of coverage record was entered and tied to the correct benefit plan. Go to HR → Benefits → Offer of Coverage and check for the specific employee.',
          },
          {
            issue: 'Line 15 amount is blank or $0.00',
            fix: 'Check that the employee-only monthly premium rate is entered in Benefits → Plan Setup → Employee Rates. Also verify the offer code is not 1A, 1H, or 1G (which do not require Line 15).',
          },
          {
            issue: 'IRS rejection: Name/TIN mismatch',
            fix: 'This means the SSN and name combination does not match IRS records. Verify with the employee, correct in WinTeam under HR → Employee, and resubmit a correction.',
          },
          {
            issue: 'Hours not importing correctly',
            fix: 'If using timekeeping integration, verify the sync settings in System → Integrations. Confirm hours are being imported to the correct pay period and employee record.',
          },
          {
            issue: 'WinTeam showing 0 FTEs for a month',
            fix: 'Ensure the ACA measurement configuration is complete and payroll has been processed for all periods in the year. Run Payroll Audit Report for the affected month.',
          },
        ].map((item) => (
          <div key={item.issue} className="border border-gray-200 rounded-lg p-4">
            <p className="font-medium text-gray-900 text-sm mb-1">{item.issue}</p>
            <p className="text-gray-600 text-sm">{item.fix}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'contacts',
    title: 'Key Contacts & Resources',
    badge: 'Reference',
    badgeColor: 'bg-gray-100 text-gray-700',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Aspire/WinTeam Support', detail: 'support.aspiresoftware.com\n1-800-ASPIRE-1 (support line)', icon: '🛠️' },
            { title: 'IRS ACA Resources', detail: 'irs.gov/affordable-care-act\nIRS ACA helpline: 1-800-919-0452', icon: '🏛️' },
            { title: 'IRS AIR Program', detail: 'For electronic filing enrollment\nirs.gov/e-file-providers/air', icon: '📤' },
            { title: 'Internal HR Team', detail: 'Document your internal HR contact info here for reference', icon: '👥' },
          ].map((c) => (
            <div key={c.title} className="bg-gray-50 rounded-lg p-4">
              <p className="text-lg mb-1">{c.icon}</p>
              <p className="font-medium text-gray-900 text-sm">{c.title}</p>
              <p className="text-gray-600 text-xs whitespace-pre-line mt-1">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function WinTeamPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">WinTeam Setup Guide</h1>
        <p className="text-gray-500 text-sm mt-1">
          Step-by-step reference for configuring WinTeam (Aspire) for 1095-C ACA reporting at ABC Janitorial Services.
        </p>
      </div>

      {/* Quick timeline */}
      <div className="card p-5 mb-6 bg-slate-50 border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Annual Timeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          {[
            { month: 'Oct–Nov', label: 'System setup & verification' },
            { month: 'Jan 31', label: 'Distribute 1095-Cs to employees' },
            { month: 'Feb 28', label: 'Paper IRS filing deadline' },
            { month: 'Mar 31', label: 'Electronic IRS filing deadline' },
          ].map((t) => (
            <div key={t.month} className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="font-bold text-slate-700">{t.month}</p>
              <p className="text-slate-500 mt-0.5">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <AccordionSection key={section.id} section={section} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center">
        This guide is based on WinTeam / Aspire Software ACA module best practices. Always verify steps with the latest Aspire documentation for your version.
      </p>
    </div>
  )
}
