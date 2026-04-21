import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Authenticated users → redirect to their space
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (profile.role === 'super_admin') redirect('/admin')
      redirect(`/org/${profile.organization_id}`)
    }
  }

  // Unauthenticated → show landing page
  return <LandingPage />
}
