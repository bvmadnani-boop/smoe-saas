import { NextResponse } from 'next/server'

export async function GET() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Debug : afficher les valeurs (partielles pour sécurité)
  return NextResponse.json({
    url,
    svcKeyStart: svcKey?.substring(0, 20),
    authEndpoint: `${url}/auth/v1/admin/users`,
  })
}
