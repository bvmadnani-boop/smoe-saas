import { CheckCircle2, Clock, Award, XCircle } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  inscrit:   { label: 'Inscrit',   cls: 'bg-violet-50 text-violet-600',   icon: <Clock size={11} /> },
  actif:     { label: 'Actif',     cls: 'bg-emerald-50 text-emerald-600', icon: <CheckCircle2 size={11} /> },
  diplome:   { label: 'Diplômé',   cls: 'bg-blue-50 text-blue-600',       icon: <Award size={11} /> },
  suspendu:  { label: 'Suspendu',  cls: 'bg-red-50 text-red-500',         icon: <XCircle size={11} /> },
  inactif:   { label: 'Inactif',   cls: 'bg-slate-100 text-slate-500',    icon: <Clock size={11} /> },
}

export default function StudentStatusBadge({ status }: { status: string }) {
  const st = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500', icon: null }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
      {st.icon}
      {st.label}
    </span>
  )
}
