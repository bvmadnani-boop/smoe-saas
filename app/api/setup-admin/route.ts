import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const email    = 'admin@vizia.ma'
    const password = 'Vizia2026!'
    const orgId    = '88ed4091-9123-4b26-ad8b-6e577b1e70a3'

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${svcKey}`,
      'apikey': svcKey,
    }

    // Créer l'utilisateur
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password, email_confirm: true }),
    })
    const createData = await createRes.json()
    let userId = createData?.id

    // Si existe déjà → récupérer + reset mdp
    if (!userId) {
      const listRes = await fetch(`${url}/auth/v1/admin/users`, { headers })
      const listData = await listRes.json()
      const existing = listData?.users?.find((u: any) => u.email === email)
      if (existing) {
        userId = existing.id
        await fetch(`${url}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ password }),
        })
      }
    }

    if (!userId) return NextResponse.json({ error: 'user not found', createData })

    // Upsert profil
    await fetch(`${url}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: userId, full_name: 'Admin VIZIA', role: 'org_admin', organization_id: orgId, is_active: true }),
    })

    return NextResponse.json({ ok: true, email, password, userId })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) })
  }
}
