import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '@/lib/supabaseServer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { decretoId, basesId } = req.body
    if (!decretoId || !basesId) return res.status(400).json({ error: 'Faltan identificadores' })

    const { data: firma } = await auth.client
      .from('solicitudes_firma')
      .select('id')
      .eq('publicacion_id', decretoId)
      .eq('estado', 'FIRMADA')
      .maybeSingle()

    if (!firma) {
      return res.status(409).json({ error: 'El decreto debe estar firmado antes de publicar' })
    }

    const idMP = `MP-${new Date().getFullYear()}-${Math.random().toString().slice(2, 8).padStart(6, '0')}`
    const urlMP = `https://www.mercadopublico.cl/Procurement/Modules/RFQPublic/BiddingForPublicBidDetail/BidDetail?pubID=${idMP}`

    const { data, error } = await auth.client
      .from('publicaciones_mercado_publico')
      .update({
        estado_publicacion: 'PUBLICADA',
        id_mercado_publico: idMP,
        url_mercado_publico: urlMP,
        fecha_publicacion: new Date().toISOString(),
        publicado_por: auth.user.id,
      })
      .eq('id', decretoId)
      .in('estado_publicacion', ['PENDIENTE', 'LISTO_PUBLICACION'])
      .select()
      .single()

    if (error) throw error

    const { error: basesError } = await auth.client
      .from('bases_generadas')
      .update({ estado: 'PUBLICADA_MP' })
      .eq('id', basesId)
    if (basesError) throw basesError

    const { data: basesData } = await auth.client
      .from('bases_generadas')
      .select('licitacion_id')
      .eq('id', basesId)
      .single()

    if (basesData) {
      const { error: seguimientoError } = await auth.client
        .from('seguimiento_plazos')
        .update({
          fecha_publicacion_completada: new Date().toISOString(),
          estado_general: 'COMPLETADO',
        })
        .eq('licitacion_id', basesData.licitacion_id)
      if (seguimientoError) throw seguimientoError

      const { error: licitacionError } = await auth.client
        .from('licitaciones')
        .update({ estado: 'PUBLICADA_MP', published_at: new Date().toISOString() })
        .eq('id', basesData.licitacion_id)
      if (licitacionError) throw licitacionError
    }

    return res.status(200).json({ success: true, publicacion: data })
  } catch (error) {
    console.error('Error:', error)
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Server error' })
  }
}
