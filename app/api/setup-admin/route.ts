import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !svcKey) {
      return NextResponse.json({ error: 'Missing env vars', url: !!url, svcKey: !!svcKey })
    }

    const email    = 'admin@vizia.ma'
    const password = 'Vizia2026!'
    const orgId    = '88ed4091-9123-4b26-ad8b-6e577b1e70a3'

    // 1. Créer l'utilisateur via REST API GoTrue
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${svcKey}`,
        'apikey': svcKey,
      },
      body: JSON.stringify({ email, password, email_confirm: true }),
    })

    const createData = await createRes.json()

    let userId = createData?.id

    // Si user existe déjà, le récupérer et mettre à jour son mdp
    if (!userId) {
      const listRes = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${svcKey}`,
          'apikey': svcKey,
        },
      })
      const listData = await listRes.json()
      const existing = listData?.users?.[0]
      if (existing) {
        userId = existing.id
        await fetch(`${url}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${svcKey}`,
            'apikey': svcKey,
          },
          body: JSON.stringify({ password }),
        })
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not create or find user', createData })
    }

    // 2. Upsert profil via REST API PostgREST
    await fetch(`${url}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${svcKey}`,
        'apikey': svcKey,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: userId,
        full_name: 'Admin VIZIA',
        role: 'org_admin',
        organization_id: orgId,
        is_active: true,
      }),
    })

    return NextResponse.json({ ok: true, email, password, userId })

  } catch (e: any) {
    return NextResponse.json({ error: 'caught', message: e?.message ?? String(e) })
  }
}
