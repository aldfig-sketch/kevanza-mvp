import { supabase } from './supabase'

export interface Oferta {
  id: string
  licitacion_id: string
  proveedor_nombre: string
  proveedor_email: string
  precio_ofertado: number
  plazo_dias: number
  descripcion_tecnica?: string
  puntaje_precio?: number
  puntaje_tecnica?: number
  puntaje_plazo?: number
  puntaje_total?: number
  estado: string
  created_at: string
  updated_at: string
}

export async function crearOferta(oferta: {
  licitacion_id: string
  proveedor_nombre: string
  proveedor_email: string
  precio_ofertado: number
  plazo_dias: number
  descripcion_tecnica?: string
}) {
  const { data, error } = await supabase
    .from('ofertas')
    .insert([oferta])
    .select()
    .single()

  if (error) throw error
  return data as Oferta
}

export async function obtenerOfertasPorLicitacion(licitacionId: string) {
  const { data, error } = await supabase
    .from('ofertas')
    .select('*')
    .eq('licitacion_id', licitacionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Oferta[]
}

export async function obtenerOferta(ofertaId: string) {
  const { data, error } = await supabase
    .from('ofertas')
    .select('*')
    .eq('id', ofertaId)
    .single()

  if (error) throw error
  return data as Oferta
}

export async function actualizarPuntajeOferta(
  ofertaId: string,
  puntajes: {
    puntaje_precio: number
    puntaje_tecnica: number
    puntaje_plazo: number
    ponderacion_precio: number
    ponderacion_tecnica: number
    ponderacion_plazo: number
  }
) {
  const puntaje_total =
    (puntajes.puntaje_precio * puntajes.ponderacion_precio) / 100 +
    (puntajes.puntaje_tecnica * puntajes.ponderacion_tecnica) / 100 +
    (puntajes.puntaje_plazo * puntajes.ponderacion_plazo) / 100

  const { data, error } = await supabase
    .from('ofertas')
    .update({
      puntaje_precio: puntajes.puntaje_precio,
      puntaje_tecnica: puntajes.puntaje_tecnica,
      puntaje_plazo: puntajes.puntaje_plazo,
      puntaje_total: Math.round(puntaje_total * 100) / 100,
      estado: 'EVALUADA',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ofertaId)
    .select()
    .single()

  if (error) throw error
  return data as Oferta
}

export async function marcarGanadora(ofertaId: string) {
  const { data, error } = await supabase
    .from('ofertas')
    .update({ estado: 'GANADORA', updated_at: new Date().toISOString() })
    .eq('id', ofertaId)
    .select()
    .single()

  if (error) throw error
  return data as Oferta
}
