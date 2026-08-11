import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest, createServiceSupabaseClient } from '@/lib/supabaseServer'
import { hasAnyRole } from '@/lib/roles'

const ADMIN_ROLES = ['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })
  const auth = await authenticateRequest(req.headers.authorization)
  if (!auth || !(await hasAnyRole(auth.client, auth.user.id, ADMIN_ROLES))) return res.status(403).json({ error: 'No autorizado' })
  const service = createServiceSupabaseClient()
  const { data: profile } = await service.from('usuarios').select('municipio_id,rol,activo,es_activo').eq('id', auth.user.id).maybeSingle()
  if (!profile || profile.activo === false || profile.es_activo === false) return res.status(403).json({ error: 'Cuenta inactiva' })
  let query = service.from('audit_logs').select('id,usuario_id,accion,tabla,registro_id,cambios,created_at').order('created_at', { ascending: false }).limit(200)
  if (profile.rol !== 'ADMIN_SISTEMA') {
    const { data: users } = await service.from('usuarios').select('id').eq('municipio_id', profile.municipio_id)
    const ids = (users || []).map((item) => item.id)
    if (!ids.length) return res.status(200).json({ logs: [] })
    query = query.in('usuario_id', ids)
  }
  const { data, error } = await query
  if (error) return res.status(500).json({ error: 'No se pudo consultar la trazabilidad' })
  return res.status(200).json({ logs: data || [] })
}
