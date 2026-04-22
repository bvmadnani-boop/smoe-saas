import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !svcKey) {
      return NextResponse.json({ error: 'Missing env vars', url: !!url, svcKey: !!svcKey })
    }

    const supabase = createClient(url, svcKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const email    = 'admin@vizia.ma'
    const password = 'Vizia2026!'
    const orgId    = '88ed4091-9123-4b26-ad8b-6e577b1e70a3'

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        const { data: list } = await supabase.auth.admin.listUsers()
        const existing = list?.users?.find((u: any) => u.email === email)
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, { password })
          await supabase.from('user_profiles').upsert({
            id: existing.id, full_name: 'Admin VIZIA',
            role: 'org_admin', organization_id: orgId, is_active: true,
          })
          return NextResponse.json({ ok: true, action: 'password_reset', email, password })
        }
      }
      return NextResponse.json({ error: error.message })
    }

    await supabase.from('user_profiles').upsert({
      id: data.user.id, full_name: 'Admin VIZIA',
      role: 'org_admin', organization_id: orgId, is_active: true,
    })

    return NextResponse.json({ ok: true, action: 'created', email, password })

  } catch (e: any) {
    return NextResponse.json({ error: 'caught', message: e?.message ?? String(e) })
  }
}
