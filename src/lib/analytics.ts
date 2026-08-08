/**
 * Analytics - KEVANZA
 * Event tracking para métricas clave
 *
 * Eventos: crear_requerimiento, cargar_documento, cambiar_estado, generar_reporte
 * Almacenamiento: Base de datos en tabla 'analytics_events'
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export type AnalyticsEventType =
  | 'crear_requerimiento'
  | 'cargar_documento'
  | 'marcar_listo_mercado_publico'
  | 'generar_reporte'
  | 'cambiar_estado'

interface AnalyticsEvent {
  eventType: AnalyticsEventType
  organismoId: string
  licitacionId?: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Registra evento de analytics
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await supabase.from('analytics_events').insert([
      {
        event_type: event.eventType,
        municipio_id: event.organismoId,
        licitacion_id: event.licitacionId,
        user_id: event.userId,
        metadata: event.metadata,
        created_at: new Date().toISOString(),
      },
    ])
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error)
    // No fallar la operación si analytics falla
  }
}

/**
 * Obtener métricas del último mes
 */
export async function obtenerMetricasDelMes(organismoId: string): Promise<{
  requerimientosCreados: number
  documentosCargados: number
  listosMercadoPublico: number
  reportesGenerados: number
}> {
  const ahora = new Date()
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('municipio_id', organismoId)
      .gte('created_at', hace30Dias.toISOString())
      .lte('created_at', ahora.toISOString())

    if (error) throw error

    const metricas = {
      requerimientosCreados: data.filter((e) => e.event_type === 'crear_requerimiento').length,
      documentosCargados: data.filter((e) => e.event_type === 'cargar_documento').length,
      listosMercadoPublico: data.filter((e) => e.event_type === 'marcar_listo_mercado_publico').length,
      reportesGenerados: data.filter((e) => e.event_type === 'generar_reporte').length,
    }

    return metricas
  } catch (error) {
    console.error('[Analytics] Error obteniendo métricas:', error)
    return {
      requerimientosCreados: 0,
      documentosCargados: 0,
      listosMercadoPublico: 0,
      reportesGenerados: 0,
    }
  }
}

/**
 * Obtener eventos por día (últimos 30 días)
 */
export async function obtenerEventosPorDia(organismoId: string): Promise<
  Array<{
    fecha: string
    crear_requerimiento: number
    cargar_documento: number
    marcar_listo_mercado_publico: number
    generar_reporte: number
  }>
> {
  const ahora = new Date()
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('municipio_id', organismoId)
      .gte('created_at', hace30Dias.toISOString())
      .lte('created_at', ahora.toISOString())

    if (error) throw error

    // Agrupar por día
    const porDia: Record<
      string,
      {
        crear_requerimiento: number
        cargar_documento: number
        marcar_listo_mercado_publico: number
        generar_reporte: number
      }
    > = {}

    data.forEach((evento: any) => {
      const fecha = new Date(evento.created_at).toISOString().split('T')[0]

      if (!porDia[fecha]) {
        porDia[fecha] = {
          crear_requerimiento: 0,
          cargar_documento: 0,
          marcar_listo_mercado_publico: 0,
          generar_reporte: 0,
        }
      }

      const eventType = evento.event_type as keyof typeof porDia[string]
      if (eventType in porDia[fecha]) {
        porDia[fecha][eventType] += 1
      }
    })

    return Object.entries(porDia)
      .map(([fecha, eventos]) => ({ fecha, ...eventos }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
  } catch (error) {
    console.error('[Analytics] Error obteniendo eventos por día:', error)
    return []
  }
}

/**
 * Top organismos más activos
 */
export async function obtenerTopMunicipios(): Promise<
  Array<{
    organismoId: string
    nombre: string
    total_eventos: number
  }>
> {
  const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('municipio_id')
      .gte('created_at', hace30Dias.toISOString())

    if (error) throw error

    const porOrganismo: Record<string, number> = {}

    data.forEach((evento: any) => {
      if (!porOrganismo[evento.municipio_id]) {
        porOrganismo[evento.municipio_id] = 0
      }
      porOrganismo[evento.municipio_id] += 1
    })

    const organismoIds = Object.keys(porOrganismo)
    const { data: organismos, error: munError } = await supabase
      .from('municipios')
      .select('id, nombre')
      .in('id', organismoIds)

    if (munError) throw munError

    return Object.entries(porOrganismo)
      .map(([organismoId, total]) => {
        const nombre = organismos?.find((m: any) => m.id === organismoId)?.nombre || 'Unknown'
        return { organismoId, nombre, total_eventos: total }
      })
      .sort((a, b) => b.total_eventos - a.total_eventos)
      .slice(0, 10)
  } catch (error) {
    console.error('[Analytics] Error obteniendo top municipios:', error)
    return []
  }
}
