import { supabase } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  notificarEnviadoAJuridico,
  notificarObservacionesJuridicas,
  notificarBasesAprobadas,
} from './emailService'

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

export async function enviarAJuridico(basesId: string, userId: string, client: SupabaseClient = supabase) {
  try {
    const db = client
    // Obtener requerimiento_id
    const { data: basesData } = await db
      .from('bases_generadas')
      .select('licitacion_id')
      .eq('id', basesId)
      .single()

    if (!basesData) throw new Error('Bases no encontradas')

    const { data, error } = await db
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

    await db
      .from('bases_generadas')
      .update({ estado: 'ENVIADA_JURIDICO', updated_at: new Date().toISOString() })
      .eq('id', basesId)

    await db
      .from('licitaciones')
      .update({ estado: 'ENVIADA_JURIDICO' })
      .eq('id', basesData.licitacion_id)

    // Enviar email al usuario
    try {
      const { data: usuarioData } = await db
        .from('usuarios')
        .select('email, nombre')
        .eq('id', userId)
        .single()

      const { data: licData } = await db
        .from('licitaciones')
        .select('titulo')
        .eq('id', basesData.licitacion_id)
        .single()

      if (usuarioData?.email && licData?.titulo) {
        await notificarEnviadoAJuridico(
          usuarioData.email,
          usuarioData.nombre || 'Usuario',
          licData.titulo
        )
      }
    } catch (emailError) {
      console.error('Error enviando email de notificación:', emailError)
    }

    return data
  } catch (error) {
    console.error('Error enviando a jurídico:', error)
    throw error
  }
}

export async function obtenerRevisionesEnEspera(userId: string, client: SupabaseClient = supabase) {
  const { data, error } = await client
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
    .or(`asignado_a.is.null,asignado_a.eq.${userId}`)
    .in('estado', ['ENVIADA', 'EN_REVISION'])
    .order('fecha_envio', { ascending: false })

  if (error) throw error

  return data
}

export async function agregarObservaciones(
  revisionId: string,
  observaciones: Record<string, any>,
  userId: string,
  client: SupabaseClient = supabase
) {
  const { data, error } = await client
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

  await client
    .from('bases_generadas')
    .update({ estado: 'OBSERVADO', updated_at: new Date().toISOString() })
    .eq('id', data.bases_id)
  await client
    .from('licitaciones')
    .update({ estado: 'OBSERVADO' })
    .eq('id', data.requerimiento_id)

  // Enviar email al usuario con observaciones
  try {
    const { data: revData } = await client
      .from('revisiones_juridicas')
      .select('enviado_por')
      .eq('id', revisionId)
      .single()

    if (revData?.enviado_por) {
      const { data: usuarioData } = await client
        .from('usuarios')
        .select('email, nombre')
        .eq('id', revData.enviado_por)
        .single()

      const { data: licData } = await client
        .from('licitaciones')
        .select('titulo')
        .eq('id', data.requerimiento_id)
        .single()

      if (usuarioData?.email && licData?.titulo) {
        await notificarObservacionesJuridicas(
          usuarioData.email,
          usuarioData.nombre || 'Usuario',
          licData.titulo,
          observaciones
        )
      }
    }
  } catch (emailError) {
    console.error('Error enviando email de observaciones:', emailError)
  }

  return data
}

export async function aprobarBases(revisionId: string, userId: string, client: SupabaseClient = supabase) {
  const { data, error } = await client
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
  await client
    .from('bases_generadas')
    .update({ estado: 'APROBADO' })
    .eq('id', data.bases_id)
  await client
    .from('licitaciones')
    .update({ estado: 'APROBADO_JURIDICO' })
    .eq('id', data.requerimiento_id)

  // Enviar email al usuario de aprobación
  try {
    const { data: revData } = await client
      .from('revisiones_juridicas')
      .select('enviado_por')
      .eq('id', revisionId)
      .single()

    if (revData?.enviado_por) {
      const { data: usuarioData } = await client
        .from('usuarios')
        .select('email, nombre')
        .eq('id', revData.enviado_por)
        .single()

      const { data: licData } = await client
        .from('licitaciones')
        .select('titulo')
        .eq('id', data.requerimiento_id)
        .single()

      if (usuarioData?.email && licData?.titulo) {
        await notificarBasesAprobadas(
          usuarioData.email,
          usuarioData.nombre || 'Usuario',
          licData.titulo
        )
      }
    }
  } catch (emailError) {
    console.error('Error enviando email de aprobación:', emailError)
  }

  return data
}

export async function rechazarBases(
  revisionId: string,
  motivo: string,
  userId: string,
  client: SupabaseClient = supabase
) {
  const { data, error } = await client
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

  return data
}

export async function obtenerHistorialRevision(basesId: string, client: SupabaseClient = supabase) {
  const { data, error } = await client
    .from('revisiones_juridicas')
    .select('*')
    .eq('bases_id', basesId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
