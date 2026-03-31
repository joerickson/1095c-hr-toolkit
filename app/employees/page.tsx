'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const LINE14_OPTIONS = ['', '1A', '1B', '1C', '1D', '1E', '1F', '1G', '1H', '1J', '1K']
const LINE16_OPTIONS = ['', '2A', '2B', '2C', '2D', '2E', '2F', '2G', '2H']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  ssn_last4: string
  line14_annual: string
  line15_annual: string
  line16_annual: string
  notes: string
  created_at: string
}

type EmployeeForm = Omit<Employee, 'id' | 'created_at'>

const emptyForm: EmployeeForm = {
  employee_id: '',
  first_name: '',
  last_name: '',
  ssn_last4: '',
  line14_annual: '',
  line15_annual: '',
  line16_annual: '',
  notes: '',
}

export default function EmployeesPage() {
  const supabase = createClient()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<EmployeeForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const loadEmployees = useCallback(async () => {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('last_name')
    if (data) setEmployees(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditId(emp.id)
    setForm({
      employee_id: emp.employee_id ?? '',
      first_name: emp.first_name,
      last_name: emp.last_name,
      ssn_last4: emp.ssn_last4 ?? '',
      line14_annual: emp.line14_annual ?? '',
      line15_annual: emp.line15_annual ?? '',
      line16_annual: emp.line16_annual ?? '',
      notes: emp.notes ?? '',
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('First and last name are required.')
      return
    }
    setSaving(true)
    setFormError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    if (editId) {
      const { error } = await supabase
        .from('employees')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editId)
      if (error) { setFormError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase
        .from('employees')
        .insert({ ...form, user_id: user.id })
      if (error) { setFormError(error.message); setSaving(false); return }
    }

    setSaving(false)
    setModalOpen(false)
    loadEmployees()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('employees').delete().eq('id', id)
    setDeleting(null)
    loadEmployees()
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    return (
      e.first_name.toLowerCase().includes(q) ||
      e.last_name.toLowerCase().includes(q) ||
      (e.employee_id ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee ACA data for 1095-C reporting.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or employee ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading employees…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 font-medium">
            {search ? 'No employees match your search.' : 'No employees yet. Add your first employee.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SSN (last 4)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Line 14</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Line 15 / mo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Line 16</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{emp.last_name}, {emp.first_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.employee_id || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.ssn_last4 ? `***-**-${emp.ssn_last4}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {emp.line14_annual ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                          {emp.line14_annual}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.line15_annual ? `$${parseFloat(emp.line15_annual).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {emp.line16_annual ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded">
                          {emp.line16_annual}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(emp)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                        disabled={deleting === emp.id}
                        className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deleting === emp.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {filtered.length} employee{filtered.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {editId ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="input"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="input"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee ID</label>
                  <input
                    type="text"
                    value={form.employee_id}
                    onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                    className="input"
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <label className="label">SSN Last 4 Digits</label>
                  <input
                    type="text"
                    value={form.ssn_last4}
                    onChange={(e) => setForm((f) => ({ ...f, ssn_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    className="input"
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Form 1095-C Annual Codes
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Line 14 Code</label>
                    <select
                      value={form.line14_annual}
                      onChange={(e) => setForm((f) => ({ ...f, line14_annual: e.target.value }))}
                      className="select"
                    >
                      <option value="">— Select —</option>
                      {LINE14_OPTIONS.filter(Boolean).map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Line 15 ($/mo)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.line15_annual}
                      onChange={(e) => setForm((f) => ({ ...f, line15_annual: e.target.value }))}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Line 16 Code</label>
                    <select
                      value={form.line16_annual}
                      onChange={(e) => setForm((f) => ({ ...f, line16_annual: e.target.value }))}
                      className="select"
                    >
                      <option value="">— Select —</option>
                      {LINE16_OPTIONS.filter(Boolean).map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="input"
                  rows={2}
                  placeholder="Any relevant notes…"
                />
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
