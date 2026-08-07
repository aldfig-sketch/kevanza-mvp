import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas (sin protección)
  const publicRoutes = ['/auth/login', '/auth/signup', '/', '/health']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Si es ruta pública, permitir
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Crear cliente Supabase
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Obtener sesión
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si no hay sesión y requiere auth, redirigir a login
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/licitaciones/:path*',
    '/admin/:path*',
    '/perfil/:path*',
  ],
}
