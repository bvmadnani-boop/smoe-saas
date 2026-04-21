import NewOrgForm from '@/components/admin/NewOrgForm'

export default function NewOrgPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <a
          href="/admin/organisations"
          className="text-sm text-slate-400 hover:text-slate-600 mb-2 inline-block"
        >
          ← Retour aux organisations
        </a>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle organisation</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Créer un nouvel opérateur territorial SUP2I
        </p>
      </div>
      <NewOrgForm />
    </div>
  )
}
