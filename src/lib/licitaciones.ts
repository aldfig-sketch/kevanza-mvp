import { supabase } from './supabase'

export interface Licitacion {
  id: string
  numero: string
  titulo: string
  descripcion?: string
  estado: string
  tipo_licita: string
  municipio_id: string
  presupuesto_total: number
  ponderacion_precio: number
  ponderacion_tecnica: number
  ponderacion_experiencia: number
  ponderacion_plazo: number
  ponderacion_otro: number
  created_at: string
  created_by: string
}

export async function obtenerLicitacion(id: string): Promise<Licitacion> {
  const { data, error } = await supabase
    .from('licitaciones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Licitacion
}

export async function obtenerLicitaciones(): Promise<Licitacion[]> {
  const { data, error } = await supabase
    .from('licitaciones')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Licitacion[]
}
