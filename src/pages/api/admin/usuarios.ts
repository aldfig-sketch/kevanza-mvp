import type { NextApiRequest, NextApiResponse } from 'next'
import { randomInt } from 'crypto'
import { authenticateRequest, createServiceSupabaseClient } from '@/lib/supabaseServer'
import { hasAnyRole } from '@/lib/roles'

const ADMIN_ROLES = ['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA']
const ALLOWED_USER_ROLES = ['UNIDAD_TECNICA', 'UNIDAD_COMPRA', 'JURIDICO', 'JEFE_COMPRAS', 'LECTOR', 'ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA']

function temporaryPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const numbers = '23456789'
  const symbols = '!@#$%&*+-_='
  const chars = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    numbers[randomInt(numbers.length)],
    symbols[randomInt(symbols.length)],
  ]
  const all = upper + lower + numbers + symbols
  while (chars.length < 12) chars.push(all[randomInt(all.length)])
  return chars.sort(() => randomInt(3) - 1).join('')
}

function expiresIn(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function getAdmin(auth: Awaited<ReturnType<typeof authenticateRequest>>) {
  if (!auth) return null
  if (!(await hasAnyRole(auth.client, auth.user.id, ADMIN_ROLES))) return null
  const service = createServiceSupabaseClient()
  const { data: profile } = await service
    .from('usuarios')
    .select('municipio_id,rol,activo,es_activo')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (!profile || profile.activo === false || profile.es_activo === false) return null
  return { service, profile, isSystemAdmin: profile.rol === 'ADMIN_SISTEMA' }
}

async function scopedTarget(service: ReturnType<typeof createServiceSupabaseClient>, admin: Awaited<ReturnType<typeof getAdmin>>, usuarioId: string) {
  if (!admin) return null
  const { data: target } = await service
    .from('usuarios')
    .select('id,email,nombre,full_name,municipio_id,rol,role_id,activo,es_activo,ultimo_login,contrasena_expira')
    .eq('id', usuarioId)
    .maybeSingle()
  if (!target) return null
  if (!admin.isSystemAdmin && target.municipio_id !== admin.profile.municipio_id) return null
  return target
}

async function listUsers(service: ReturnType<typeof createServiceSupabaseClient>, admin: Awaited<ReturnType<typeof getAdmin>>, institutionId?: string) {
  if (!admin) throw new Error('No autorizado')
  const scope = admin.isSystemAdmin ? institutionId : admin.profile.municipio_id
  let query = service.from('usuarios').select('id,email,nombre,full_name,municipio_id,rol,role_id,activo,es_activo,ultimo_login,contrasena_expira').order('created_at', { ascending: false })
  if (scope) query = query.eq('municipio_id', scope)
  const { data: users, error } = await query
  if (error) throw error

  const municipalityIds = Array.from(new Set((users || []).map((user) => user.municipio_id).filter(Boolean)))
  const { data: municipalities } = municipalityIds.length
    ? await service.from('municipios').select('id,nombre').in('id', municipalityIds)
    : { data: [] as any[] }
  const municipalityMap = new Map((municipalities || []).map((municipality) => [municipality.id, municipality.nombre]))
  return (users || []).map((user) => ({
    ...user,
    activo: user.es_activo !== false && user.activo !== false,
    municipio_nombre: municipalityMap.get(user.municipio_id) || null,
  }))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  const auth = await authenticateRequest(req.headers.authorization)
  if (!auth) return res.status(401).json({ error: 'Sesión no válida' })

  try {
    const action = req.body?.action
    if (action === 'change-own-password') {
      if (typeof req.body.password !== 'string' || req.body.password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
      const { data: profile } = await auth.client.from('usuarios').select('role_id,rol').eq('id', auth.user.id).single()
      const { data: policy } = await auth.client.from('politica_contrasenas').select('*').eq('rol_id', profile?.role_id || 0).maybeSingle()
      const password = req.body.password as string
      const errors: string[] = []
      if (policy?.requiere_mayuscula && !/[A-Z]/.test(password)) errors.push('Incluye al menos una mayúscula')
      if (policy?.requiere_numero && !/[0-9]/.test(password)) errors.push('Incluye al menos un número')
      if (policy?.requiere_simbolo && !/[!@#$%&*+\-_=?]/.test(password)) errors.push('Incluye al menos un símbolo')
      if (password.length < (policy?.minimo_caracteres || 8)) errors.push(`Usa al menos ${policy?.minimo_caracteres || 8} caracteres`)
      if (errors.length) return res.status(400).json({ error: errors.join('. ') })
      const { error: authError } = await auth.client.auth.updateUser({ password })
      if (authError) throw authError
      const service = createServiceSupabaseClient()
      const { data: policyForExpiry } = await service.from('politica_contrasenas').select('validez_dias').eq('rol_id', profile?.role_id || 0).maybeSingle()
      await service.from('usuarios_primer_login').upsert({ usuario_id: auth.user.id, debe_cambiar_contrasena: false, primer_login_realizado: true, token_cambio: null, expira_en: null, fecha_primer_login: new Date().toISOString() }, { onConflict: 'usuario_id' })
      await service.from('usuarios').update({ contrasena_expira: expiresIn(policyForExpiry?.validez_dias || 90), ultimo_login: new Date().toISOString() }).eq('id', auth.user.id)
      return res.status(200).json({ success: true })
    }

    if (action === 'record-login') {
      const service = createServiceSupabaseClient()
      await service.from('usuarios').update({ ultimo_login: new Date().toISOString() }).eq('id', auth.user.id)
      return res.status(200).json({ success: true })
    }

    const admin = await getAdmin(auth)
    if (!admin) return res.status(403).json({ error: 'Solo la administración puede gestionar usuarios' })
    const { service } = admin

    if (action === 'meta') {
      const [{ data: roles }, { data: institutions }] = await Promise.all([
        service.from('roles').select('id,codigo,nombre,nivel_acceso').in('codigo', ALLOWED_USER_ROLES).order('nivel_acceso'),
        admin.isSystemAdmin
          ? service.from('municipios').select('id,nombre').eq('activo', true).order('nombre')
          : service.from('municipios').select('id,nombre').eq('id', admin.profile.municipio_id),
      ])
      return res.status(200).json({ roles: roles || [], instituciones: institutions || [] })
    }

    if (action === 'list') {
      return res.status(200).json({ usuarios: await listUsers(service, admin, req.body.institucionId) })
    }

    if (action === 'create') {
      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
      const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : ''
      const rolId = Number(req.body.rolId)
      const institutionId = req.body.institucionId
      if (!isValidEmail(email) || nombre.length < 2 || !Number.isInteger(rolId) || !isValidUuid(institutionId)) return res.status(400).json({ error: 'Completa email, nombre, rol e institución válidos' })
      if (!admin.isSystemAdmin && institutionId !== admin.profile.municipio_id) return res.status(403).json({ error: 'No puedes crear usuarios en otra institución' })
      const { data: role } = await service.from('roles').select('id,codigo,nombre').eq('id', rolId).maybeSingle()
      if (!role || !ALLOWED_USER_ROLES.includes(role.codigo) || (!admin.isSystemAdmin && role.codigo === 'ADMIN_SISTEMA')) return res.status(403).json({ error: 'Rol no permitido' })
      const password = temporaryPassword()
      const { data: authData, error: authError } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: nombre } })
      if (authError || !authData.user) return res.status(400).json({ error: authError?.message || 'No se pudo crear el usuario Auth' })
      const userId = authData.user.id
      const expiry = expiresIn(90)
      const { error: userError } = await service.from('usuarios').insert({ id: userId, email, nombre, full_name: nombre, municipio_id: institutionId, rol: role.codigo, role_id: role.id, activo: true, es_activo: true, is_active: true, contrasena_expira: expiry })
      if (userError) { await service.auth.admin.deleteUser(userId); throw userError }
      const { error: assignmentError } = await service.from('usuarios_roles').insert({ usuario_id: userId, rol_id: role.id, institucion_id: institutionId, activo: true })
      if (assignmentError) { await service.from('usuarios').delete().eq('id', userId); await service.auth.admin.deleteUser(userId); throw assignmentError }
      await service.from('usuarios_primer_login').upsert({ usuario_id: userId, debe_cambiar_contrasena: true, primer_login_realizado: false, expira_en: new Date(Date.now() + 86_400_000).toISOString() }, { onConflict: 'usuario_id' })
      return res.status(201).json({ usuario: { id: userId, email, nombre, municipio_id: institutionId, rol: role.codigo, rol_id: role.id, activo: true, municipio_nombre: null }, contrasenaTemp: password })
    }

    const usuarioId = req.body.usuarioId
    if (!isValidUuid(usuarioId)) return res.status(400).json({ error: 'Usuario no válido' })
    const target = await scopedTarget(service, admin, usuarioId)
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado' })
    if (action === 'deactivate' || action === 'activate') {
      if (usuarioId === auth.user.id && action === 'deactivate') return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' })
      const active = action === 'activate'
      const { error } = await service.from('usuarios').update({ activo: active, es_activo: active, is_active: active }).eq('id', usuarioId)
      if (error) throw error
      await service.from('usuarios_roles').update({ activo: active }).eq('usuario_id', usuarioId)
      return res.status(200).json({ success: true })
    }
    if (action === 'reset-password') {
      const password = temporaryPassword()
      const { error } = await service.auth.admin.updateUserById(usuarioId, { password })
      if (error) throw error
      await service.from('usuarios_primer_login').upsert({ usuario_id: usuarioId, debe_cambiar_contrasena: true, primer_login_realizado: false, expira_en: new Date(Date.now() + 86_400_000).toISOString() }, { onConflict: 'usuario_id' })
      return res.status(200).json({ contrasenaTemp: password })
    }
    if (action === 'update') {
      const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : ''
      const rolId = Number(req.body.rolId)
      if (nombre.length < 2 || !Number.isInteger(rolId)) return res.status(400).json({ error: 'Nombre y rol son obligatorios' })
      const { data: role } = await service.from('roles').select('id,codigo').eq('id', rolId).maybeSingle()
      if (!role || !ALLOWED_USER_ROLES.includes(role.codigo) || (!admin.isSystemAdmin && role.codigo === 'ADMIN_SISTEMA')) return res.status(403).json({ error: 'Rol no permitido' })
      const { error } = await service.from('usuarios').update({ nombre, full_name: nombre, rol: role.codigo, role_id: role.id }).eq('id', usuarioId)
      if (error) throw error
      await service.from('usuarios_roles').update({ activo: false }).eq('usuario_id', usuarioId)
      const { error: assignmentError } = await service.from('usuarios_roles').upsert({ usuario_id: usuarioId, rol_id: role.id, institucion_id: target.municipio_id, activo: true }, { onConflict: 'usuario_id,rol_id,institucion_id' })
      if (assignmentError) throw assignmentError
      return res.status(200).json({ usuario: { ...target, nombre, rol: role.codigo, rol_id: role.id } })
    }
    return res.status(400).json({ error: 'Acción no válida' })
  } catch (error) {
    console.error('Error en gestión de usuarios:', error)
    return res.status(500).json({ error: 'No se pudo completar la operación' })
  }
}
