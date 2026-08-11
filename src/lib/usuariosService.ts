import { supabase } from './supabase'

export interface UsuarioAdmin {
  id: string
  email: string
  nombre: string | null
  municipio_id: string | null
  municipio_nombre: string | null
  rol: string | null
  rol_id: number | null
  activo: boolean
  ultimo_login: string | null
  contrasena_expira: string | null
}

export interface RolAdmin {
  id: number
  codigo: string
  nombre: string
  nivel_acceso: number
}

export interface InstitucionAdmin {
  id: string
  nombre: string
}

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('La sesión expiró. Inicia sesión nuevamente.')

  const response = await fetch('/api/admin/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'No se pudo completar la operación')
  return payload as T
}

export async function listarUsuarios(institucionId?: string) {
  return request<{ usuarios: UsuarioAdmin[] }>({ action: 'list', institucionId })
}

export async function obtenerMetadatosUsuarios() {
  return request<{ roles: RolAdmin[]; instituciones: InstitucionAdmin[] }>({ action: 'meta' })
}

export async function crearUsuario(datos: {
  email: string
  nombre: string
  rolId: number
  institucionId: string
}) {
  return request<{ usuario: UsuarioAdmin; contrasenaTemp: string }>({ action: 'create', ...datos })
}

export async function editarUsuario(usuarioId: string, datos: { nombre: string; rolId: number }) {
  return request<{ usuario: UsuarioAdmin }>({ action: 'update', usuarioId, ...datos })
}

export async function desactivarUsuario(usuarioId: string) {
  return request<{ success: true }>({ action: 'deactivate', usuarioId })
}

export async function activarUsuario(usuarioId: string) {
  return request<{ success: true }>({ action: 'activate', usuarioId })
}

export async function resetearContrasena(usuarioId: string) {
  return request<{ contrasenaTemp: string }>({ action: 'reset-password', usuarioId })
}

export async function cambiarContrasena(password: string) {
  return request<{ success: true }>({ action: 'change-own-password', password })
}

export async function registrarLogin() {
  return request<{ success: true }>({ action: 'record-login' })
}
