import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, GraduationCap, Mail, Phone,
  MapPin, Calendar, FileText, User,
} from 'lucide-react'
import StudentStatusBadge from '@/components/org/inscription/StudentStatusBadge'
import StudentStatusUpdater from '@/components/org/inscription/StudentStatusUpdater'
import DocumentUploader from '@/components/org/inscription/DocumentUploader'

export const dynamic = 'force-dynamic'

export default async function StudentPage({
  params,
}: {
  params: Promise<{ orgId: string; studentId: string }>
}) {
  const { orgId, studentId } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('students')
    .select(`*, filieres(name, code)`)
    .eq('id', studentId)
    .eq('organization_id', orgId)
    .single()

  if (!student) notFound()

  const { data: documents } = await supabase
    .from('inscription_documents')
    .select('id, document_type, file_name, file_url, storage_path, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-6">
        <Link href={`/org/${orgId}/inscription`}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4">
          <ArrowLeft size={14} /> Retour aux inscriptions
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1B3A6B]/10 flex items-center justify-center">
              <span className="text-[#1B3A6B] font-bold text-xl">
                {student.full_name?.split(' ').map((n: string) => n[0]).slice(0,2).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.full_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                  {student.student_code}
                </span>
                <StudentStatusBadge status={student.status} />
              </div>
            </div>
          </div>
          <StudentStatusUpdater studentId={studentId} currentStatus={student.status} orgId={orgId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Infos identité */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={15} className="text-slate-400" />
              Identité
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nom complet',    value: student.full_name },
                { label: 'Date naissance',value: student.date_of_birth
                    ? new Date(student.date_of_birth).toLocaleDateString('fr-FR') : null },
                { label: 'Nationalité',   value: student.nationality },
                { label: 'CIN / Passeport', value: student.cin },
                { label: 'Adresse',       value: student.address },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400 mb-0.5">{label}</dt>
                  <dd className="text-sm text-slate-700 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap size={15} className="text-slate-400" />
              Parcours académique
            </h3>
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Filière',         value: (student.filieres as any)?.name },
                { label: 'Code filière',    value: (student.filieres as any)?.code },
                { label: 'Année académique',value: student.academic_year },
                { label: 'Date inscription',value: new Date(student.created_at).toLocaleDateString('fr-FR') },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400 mb-0.5">{label}</dt>
                  <dd className="text-sm text-slate-700 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Contact + Notes */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Contact</h3>
            <div className="space-y-2">
              {student.email && (
                <a href={`mailto:${student.email}`}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#1B3A6B]">
                  <Mail size={13} className="text-slate-400" />
                  {student.email}
                </a>
              )}
              {student.phone && (
                <a href={`tel:${student.phone}`}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#1B3A6B]">
                  <Phone size={13} className="text-slate-400" />
                  {student.phone}
                </a>
              )}
              {student.address && (
                <p className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                  {student.address}
                </p>
              )}
            </div>
          </div>

          {student.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                <FileText size={13} className="text-slate-400" />
                Notes internes
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{student.notes}</p>
            </div>
          )}

          <DocumentUploader
            studentId={studentId}
            orgId={orgId}
            initialDocs={(documents ?? []) as any}
          />

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
              <Calendar size={13} className="text-slate-400" />
              Historique
            </h3>
            <p className="text-xs text-slate-400">
              Inscrit le {new Date(student.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
