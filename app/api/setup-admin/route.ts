import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // Sécurité : seulement en setup initial
  const setupKey = process.env.SETUP_SECRET_KEY
  if (!setupKey || setupKey !== 'vizia-setup-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const email = 'admin@vizia.ma'
  const password = 'Vizia2026!'
  const orgId = '88ed4091-9123-4b26-ad8b-6e577b1e70a3'

  // Créer ou récupérer l'utilisateur
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('organization_id', orgId)
    .eq('role', 'org_admin')
    .single()

  let userId: string

  if (existing) {
    // Mettre à jour le mot de passe de l'user existant via admin API
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingUser = authUsers?.users?.find((u: any) => u.id === existing.id)
    if (existingUser) {
      await supabase.auth.admin.updateUserById(existingUser.id, { password })
      userId = existingUser.id
      return NextResponse.json({ success: true, action: 'password_updated', email: existingUser.email, password })
    }
  }

  // Créer le nouvel utilisateur
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  userId = data.user.id

  // Créer le profil
  await supabase.from('user_profiles').upsert({
    id: userId,
    full_name: 'Admin VIZIA',
    role: 'org_admin',
    organization_id: orgId,
    is_active: true,
  })

  return NextResponse.json({ success: true, action: 'created', email, password })
}
