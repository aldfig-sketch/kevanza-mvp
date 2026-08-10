import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createServiceSupabaseClient } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const token = typeof req.query.token === 'string' ? req.query.token : ''
    if (!token) return res.status(400).json({ error: 'Token requerido' })
    const client = createServiceSupabaseClient()
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const { data, error } = await client
      .from('solicitudes_firma')
      .select('id, publicacion_id, autoridad_email, autoridad_nombre, estado, token_expira, publicaciones_mercado_publico(numero_decreto, contenido_decreto, licitacion_id)')
      .eq('token_hash', tokenHash)
      .single()
    if (error || !data) return res.status(404).json({ error: 'Solicitud no encontrada' })
    if (data.estado !== 'PENDIENTE' || new Date(data.token_expira) <= new Date()) {
      return res.status(410).json({ error: 'La solicitud está vencida o ya fue utilizada' })
    }
    return res.status(200).json({ solicitud: data })
  } catch (error) {
    console.error('Error obteniendo solicitud de firma:', error)
    return res.status(503).json({ error: error instanceof Error ? error.message : 'Firma no configurada' })
  }
}
