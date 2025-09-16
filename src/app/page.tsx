"use client"
import React, { useEffect, useMemo, useState } from 'react'

type Application = {
  id: string
  role: string
  company: string
  status: ApplicationStatus
  createdAt: number
  deadline?: number | null
}

type ApplicationStatus =
  | 'Applied'
  | 'OA'
  | 'OA Submitted'
  | 'Interviewing'
  | 'Offer'
  | 'Rejected'
  | 'Ghosted'

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Applied',
  'OA',
  'OA Submitted',
  'Interviewing',
  'Offer',
  'Rejected',
  'Ghosted',
]

// removed priority feature

const STORAGE_KEY = 'gmi_applications_v1'

const Page = () => {
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('Applied')
  const [applications, setApplications] = useState<Application[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | ApplicationStatus>('All')
  // removed url and notes
  const [deadline, setDeadline] = useState('')
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Company' | 'Status' | 'Deadline'>('Status')

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Application[]
        setApplications(parsed)
      }
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
    } catch {}
  }, [applications])

  const isEditMode = editingId !== null

  // pacing indicator removed

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const base = applications
      .filter((a) =>
        filterStatus === 'All' ? true : a.status === filterStatus
      )
      .filter((a) =>
        normalizedQuery
          ? a.role.toLowerCase().includes(normalizedQuery) ||
            a.company.toLowerCase().includes(normalizedQuery)
          : true
      )

    const sorted = [...base]
    if (sortBy === 'Newest') sorted.sort((a, b) => b.createdAt - a.createdAt)
    if (sortBy === 'Oldest') sorted.sort((a, b) => a.createdAt - b.createdAt)
    if (sortBy === 'Company') sorted.sort((a, b) => a.company.localeCompare(b.company))
    if (sortBy === 'Status') {
      const statusRank: Record<ApplicationStatus, number> = {
        Rejected: 0,
        Ghosted: 1,
        Applied: 2,
        OA: 3,
        'OA Submitted': 4,
        Interviewing: 5,
        Offer: 6,
      }
      sorted.sort((a, b) => (statusRank[b.status] - statusRank[a.status]))
    }
    // deadline sorting removed
    return sorted
  }, [applications, filterStatus, query, sortBy])

  function resetForm() {
    setRole('')
    setCompany('')
    setStatus('Applied')
    setEditingId(null)
    setDeadline('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role.trim() || !company.trim()) return

    if (isEditMode) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === editingId ? {
            ...a,
            role: role.trim(),
            company: company.trim(),
            status,
            deadline: status === 'OA' && deadline ? new Date(deadline).getTime() : null,
          } : a
        )
      )
      resetForm()
      return
    }

    const newItem: Application = {
      id: crypto.randomUUID(),
      role: role.trim(),
      company: company.trim(),
      status,
      createdAt: Date.now(),
      deadline: status === 'OA' && deadline ? new Date(deadline).getTime() : null,
    }
    setApplications((prev) => [newItem, ...prev])
    resetForm()
  }

  function handleEdit(app: Application) {
    setEditingId(app.id)
    setRole(app.role)
    setCompany(app.company)
    setStatus(app.status)
    setDeadline(app.deadline ? new Date(app.deadline).toISOString().slice(0, 10) : '')
  }

  // removed delete, cycle status, export/import/clear actions

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 md:px-6 py-6 bg-black">
        <div className="w-full flex items-center justify-between text-white">
    <div>
            <h1 className="text-2xl font-semibold tracking-tight">wagmi</h1>
            <p className="text-sm opacity-80">We&apos;re all gonna make it.</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 bg-white text-black">
        <div className="w-full py-6">
        {/* pacing indicator removed */}

        <section className="mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Internship role"
              className="md:col-span-3 h-11 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-3 text-sm outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
            />
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="md:col-span-3 h-11 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-3 text-sm outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="md:col-span-2 h-11 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-3 text-sm outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {/* removed URL field */}
            {status === 'OA' && (
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="OA due date"
                className="md:col-span-2 h-11 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-3 text-sm outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
              />
            )}
            {/* removed next step, priority, and notes */}
            <div className="md:col-span-4 h-11 flex items-center gap-2">
              <button
                type="submit"
                className="h-11 px-4 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-black/90 active:scale-[.99] disabled:opacity-50"
                disabled={!role.trim() || !company.trim()}
              >
                {isEditMode ? 'Save changes' : 'Add application'}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-11 px-4 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search role or company..."
              className="h-10 w-full sm:w-72 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-3 text-sm outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
            />
            </div>
            <div className="text-sm text-neutral-500">
              {filteredApplications.length} item{filteredApplications.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {(['All', ...STATUS_OPTIONS] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as 'All' | ApplicationStatus)}
                  className={`h-8 px-3 rounded-full text-xs border ${filterStatus === s ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-200 dark:text-black dark:border-neutral-200' : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'Newest' | 'Oldest' | 'Company' | 'Status' | 'Deadline')}
              className="h-10 rounded-md border border-neutral-200/40 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/60 px-3 text-sm outline-none focus:ring-2 ring-neutral-300 dark:ring-neutral-700"
            >
              <option>Newest</option>
              <option>Oldest</option>
              <option>Company</option>
              <option>Status</option>
              {/* deadline sort removed */}
            </select>
          </div>
        </section>

        <section>
          <div className="overflow-hidden rounded-lg border border-neutral-200/50 dark:border-neutral-800/60">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50/60 dark:bg-neutral-900/40">
                <tr>
                  <th className="text-left font-medium px-4 py-3 w-[36%]">Internship</th>
                  <th className="text-left font-medium px-4 py-3 w-[28%]">Company</th>
                  <th className="text-left font-medium px-4 py-3 w-[16%]">Status</th>
                  <th className="text-right font-medium px-4 py-3 w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                      No applications yet. Add your first one above.
                    </td>
                  </tr>
                )}
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-t border-neutral-100 dark:border-neutral-900/60">
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium flex items-center gap-2">
                        <span>{app.role}</span>
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2">
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        {app.status === 'OA' && app.deadline && (
                          <span>• OA due {new Date(app.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">{app.company}</td>
                    <td className="px-4 py-3 align-middle">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(app)}
                          className="h-8 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const color =
    status === 'Offer' ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400' :
    status === 'OA' ? 'bg-violet-600/15 text-violet-700 dark:text-violet-400' :
    status === 'OA Submitted' ? 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400' :
    status === 'Interviewing' ? 'bg-blue-600/15 text-blue-700 dark:text-blue-400' :
    status === 'Rejected' ? 'bg-rose-600/15 text-rose-700 dark:text-rose-400' :
    status === 'Ghosted' ? 'bg-amber-600/15 text-amber-700 dark:text-amber-400' :
    false ? '' :
    'bg-neutral-600/15 text-neutral-700 dark:text-neutral-300'

  return (
    <span className={`inline-flex items-center h-7 px-2.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}

export default Page