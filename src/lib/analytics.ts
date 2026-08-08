/**
 * Analytics - KEVANZA
 * Event tracking para métricas clave
 *
 * Eventos: crear_licitacion, recibir_oferta, evaluar_oferta, generar_reporte
 * Almacenamiento: Base de datos en tabla 'analytics_events'
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export type AnalyticsEventType =
  | 'crear_licitacion'
  | 'recibir_oferta'
  | 'evaluar_oferta'
  | 'generar_reporte'
  | 'marcar_ganadora'
  | 'cambiar_estado'

interface AnalyticsEvent {
  eventType: AnalyticsEventType
  municipioId: string
  licitacionId?: string
  ofertaId?: string
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
        municipio_id: event.municipioId,
        licitacion_id: event.licitacionId,
        oferta_id: event.ofertaId,
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
export async function obtenerMetricasDelMes(municipioId: string): Promise<{
  licitacionesCreadas: number
  ofertasRecibidas: number
  ofertasEvaluadas: number
  reportesGenerados: number
}> {
  const ahora = new Date()
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('municipio_id', municipioId)
      .gte('created_at', hace30Dias.toISOString())
      .lte('created_at', ahora.toISOString())

    if (error) throw error

    const metricas = {
      licitacionesCreadas: data.filter((e) => e.event_type === 'crear_licitacion').length,
      ofertasRecibidas: data.filter((e) => e.event_type === 'recibir_oferta').length,
      ofertasEvaluadas: data.filter((e) => e.event_type === 'evaluar_oferta').length,
      reportesGenerados: data.filter((e) => e.event_type === 'generar_reporte').length,
    }

    return metricas
  } catch (error) {
    console.error('[Analytics] Error obteniendo métricas:', error)
    return {
      licitacionesCreadas: 0,
      ofertasRecibidas: 0,
      ofertasEvaluadas: 0,
      reportesGenerados: 0,
    }
  }
}

/**
 * Obtener eventos por día (últimos 30 días)
 */
export async function obtenerEventosPorDia(municipioId: string): Promise<
  Array<{
    fecha: string
    crear_licitacion: number
    recibir_oferta: number
    evaluar_oferta: number
    generar_reporte: number
  }>
> {
  const ahora = new Date()
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('municipio_id', municipioId)
      .gte('created_at', hace30Dias.toISOString())
      .lte('created_at', ahora.toISOString())

    if (error) throw error

    // Agrupar por día
    const porDia: Record<
      string,
      {
        crear_licitacion: number
        recibir_oferta: number
        evaluar_oferta: number
        generar_reporte: number
      }
    > = {}

    data.forEach((evento: any) => {
      const fecha = new Date(evento.created_at).toISOString().split('T')[0]

      if (!porDia[fecha]) {
        porDia[fecha] = {
          crear_licitacion: 0,
          recibir_oferta: 0,
          evaluar_oferta: 0,
          generar_reporte: 0,
        }
      }

      porDia[fecha][evento.event_type as keyof typeof porDia[string]] += 1
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
 * Top municipios más activos
 */
export async function obtenerTopMunicipios(): Promise<
  Array<{
    municipioId: string
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

    // Contar eventos por municipio
    const porMunicipio: Record<string, number> = {}

    data.forEach((evento: any) => {
      if (!porMunicipio[evento.municipio_id]) {
        porMunicipio[evento.municipio_id] = 0
      }
      porMunicipio[evento.municipio_id] += 1
    })

    // Obtener nombres de municipios
    const municipioIds = Object.keys(porMunicipio)
    const { data: municipios, error: munError } = await supabase
      .from('municipios')
      .select('id, nombre')
      .in('id', municipioIds)

    if (munError) throw munError

    return Object.entries(porMunicipio)
      .map(([municipioId, total]) => {
        const nombre = municipios?.find((m: any) => m.id === municipioId)?.nombre || 'Unknown'
        return { municipioId, nombre, total_eventos: total }
      })
      .sort((a, b) => b.total_eventos - a.total_eventos)
      .slice(0, 10)
  } catch (error) {
    console.error('[Analytics] Error obteniendo top municipios:', error)
    return []
  }
}
