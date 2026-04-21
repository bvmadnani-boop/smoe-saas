import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronRight,
  Users,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganisationsPage() {
  const supabase = await createClient()

  const { data: orgs } = await supabase
    .from('organizations')
    .select(`
      id, name, city, region, country, is_active, created_at,
      user_profiles(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organisations</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gestion des opérateurs territoriaux SUP2I
          </p>
        </div>
        <Link
          href="/admin/organisations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A6B] text-white
                     rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors"
        >
          <Plus size={16} />
          Nouvelle organisation
        </Link>
      </div>

      {/* Liste */}
      {!orgs || orgs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-16 text-center">
          <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-700 font-semibold mb-1">Aucune organisation</h3>
          <p className="text-slate-400 text-sm mb-6">
            Créez la première organisation pour commencer le déploiement SUP2I.
          </p>
          <Link
            href="/admin/organisations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3A6B] text-white
                       rounded-lg text-sm font-medium hover:bg-[#2E5BA8] transition-colors"
          >
            <Plus size={16} />
            Créer la première organisation
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Organisation</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Localisation</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Utilisateurs</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#1B3A6B] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {org.name?.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{org.name}</p>
                        <p className="text-xs text-slate-400">
                          Créé le {new Date(org.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" />
                      {[org.city, org.region].filter(Boolean).join(', ') || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Users size={12} className="text-slate-400" />
                      {(org.user_profiles as any)?.[0]?.count ?? 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {org.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle2 size={10} />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                        <Clock size={10} />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/organisations/${org.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[#1B3A6B] hover:underline font-medium"
                    >
                      Gérer
                      <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
