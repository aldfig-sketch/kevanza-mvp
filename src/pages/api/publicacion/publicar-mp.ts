import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const { decretoId, basesId, titulo, presupuesto, plazo } = req.body

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      token
    )
    if (userError || !user)
      return res.status(401).json({ error: 'Invalid token' })

    const idMP = `MP-${new Date().getFullYear()}-${Math.random().toString().slice(2, 8).padStart(6, '0')}`
    const urlMP = `https://www.mercadopublico.cl/Procurement/Modules/RFQPublic/BiddingForPublicBidDetail/BidDetail?pubID=${idMP}`

    const { data, error } = await supabase
      .from('publicaciones_mercado_publico')
      .update({
        estado_publicacion: 'PUBLICADA',
        id_mercado_publico: idMP,
        url_mercado_publico: urlMP,
        fecha_publicacion: new Date().toISOString(),
      })
      .eq('id', decretoId)
      .select()
      .single()

    if (error) throw error

    await supabase.from('bases_generadas').update({ estado: 'PUBLICADA_MP' }).eq('id', basesId)

    const { data: basesData } = await supabase
      .from('bases_generadas')
      .select('licitacion_id')
      .eq('id', basesId)
      .single()

    if (basesData) {
      await supabase
        .from('seguimiento_plazos')
        .update({
          fecha_publicacion_completada: new Date().toISOString(),
          estado_general: 'COMPLETADO',
        })
        .eq('licitacion_id', basesData.licitacion_id)
    }

    return res.status(200).json({ success: true, publicacion: data })
  } catch (error) {
    console.error('Error:', error)
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Server error' })
  }
}
