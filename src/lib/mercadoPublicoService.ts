import { supabase } from './supabase'

export interface PublicacionMP {
  id: string
  titulo: string
  presupuesto: number
  plazo: number
  estado: string
}

export async function publicarEnMercadoPublico(
  decretoId: string,
  basesId: string,
  titulo: string,
  presupuesto: number,
  plazo: number
): Promise<PublicacionMP> {
  try {
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

    await supabase
      .from('bases_generadas')
      .update({ estado: 'PUBLICADA_MP' })
      .eq('id', basesId)

    await supabase
      .from('seguimiento_plazos')
      .update({
        fecha_publicacion_completada: new Date().toISOString(),
        estado_general: 'COMPLETADO',
      })
      .eq('requerimiento_id', data.requerimiento_id)

    return {
      id: idMP,
      titulo,
      presupuesto,
      plazo,
      estado: 'PUBLICADA',
    }
  } catch (error) {
    console.error('Error publicando en MP:', error)
    throw error
  }
}

export async function obtenerEstadoPublicacion(decretoId: string) {
  const { data } = await supabase
    .from('publicaciones_mercado_publico')
    .select('*')
    .eq('id', decretoId)
    .single()

  return data
}

export async function cerrarPublicacion(
  decretoId: string,
  ofertasRecibidas: number
) {
  const { data, error } = await supabase
    .from('publicaciones_mercado_publico')
    .update({
      estado_publicacion: 'CERRADA',
      fecha_cierre: new Date().toISOString(),
      ofertas_recibidas: ofertasRecibidas,
    })
    .eq('id', decretoId)
    .select()
    .single()

  if (error) throw error
  return data
}
