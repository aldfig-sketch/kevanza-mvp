import { supabase } from './supabase'

export interface Requerimiento {
  id: string
  titulo: string
  tipo_licita: string
  presupuesto_total: number
  plazo_ejecucion_dias?: number | null
  descripcion?: string
  datos_bases?: Record<string, any>
}

export async function generarBasesPropuesta(req: Requerimiento, accessToken?: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const res = await fetch('/api/bases/generar', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        licitacionId: req.id,
        titulo: req.titulo,
        tipo: req.tipo_licita,
        presupuesto: req.presupuesto_total,
        plazo: req.plazo_ejecucion_dias,
        descripcion: req.descripcion,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Error generando bases')
    }

    return await res.json()
  } catch (error) {
    console.error('Error generando bases:', error)
    throw error
  }
}

export async function obtenerBases(licitacionId: string) {
  const { data } = await supabase
    .from('bases_generadas')
    .select('*')
    .eq('licitacion_id', licitacionId)
    .order('fecha_generacion', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function guardarAjustesUsuario(basesId: string, ajustes: Record<string, any>) {
  const { data } = await supabase
    .from('bases_generadas')
    .update({
      contenido_bases: ajustes,
      estado: 'AJUSTADO',
    })
    .eq('id', basesId)
    .select()
    .single()

  return data
}
