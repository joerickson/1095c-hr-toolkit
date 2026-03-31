'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type ChecklistItem = {
  key: string
  label: string
}

type ChecklistCategory = {
  id: string
  title: string
  items: ChecklistItem[]
}

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'pre-filing',
    title: 'Pre-Filing Preparation',
    items: [
      { key: 'verify-ein', label: 'Verify employer EIN and contact information is correct' },
      { key: 'confirm-plan-year', label: 'Confirm plan year (calendar vs. fiscal year)' },
      { key: 'identify-ft-employees', label: 'Identify all full-time employees (30+ hours/week average)' },
      { key: 'gather-ssns', label: 'Gather all employee SSNs and verify accuracy' },
      { key: 'confirm-addresses', label: 'Confirm employee addresses for mailing' },
      { key: 'mid-year-changes', label: 'Review any mid-year employment status changes' },
    ],
  },
  {
    id: 'coverage-line14',
    title: 'Coverage Offer Verification (Line 14)',
    items: [
      { key: 'verify-mec-offered', label: 'Verify MEC (Minimum Essential Coverage) was offered to applicable employees' },
      { key: 'confirm-mv', label: 'Confirm Minimum Value (MV) determination for the plan' },
      { key: 'document-spouse-dependent', label: 'Document offers extended to spouses and dependents' },
      { key: 'declined-coverage', label: 'Identify and document employees who declined coverage' },
      { key: 'transition-relief', label: 'Review transition relief eligibility if applicable' },
    ],
  },
  {
    id: 'contribution-line15',
    title: 'Employee Contribution Review (Line 15)',
    items: [
      { key: 'calc-employee-share', label: 'Calculate employee share of lowest-cost MV premium for each month' },
      { key: 'verify-monthly-amounts', label: 'Verify contribution amounts for each month employee was offered coverage' },
      { key: 'affordability-check', label: 'Check affordability thresholds (FPL, W-2, or rate of pay method)' },
      { key: 'premium-changes', label: 'Document any premium changes that occurred during the year' },
    ],
  },
  {
    id: 'safe-harbor-line16',
    title: 'Safe Harbor Codes (Line 16)',
    items: [
      { key: 'waiting-periods', label: 'Identify employees in Limited Non-Assessment Periods (waiting periods)' },
      { key: 'non-ft-employees', label: 'Document employees who were not full-time for any given month' },
      { key: 'enrolled-employees', label: 'Confirm enrolled employees are coded 2C' },
      { key: 'safe-harbor-selection', label: 'Select and apply appropriate affordability safe harbor (2F, 2G, or 2H)' },
    ],
  },
  {
    id: 'distribution',
    title: 'Form Distribution',
    items: [
      { key: 'distribute-jan31', label: 'Distribute 1095-C forms to employees by January 31 deadline' },
      { key: 'electronic-consent', label: 'Confirm electronic consent for employees receiving forms electronically' },
      { key: 'undeliverable', label: 'Document and retain records of undeliverable forms' },
      { key: 'retain-copies', label: 'Retain copies of all forms for minimum 3 years' },
    ],
  },
  {
    id: 'irs-filing',
    title: 'IRS Filing',
    items: [
      { key: 'prepare-1094c', label: 'Prepare Form 1094-C transmittal form' },
      { key: 'aggregate-group', label: 'Review aggregate ALE group membership if applicable' },
      { key: 'electronic-filing', label: 'Submit electronic filing by March 31 deadline (paper: February 28)' },
      { key: 'filing-confirmation', label: 'Obtain and retain IRS filing confirmation/acknowledgment' },
      { key: 'irs-notices', label: 'Review and respond to any IRS notices or request for error corrections' },
    ],
  },
]

export default function ChecklistPage() {
  const supabase = createClient()
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const loadChecklist = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('checklist_items')
      .select('item_key, checked')
      .eq('user_id', user.id)

    if (data) {
      const map: Record<string, boolean> = {}
      data.forEach((row) => { map[row.item_key] = row.checked })
      setCheckedItems(map)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadChecklist()
  }, [loadChecklist])

  const handleToggle = async (key: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newValue = !checkedItems[key]
    setCheckedItems((prev) => ({ ...prev, [key]: newValue }))
    setSaving(key)

    await supabase.from('checklist_items').upsert(
      { user_id: user.id, item_key: key, checked: newValue },
      { onConflict: 'user_id,item_key' }
    )

    setSaving(null)
  }

  const handleReset = async () => {
    if (!confirm('Reset all checklist items? This cannot be undone.')) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('checklist_items').delete().eq('user_id', user.id)
    setCheckedItems({})
  }

  const allKeys = CHECKLIST_CATEGORIES.flatMap((c) => c.items.map((i) => i.key))
  const checkedCount = allKeys.filter((k) => checkedItems[k]).length
  const totalCount = allKeys.length
  const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Checklist</h1>
          <p className="text-gray-500 text-sm mt-1">Track your ACA compliance tasks — saved automatically per user.</p>
        </div>
        <button onClick={handleReset} className="btn-secondary text-xs">
          Reset All
        </button>
      </div>

      {/* Progress */}
      <div className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-gray-900">{checkedCount} / {totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">{progressPct}% complete</p>
      </div>

      {/* Categories */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading checklist…</div>
      ) : (
        <div className="space-y-6">
          {CHECKLIST_CATEGORIES.map((category) => {
            const catChecked = category.items.filter((i) => checkedItems[i.key]).length
            const catTotal = category.items.length
            return (
              <div key={category.id} className="card">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 text-sm">{category.title}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    catChecked === catTotal
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {catChecked}/{catTotal}
                  </span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {category.items.map((item) => (
                    <li key={item.key}>
                      <label className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={!!checkedItems[item.key]}
                            onChange={() => handleToggle(item.key)}
                            disabled={saving === item.key}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <span className={`text-sm leading-relaxed ${
                          checkedItems[item.key]
                            ? 'line-through text-gray-400'
                            : 'text-gray-700'
                        }`}>
                          {item.label}
                        </span>
                        {saving === item.key && (
                          <svg className="w-3 h-3 text-gray-400 animate-spin ml-auto flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
