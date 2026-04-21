'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from 'lucide-react'

type Doc = {
  id: string
  document_type: string
  file_name: string
  file_url: string
  created_at: string
}

const DOC_TYPES = [
  { value: 'cin',          label: 'CIN / Passeport' },
  { value: 'bac_diploma',  label: 'Baccalauréat / Diplôme' },
  { value: 'releve_notes', label: 'Relevé de notes' },
  { value: 'photo',        label: 'Photo d\'identité' },
  { value: 'contrat',      label: 'Contrat d\'inscription' },
  { value: 'autre',        label: 'Autre document' },
]

export default function DocumentUploader({
  studentId,
  orgId,
  initialDocs,
}: {
  studentId: string
  orgId: string
  initialDocs: Doc[]
}) {
  const supabase  = createClient()
  const fileRef   = useRef<HTMLInputElement>(null)

  const [docs,     setDocs]     = useState<Doc[]>(initialDocs)
  const [docType,  setDocType]  = useState('cin')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    // Chemin dans le bucket : orgId/studentId/type_timestamp.ext
    const ext      = file.name.split('.').pop()
    const path     = `${orgId}/${studentId}/${docType}_${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('student-documents')
      .upload(path, file, { upsert: false })

    if (upErr) {
      setError('Erreur upload : ' + upErr.message)
      setLoading(false)
      return
    }

    // URL signée (valable 1 an)
    const { data: urlData } = await supabase.storage
      .from('student-documents')
      .createSignedUrl(path, 60 * 60 * 24 * 365)

    // Enregistrer en base
    const { data: doc, error: dbErr } = await supabase
      .from('inscription_documents')
      .insert({
        student_id:      studentId,
        organization_id: orgId,
        document_type:   docType,
        file_name:       file.name,
        file_url:        urlData?.signedUrl ?? path,
        storage_path:    path,
        status:          'pending',
      })
      .select()
      .single()

    if (dbErr) {
      setError('Erreur enregistrement : ' + dbErr.message)
    } else {
      setDocs(prev => [...prev, doc])
    }

    setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(doc: Doc & { storage_path?: string }) {
    setDeleting(doc.id)

    // Supprimer du storage
    if ((doc as any).storage_path) {
      await supabase.storage
        .from('student-documents')
        .remove([(doc as any).storage_path])
    }

    // Supprimer de la base
    await supabase
      .from('inscription_documents')
      .delete()
      .eq('id', doc.id)

    setDocs(prev => prev.filter(d => d.id !== doc.id))
    setDeleting(null)
  }

  const typeLabel = (val: string) =>
    DOC_TYPES.find(d => d.value === val)?.label ?? val

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <FileText size={15} className="text-slate-400" />
        Documents du dossier
      </h3>

      {/* Zone upload */}
      <div className="mb-4 flex gap-2">
        <select
          value={docType}
          onChange={e => setDocType(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        >
          {DOC_TYPES.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          cursor-pointer transition-colors ${
            loading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#1B3A6B] text-white hover:bg-[#2E5BA8]'
          }`}>
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Envoi...</>
            : <><Upload size={15} /> Ajouter un fichier</>
          }
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
      )}

      {/* Liste des documents */}
      {docs.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg px-4 py-8 text-center">
          <FileText size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucun document joint</p>
          <p className="text-xs text-slate-300 mt-1">PDF, JPG ou PNG · 10 MB max</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg group"
            >
              <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{doc.file_name}</p>
                <p className="text-xs text-slate-400">{typeLabel(doc.document_type)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-[#1B3A6B] transition-colors"
                  title="Ouvrir"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => handleDelete(doc as any)}
                  disabled={deleting === doc.id}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === doc.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3">
        Formats acceptés : PDF, JPG, PNG · Taille max : 10 MB
      </p>
    </div>
  )
}
