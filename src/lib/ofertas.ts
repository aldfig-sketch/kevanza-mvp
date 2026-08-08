import { supabase } from './supabase'
import { OfertaSchema, PuntajeSchema, type OfertaInput, type PuntajeInput } from './validators'
import { KevanzaError, errors } from './errorHandler'
import { auditLog } from './audit'

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

export async function crearOferta(
  oferta: OfertaInput,
  userId?: string
) {
  try {
    // Validate input
    const validated = OfertaSchema.parse(oferta)

    // Insert into database
    const { data, error } = await supabase
      .from('ofertas')
      .insert([
        {
          ...validated,
          estado: 'RECIBIDA',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw errors.OFERTA_SAVE_FAILED(error)

    // Log audit
    if (userId) {
      await auditLog.createdRecord(userId, 'ofertas', data.id, validated)
    }

    return data as Oferta
  } catch (error) {
    if (error instanceof KevanzaError) throw error
    throw errors.OFERTA_SAVE_FAILED(error)
  }
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
  puntajes: PuntajeInput,
  userId?: string
) {
  try {
    // Validate input
    const validated = PuntajeSchema.parse(puntajes)

    // Calculate total (server-side, not trusting client)
    const puntaje_total =
      (validated.puntaje_precio * validated.ponderacion_precio) / 100 +
      (validated.puntaje_tecnica * validated.ponderacion_tecnica) / 100 +
      (validated.puntaje_plazo * validated.ponderacion_plazo) / 100

    // Verify oferta exists first
    const { data: ofertaActual, error: notFoundError } = await supabase
      .from('ofertas')
      .select('id, estado')
      .eq('id', ofertaId)
      .single()

    if (notFoundError || !ofertaActual) {
      throw errors.OFERTA_NOT_FOUND()
    }

    // Update with validated data
    const { data, error } = await supabase
      .from('ofertas')
      .update({
        puntaje_precio: validated.puntaje_precio,
        puntaje_tecnica: validated.puntaje_tecnica,
        puntaje_plazo: validated.puntaje_plazo,
        puntaje_total: Math.round(puntaje_total * 100) / 100,
        estado: 'EVALUADA',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ofertaId)
      .select()
      .single()

    if (error) throw errors.PUNTAJE_UPDATE_FAILED(error)

    // Log audit
    if (userId) {
      await auditLog.updatedRecord(userId, 'ofertas', ofertaId, {
        puntaje_total: Math.round(puntaje_total * 100) / 100,
        estado: 'EVALUADA',
      })
    }

    return data as Oferta
  } catch (error) {
    if (error instanceof KevanzaError) throw error
    throw errors.PUNTAJE_UPDATE_FAILED(error)
  }
}

export async function marcarGanadora(ofertaId: string, userId?: string) {
  try {
    // Verify oferta exists
    const { data: ofertaActual, error: notFoundError } = await supabase
      .from('ofertas')
      .select('id, licitacion_id, estado')
      .eq('id', ofertaId)
      .single()

    if (notFoundError || !ofertaActual) {
      throw errors.OFERTA_NOT_FOUND()
    }

    // Must be EVALUADA to become GANADORA
    if (ofertaActual.estado !== 'EVALUADA') {
      throw errors.INVALID_STATE_TRANSITION(ofertaActual.estado, 'GANADORA')
    }

    // Update
    const { data, error } = await supabase
      .from('ofertas')
      .update({
        estado: 'GANADORA',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ofertaId)
      .select()
      .single()

    if (error) throw error

    // Log audit
    if (userId) {
      await auditLog.updatedRecord(userId, 'ofertas', ofertaId, {
        estado: 'GANADORA',
      })
    }

    return data as Oferta
  } catch (error) {
    if (error instanceof KevanzaError) throw error
    throw errors.SERVER_ERROR(error)
  }
}
