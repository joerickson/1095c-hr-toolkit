import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const features = [
  {
    href: '/checklist',
    title: 'Audit Checklist',
    description: 'Track your ACA compliance tasks with a persistent, per-user checklist covering pre-filing, coverage verification, and IRS submission.',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/code-lookup',
    title: 'Code Lookup Wizard',
    description: 'Step-by-step guided wizard to determine the correct codes for Lines 14 (offer of coverage), 15 (employee share), and 16 (safe harbor).',
    color: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/employees',
    title: 'Employee Tracker',
    description: 'Manage employee ACA data including offer codes, employee contribution amounts, and safe harbor codes. All data stored securely in Supabase.',
    color: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/winteam',
    title: 'WinTeam Setup Guide',
    description: 'Reference guide for configuring WinTeam (Aspire) to generate accurate 1095-C data — from initial setup through ACA report generation.',
    color: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
]

const deadlines = [
  { date: 'Jan 31', label: 'Distribute 1095-C to employees' },
  { date: 'Feb 28', label: 'Paper filing deadline with IRS' },
  { date: 'Mar 31', label: 'Electronic filing deadline with IRS' },
]

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const firstName = user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-gray-500 mt-1">
          ACA compliance toolkit — tax year 2024
        </p>
      </div>

      {/* Deadlines banner */}
      <div className="card p-5 mb-8 bg-blue-900 border-blue-800">
        <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-3">
          Key ACA Deadlines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {deadlines.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="text-blue-300 font-bold text-sm w-16 flex-shrink-0">{d.date}</span>
              <span className="text-white text-sm">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <div className={`card border p-6 hover:shadow-md transition-shadow cursor-pointer h-full ${feature.color}`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.iconBg} ${feature.iconColor} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 mt-8 text-center">
        Data is stored per-user in Supabase. All ACA code references are based on IRS Form 1095-C instructions.
      </p>
    </div>
  )
}
