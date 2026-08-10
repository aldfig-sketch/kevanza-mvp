import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { createServiceSupabaseClient } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const token = req.body?.token
    if (typeof token !== 'string' || !token) return res.status(400).json({ error: 'Token requerido' })
    const client = createServiceSupabaseClient()
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const { data: solicitud, error: solicitudError } = await client
      .from('solicitudes_firma')
      .select('id, publicacion_id, token_expira, estado, publicaciones_mercado_publico(licitacion_id)')
      .eq('token_hash', tokenHash)
      .single()
    if (solicitudError || !solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' })
    if (solicitud.estado !== 'PENDIENTE' || new Date(solicitud.token_expira) <= new Date()) {
      return res.status(410).json({ error: 'La solicitud está vencida o ya fue utilizada' })
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim() || null
    const { error: updateError } = await client
      .from('solicitudes_firma')
      .update({ estado: 'FIRMADA', fecha_firma: new Date().toISOString(), ip_firma: ip })
      .eq('id', solicitud.id)
      .eq('estado', 'PENDIENTE')
    if (updateError) throw updateError

    const licitacionId = (solicitud.publicaciones_mercado_publico as { licitacion_id?: string } | null)?.licitacion_id
    const { error: publicationError } = await client
      .from('publicaciones_mercado_publico')
      .update({ estado_publicacion: 'LISTO_PUBLICACION', updated_at: new Date().toISOString() })
      .eq('id', solicitud.publicacion_id)
    if (publicationError) throw publicationError
    if (licitacionId) {
      const { error: licitacionError } = await client
        .from('licitaciones')
        .update({ estado: 'LISTO_PUBLICACION' })
        .eq('id', licitacionId)
      if (licitacionError) throw licitacionError
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error firmando decreto:', error)
    return res.status(503).json({ error: error instanceof Error ? error.message : 'Firma no configurada' })
  }
}
