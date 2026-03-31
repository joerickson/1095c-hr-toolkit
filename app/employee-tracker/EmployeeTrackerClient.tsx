"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { line14Codes } from "@/lib/data/line14-codes";
import { line16Codes } from "@/lib/data/line16-codes";
import type { Employee } from "@/lib/types";

interface Props {
  userId: string;
  initialEmployees: Employee[];
}

const EMPTY_FORM: Omit<Employee, "id" | "user_id" | "created_at" | "updated_at"> = {
  employee_id: "",
  first_name: "",
  last_name: "",
  ssn_last4: "",
  department: "",
  hire_date: "",
  termination_date: null,
  is_full_time: true,
  line14_code: "1E",
  line15_amount: null,
  line16_code: "2C",
  notes: "",
};

export default function EmployeeTrackerClient({ userId, initialEmployees }: Props) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterFT, setFilterFT] = useState<"all" | "ft" | "pt">("all");
  const supabase = createClient();

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(emp: Employee) {
    setForm({
      employee_id: emp.employee_id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      ssn_last4: emp.ssn_last4,
      department: emp.department,
      hire_date: emp.hire_date,
      termination_date: emp.termination_date,
      is_full_time: emp.is_full_time,
      line14_code: emp.line14_code,
      line15_amount: emp.line15_amount,
      line16_code: emp.line16_code,
      notes: emp.notes,
    });
    setEditingId(emp.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      user_id: userId,
      updated_at: new Date().toISOString(),
      termination_date: form.termination_date || null,
      line15_amount: form.line15_amount ?? null,
    };

    if (editingId) {
      const { data, error: err } = await supabase
        .from("employees")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();
      if (err) {
        setError(err.message);
      } else if (data) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === editingId ? (data as Employee) : e))
        );
        setShowForm(false);
      }
    } else {
      const { data, error: err } = await supabase
        .from("employees")
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
      if (err) {
        setError(err.message);
      } else if (data) {
        setEmployees((prev) =>
          [...prev, data as Employee].sort((a, b) =>
            a.last_name.localeCompare(b.last_name)
          )
        );
        setShowForm(false);
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this employee record?")) return;
    const { error: err } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (!err) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  }

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.first_name.toLowerCase().includes(q) ||
      e.last_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q);
    const matchFT =
      filterFT === "all" ||
      (filterFT === "ft" && e.is_full_time) ||
      (filterFT === "pt" && !e.is_full_time);
    return matchSearch && matchFT;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Tracker</h1>
          <p className="text-gray-500 mt-1">
            Track ACA eligibility and 1095-C codes for all employees. Saves to Supabase.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          + Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, ID, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["all", "ft", "pt"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterFT(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                filterFT === f ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              {f === "all" ? "All" : f === "ft" ? "Full-Time" : "Part-Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Employees", value: employees.length },
          { label: "Full-Time", value: employees.filter((e) => e.is_full_time).length },
          { label: "Part-Time", value: employees.filter((e) => !e.is_full_time).length },
          { label: "Terminated", value: employees.filter((e) => e.termination_date).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-800">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-gray-500">
            {employees.length === 0
              ? "No employees yet. Click \"+ Add Employee\" to get started."
              : "No employees match your search."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Line 14</th>
                  <th className="px-4 py-3">Line 15</th>
                  <th className="px-4 py-3">Line 16</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {emp.last_name}, {emp.first_name}
                      </div>
                      {emp.ssn_last4 && (
                        <div className="text-xs text-gray-400">SSN: ***-**-{emp.ssn_last4}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{emp.employee_id || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.department || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          emp.termination_date
                            ? "bg-red-100 text-red-700"
                            : emp.is_full_time
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {emp.termination_date ? "Terminated" : emp.is_full_time ? "Full-Time" : "Part-Time"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{emp.line14_code || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.line15_amount != null ? `$${emp.line15_amount.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-green-700">{emp.line16_code || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(emp)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Employee" : "Add Employee"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    value={form.first_name}
                    onChange={(e) => setField("first_name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    value={form.last_name}
                    onChange={(e) => setField("last_name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    value={form.employee_id}
                    onChange={(e) => setField("employee_id", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EMP-0042"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SSN Last 4</label>
                  <input
                    value={form.ssn_last4}
                    onChange={(e) => setField("ssn_last4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <input
                    value={form.department}
                    onChange={(e) => setField("department", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Janitorial - Downtown"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employment Status</label>
                  <select
                    value={form.is_full_time ? "ft" : "pt"}
                    onChange={(e) => setField("is_full_time", e.target.value === "ft")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ft">Full-Time (30+ hrs/week)</option>
                    <option value="pt">Part-Time / Variable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={form.hire_date}
                    onChange={(e) => setField("hire_date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Termination Date</label>
                  <input
                    type="date"
                    value={form.termination_date ?? ""}
                    onChange={(e) => setField("termination_date", e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">1095-C Codes</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Line 14</label>
                    <select
                      value={form.line14_code}
                      onChange={(e) => setField("line14_code", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {line14Codes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Line 15 ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.line15_amount ?? ""}
                      onChange={(e) =>
                        setField("line15_amount", e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Line 16</label>
                    <select
                      value={form.line16_code}
                      onChange={(e) => setField("line16_code", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">— None —</option>
                      {line16Codes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any additional notes…"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
