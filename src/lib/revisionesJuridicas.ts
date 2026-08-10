import { supabase } from './supabase'

export interface RevisionJuridica {
  id: string
  bases_id: string
  requerimiento_id: string
  estado: 'ENVIADA' | 'EN_REVISION' | 'OBSERVACIONES' | 'APROBADA' | 'RECHAZADA'
  observaciones_juridicas?: Record<string, any>
  fecha_envio: string
  aprobado_por?: string
  motivo_rechazo?: string
}

export async function enviarAJuridico(basesId: string, userId: string) {
  try {
    // Obtener requerimiento_id
    const { data: basesData } = await supabase
      .from('bases_generadas')
      .select('licitacion_id')
      .eq('id', basesId)
      .single()

    if (!basesData) throw new Error('Bases no encontradas')

    const { data, error } = await supabase
      .from('revisiones_juridicas')
      .insert([
        {
          bases_id: basesId,
          requerimiento_id: basesData.licitacion_id,
          enviado_por: userId,
          estado: 'ENVIADA',
        },
      ])
      .select()
      .single()

    if (error) throw error

    await notificarJuridico(data.id, 'ENVIADA')
    return data
  } catch (error) {
    console.error('Error enviando a jurídico:', error)
    throw error
  }
}

export async function obtenerRevisionesEnEspera(userId: string) {
  const { data, error } = await supabase
    .from('revisiones_juridicas')
    .select(`
      *,
      bases_generadas(
        id,
        contenido_bases,
        estado,
        licitacion_id
      ),
      licitaciones:requerimiento_id(
        id,
        numero,
        titulo,
        tipo_licita,
        presupuesto_total
      )
    `)
    .eq('asignado_a', userId)
    .in('estado', ['ENVIADA', 'EN_REVISION'])
    .order('fecha_envio', { ascending: false })

  if (error) throw error
  return data
}

export async function agregarObservaciones(
  revisionId: string,
  observaciones: Record<string, any>,
  userId: string
) {
  const { data, error } = await supabase
    .from('revisiones_juridicas')
    .update({
      estado: 'OBSERVACIONES',
      observaciones_juridicas: observaciones,
      asignado_a: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', revisionId)
    .select()
    .single()

  if (error) throw error

  await notificarJuridico(revisionId, 'OBSERVACIONES')
  return data
}

export async function aprobarBases(revisionId: string, userId: string) {
  const { data, error } = await supabase
    .from('revisiones_juridicas')
    .update({
      estado: 'APROBADA',
      aprobado_por: userId,
      fecha_aprobacion: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', revisionId)
    .select()
    .single()

  if (error) throw error

  // Actualizar bases a APROBADO
  await supabase
    .from('bases_generadas')
    .update({ estado: 'APROBADO' })
    .eq('id', data.bases_id)

  await notificarJuridico(revisionId, 'APROBADA')
  return data
}

export async function rechazarBases(
  revisionId: string,
  motivo: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('revisiones_juridicas')
    .update({
      estado: 'RECHAZADA',
      motivo_rechazo: motivo,
      asignado_a: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', revisionId)
    .select()
    .single()

  if (error) throw error

  await notificarJuridico(revisionId, 'RECHAZADA')
  return data
}

export async function obtenerHistorialRevision(basesId: string) {
  const { data, error } = await supabase
    .from('revisiones_juridicas')
    .select('*')
    .eq('bases_id', basesId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function notificarJuridico(revisionId: string, estado: string) {
  console.log(`[NOTIFICACIÓN] Revisión ${revisionId} estado: ${estado}`)
  // TODO: Implementar con SendGrid o similar
}
