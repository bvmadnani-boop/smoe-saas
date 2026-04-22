import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage  = pathname.startsWith('/login')
  const isLanding   = pathname === '/'
  const isPublic    = pathname.startsWith('/_next') ||
                      pathname.startsWith('/favicon') ||
                      pathname.startsWith('/api/') ||
                      isLanding

  // Non authentifié → login (sauf landing et pages publiques)
  if (!user && !isAuthPage && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authentifié sur /login → rediriger selon le rôle
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (profile?.organization_id) {
      return NextResponse.redirect(
        new URL(`/org/${profile.organization_id}`, request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
