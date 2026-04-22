import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !svcKey) {
    return NextResponse.json({
      error: 'Missing env vars',
      url: url ? 'OK' : 'MISSING',
      svcKey: svcKey ? 'OK' : 'MISSING'
    }, { status: 500 })
  }

  const supabase = createClient(url, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const email    = 'admin@vizia.ma'
  const password = 'Vizia2026!'
  const orgId    = '88ed4091-9123-4b26-ad8b-6e577b1e70a3'

  // Créer l'utilisateur
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error && error.message !== 'User already registered') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userId = data?.user?.id

  if (userId) {
    // Créer/mettre à jour le profil
    await supabase.from('user_profiles').upsert({
      id: userId,
      full_name: 'Admin VIZIA',
      role: 'org_admin',
      organization_id: orgId,
      is_active: true,
    })
  }

  // Si user existe déjà, mettre à jour son mot de passe
  if (error?.message === 'User already registered') {
    const { data: list } = await supabase.auth.admin.listUsers()
    const existing = list?.users?.find((u: any) => u.email === email)
    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, { password })
      await supabase.from('user_profiles').upsert({
        id: existing.id,
        full_name: 'Admin VIZIA',
        role: 'org_admin',
        organization_id: orgId,
        is_active: true,
      })
      return NextResponse.json({ success: true, action: 'updated', email, password })
    }
  }

  return NextResponse.json({ success: true, action: 'created', email, password })
}
