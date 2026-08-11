import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest, createServiceSupabaseClient } from '@/lib/supabaseServer'

const ACTIONS = new Set(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT', 'DOWNLOAD'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  const auth = await authenticateRequest(req.headers.authorization)
  if (!auth) return res.status(401).json({ error: 'Sesión no válida' })
  const { accion, tabla, registro_id, cambios } = req.body || {}
  if (!ACTIONS.has(accion) || typeof tabla !== 'string' || !/^[a-z][a-z0-9_]{0,99}$/.test(tabla)) return res.status(400).json({ error: 'Entrada de auditoría no válida' })
  const service = createServiceSupabaseClient()
  const { error } = await service.from('audit_logs').insert({
    usuario_id: auth.user.id,
    accion,
    tabla,
    registro_id: typeof registro_id === 'string' ? registro_id : null,
    cambios: cambios && typeof cambios === 'object' ? cambios : {},
    user_agent: req.headers['user-agent'] || null,
  })
  if (error) return res.status(500).json({ error: 'No se pudo registrar la auditoría' })
  return res.status(201).json({ success: true })
}
