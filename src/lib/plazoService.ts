import { supabase } from './supabase'

export interface ConfiguracionPlazos {
  id: string
  municipio_id: string
  plazo_requerimiento_a_bases: number
  plazo_bases_a_juridico: number
  plazo_revision_juridica: number
  plazo_observaciones_ajuste: number
  plazo_decreto: number
  plazo_publicacion: number
  alerta_anticipada_dias: number
  email_alertas: string
}

export interface SeguimientoPlazo {
  id: string
  requerimiento_id: string
  fecha_requerimiento: string
  fecha_limite_bases: string
  fecha_limite_juridico: string
  fecha_limite_decreto: string
  fecha_limite_publicacion: string
  estado_general: 'ON_TRACK' | 'EN_RIESGO' | 'ATRASADO' | 'COMPLETADO'
}

export async function obtenerConfiguracionPlazos(
  municipioId: string
): Promise<ConfiguracionPlazos> {
  const { data, error } = await supabase
    .from('configuracion_plazos')
    .select('*')
    .eq('municipio_id', municipioId)
    .single()

  if (error && error.code === 'PGRST116') {
    return crearConfiguracionDefault(municipioId)
  }

  if (error) throw error
  return data
}

async function crearConfiguracionDefault(
  municipioId: string
): Promise<ConfiguracionPlazos> {
  const { data, error } = await supabase
    .from('configuracion_plazos')
    .insert([{ municipio_id: municipioId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function actualizarConfiguracionPlazos(
  municipioId: string,
  config: Partial<ConfiguracionPlazos>
): Promise<ConfiguracionPlazos> {
  const { data, error } = await supabase
    .from('configuracion_plazos')
    .update({ ...config, updated_at: new Date().toISOString() })
    .eq('municipio_id', municipioId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function crearSeguimientoPlazo(
  requerimientoId: string,
  municipioId: string
): Promise<SeguimientoPlazo> {
  const config = await obtenerConfiguracionPlazos(municipioId)
  const ahora = new Date()

  const fechaLimiteBases = new Date(ahora)
  fechaLimiteBases.setDate(fechaLimiteBases.getDate() + config.plazo_requerimiento_a_bases)

  const fechaLimiteJuridico = new Date(fechaLimiteBases)
  fechaLimiteJuridico.setDate(
    fechaLimiteJuridico.getDate() + config.plazo_bases_a_juridico
  )

  const fechaLimiteDecreto = new Date(fechaLimiteJuridico)
  fechaLimiteDecreto.setDate(
    fechaLimiteDecreto.getDate() +
      config.plazo_revision_juridica +
      config.plazo_observaciones_ajuste
  )

  const fechaLimitePublicacion = new Date(fechaLimiteDecreto)
  fechaLimitePublicacion.setDate(
    fechaLimitePublicacion.getDate() +
      config.plazo_decreto +
      config.plazo_publicacion
  )

  const { data, error } = await supabase
    .from('seguimiento_plazos')
    .insert([
      {
        requerimiento_id: requerimientoId,
        fecha_requerimiento: ahora.toISOString(),
        fecha_limite_bases: fechaLimiteBases.toISOString(),
        fecha_limite_juridico: fechaLimiteJuridico.toISOString(),
        fecha_limite_decreto: fechaLimiteDecreto.toISOString(),
        fecha_limite_publicacion: fechaLimitePublicacion.toISOString(),
        estado_general: 'ON_TRACK',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function verificarEstadoPlazos(
  requerimientoId: string
): Promise<SeguimientoPlazo> {
  const { data: seguimiento, error: errSeg } = await supabase
    .from('seguimiento_plazos')
    .select('*')
    .eq('requerimiento_id', requerimientoId)
    .single()

  if (errSeg) throw errSeg

  const ahora = new Date()
  let nuevoEstado: 'ON_TRACK' | 'EN_RIESGO' | 'ATRASADO' | 'COMPLETADO' = 'ON_TRACK'

  if (seguimiento.fecha_publicacion_completada) {
    nuevoEstado = 'COMPLETADO'
  } else if (ahora > new Date(seguimiento.fecha_limite_publicacion)) {
    nuevoEstado = 'ATRASADO'
  } else if (
    ahora >
    new Date(new Date(seguimiento.fecha_limite_bases).getTime() - 1 * 24 * 60 * 60 * 1000)
  ) {
    nuevoEstado = 'EN_RIESGO'
  }

  const { data, error } = await supabase
    .from('seguimiento_plazos')
    .update({ estado_general: nuevoEstado, updated_at: new Date().toISOString() })
    .eq('requerimiento_id', requerimientoId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function marcarHitoCompletado(
  requerimientoId: string,
  hito: 'bases' | 'juridico' | 'decreto' | 'publicacion'
): Promise<SeguimientoPlazo> {
  const updateData: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }

  switch (hito) {
    case 'bases':
      updateData.fecha_bases_completadas = new Date().toISOString()
      break
    case 'juridico':
      updateData.fecha_juridico_completado = new Date().toISOString()
      break
    case 'decreto':
      updateData.fecha_decreto_completado = new Date().toISOString()
      break
    case 'publicacion':
      updateData.fecha_publicacion_completada = new Date().toISOString()
      break
  }

  const { data, error } = await supabase
    .from('seguimiento_plazos')
    .update(updateData)
    .eq('requerimiento_id', requerimientoId)
    .select()
    .single()

  if (error) throw error

  return verificarEstadoPlazos(requerimientoId)
}

export async function obtenerRequerimientosEnRiesgo(municipioId: string) {
  const { data, error } = await supabase
    .from('seguimiento_plazos')
    .select(
      `
      *,
      licitaciones:requerimiento_id(
        id,
        numero,
        titulo,
        municipio_id
      )
    `
    )
    .in('estado_general', ['EN_RIESGO', 'ATRASADO'])
    .order('fecha_limite_bases', { ascending: true })

  if (error) throw error
  return data
}
