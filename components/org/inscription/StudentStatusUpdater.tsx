'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const STATUTS = [
  { value: 'inscrit',  label: 'Inscrit' },
  { value: 'actif',    label: 'Actif' },
  { value: 'suspendu', label: 'Suspendu' },
  { value: 'diplome',  label: 'Diplômé' },
  { value: 'inactif',  label: 'Inactif' },
]

export default function StudentStatusUpdater({
  studentId,
  currentStatus,
  orgId,
}: {
  studentId: string
  currentStatus: string
  orgId: string
}) {
  const [status, setStatus]   = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router                = useRouter()
  const supabase              = createClient()

  async function update(newStatus: string) {
    setLoading(true)
    await supabase
      .from('students')
      .update({ status: newStatus })
      .eq('id', studentId)
    setStatus(newStatus)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={e => update(e.target.value)}
        disabled={loading}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700
                   focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] disabled:opacity-50"
      >
        {STATUTS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
