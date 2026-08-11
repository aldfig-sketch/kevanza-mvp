import type { SupabaseClient } from '@supabase/supabase-js'

export const ROLES = {
  UNIDAD_TECNICA: 'UNIDAD_TECNICA',
  UNIDAD_COMPRA: 'UNIDAD_COMPRA',
  JURIDICO: 'JURIDICO',
  JEFE_COMPRAS: 'JEFE_COMPRAS',
  ADMIN_INSTITUCION: 'ADMIN_INSTITUCION',
  ADMIN_MUNICIPIO: 'ADMIN_MUNICIPIO',
  ADMIN_SISTEMA: 'ADMIN_SISTEMA',
  LECTOR: 'LECTOR',
} as const

export type RoleCode = (typeof ROLES)[keyof typeof ROLES]

/** Obtiene el rol heredado y los roles granulares asignados al usuario. */
export async function getUserRoles(client: SupabaseClient, userId: string): Promise<string[]> {
  const [{ data: profile }, { data: assignments }] = await Promise.all([
    client.from('usuarios').select('rol, activo').eq('id', userId).maybeSingle(),
    client.from('usuarios_roles').select('activo, roles(codigo)').eq('usuario_id', userId).eq('activo', true),
  ])

  if (!profile?.activo) return []

  const assigned = (assignments || []).flatMap((assignment: any) => {
    const role = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles
    return role?.codigo ? [role.codigo] : []
  })

  return Array.from(new Set([profile.rol, ...assigned].filter(Boolean))) as string[]
}

export async function hasAnyRole(
  client: SupabaseClient,
  userId: string,
  allowedRoles: readonly string[]
): Promise<boolean> {
  const roles = await getUserRoles(client, userId)
  return roles.some((role) => allowedRoles.includes(role))
}
