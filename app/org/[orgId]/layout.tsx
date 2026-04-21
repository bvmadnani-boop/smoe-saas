import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrgSidebar from '@/components/org/OrgSidebar'

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // super_admin peut accéder à toutes les orgs, les autres seulement à la leur
  const canAccess =
    profile.role === 'super_admin' ||
    profile.organization_id === orgId

  if (!canAccess) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, city, code')
    .eq('id', orgId)
    .single()

  if (!org) redirect('/login')

  return (
    <div className="flex h-screen bg-slate-50">
      <OrgSidebar
        org={org}
        orgId={orgId}
        userName={profile.full_name}
        userRole={profile.role}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
