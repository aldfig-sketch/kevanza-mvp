import { createServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/auth', '/firmar']
const ADMIN_ROLES = ['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA']
const ROLE_RULES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/admin/usuarios', roles: ADMIN_ROLES },
  { prefix: '/admin/alertas', roles: ADMIN_ROLES },
  { prefix: '/admin/auditoria', roles: ADMIN_ROLES },
  { prefix: '/admin/configuracion-plazos', roles: ADMIN_ROLES },
  { prefix: '/admin/panel', roles: ADMIN_ROLES },
  { prefix: '/admin/revisar-licitaciones', roles: [...ADMIN_ROLES, 'UNIDAD_COMPRA'] },
  { prefix: '/admin/revisar-bases-compra', roles: [...ADMIN_ROLES, 'UNIDAD_COMPRA', 'JEFE_COMPRAS', 'JURIDICO'] },
  { prefix: '/admin/seguimiento-plazos', roles: [...ADMIN_ROLES, 'UNIDAD_COMPRA', 'JEFE_COMPRAS'] },
  { prefix: '/admin/bases-tipos', roles: [...ADMIN_ROLES, 'UNIDAD_COMPRA', 'JEFE_COMPRAS', 'JURIDICO'] },
  { prefix: '/admin', roles: ADMIN_ROLES },
  { prefix: '/comprador', roles: [...ADMIN_ROLES, 'UNIDAD_COMPRA', 'JEFE_COMPRAS'] },
  { prefix: '/juridico', roles: [...ADMIN_ROLES, 'JURIDICO'] },
]

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((prefix) => prefix === '/' ? pathname === '/' : matchesPath(pathname, prefix))
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie))
  return to
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (isPublicPath(pathname)) return NextResponse.next()

  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookies.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }))
        },
      },
      cookieOptions: { name: 'kevanza-auth' },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return copyCookies(response, NextResponse.redirect(loginUrl))
  }

  const rule = ROLE_RULES.find(({ prefix }) => matchesPath(pathname, prefix))
  if (rule) {
    const [{ data: profile }, { data: assignments }] = await Promise.all([
      supabase.from('usuarios').select('rol,activo,es_activo').eq('id', user.id).maybeSingle(),
      supabase.from('usuarios_roles').select('activo,roles(codigo)').eq('usuario_id', user.id).eq('activo', true),
    ])
    const assignedRoles = (assignments || []).flatMap((assignment: any) => {
      const role = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles
      return role?.codigo ? [role.codigo] : []
    })
    const roles = new Set([profile?.rol, ...assignedRoles].filter(Boolean))
    const active = profile?.activo !== false && profile?.es_activo !== false
    if (!active || !rule.roles.some((role) => roles.has(role))) {
      const deniedUrl = request.nextUrl.clone()
      deniedUrl.pathname = '/dashboard'
      deniedUrl.searchParams.set('access', 'denied')
      return copyCookies(response, NextResponse.redirect(deniedUrl))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
