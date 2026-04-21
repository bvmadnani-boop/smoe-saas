import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') redirect('/login')

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar userName={profile.full_name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
