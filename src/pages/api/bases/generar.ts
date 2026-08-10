import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

interface GenerarBasesRequest {
  licitacionId: string
  titulo: string
  tipo: string
  presupuesto: number
  plazo?: number
  descripcion?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { licitacionId, titulo, tipo, presupuesto, plazo, descripcion } = req.body as GenerarBasesRequest

    if (!licitacionId || !titulo || !tipo || !presupuesto) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const prompt = `ERES EXPERTO EN BASES DE LICITACIONES PÚBLICAS CHILE (Ley 19.886 / DS 661/2024).

Requerimiento:
- Título: ${titulo}
- Tipo: ${tipo}
- Presupuesto: $${presupuesto.toLocaleString('es-CL')} CLP
- Plazo: ${plazo || '(no especificado)'} días
- Descripción: ${descripcion || '(sin descripción)'}

GENERA PROPUESTA ESTRUCTURADA DE BASES:

Devuelve JSON con esta estructura (sin markdown, JSON puro):
{
  "antecedentes": "3-4 párrafos introductorios",
  "objeto": "Definición clara del objeto de compra",
  "especificaciones": "Requisitos técnicos y de calidad",
  "presupuesto": "Desglose y monto máximo",
  "plazos": "Ejecución, vigencia, hitos",
  "garantias": {
    "seriedad_porcentaje": "Ej: 2-5%",
    "cumplimiento_porcentaje": "Ej: 5-30%"
  },
  "condiciones_pago": "Modalidad, plazos, documentación",
  "penalidades": "Por incumplimiento de plazos/especificaciones",
  "clausulas_obligatorias": ["Pacto de Integridad", "Multas y Sanciones", "Resolución de Contrato", "Subcontratación", "Obligaciones Laborales", "Fuerza Mayor", "Competencia de Tribunales"],
  "controversias": "Jurisdicción y resolución de conflictos"
}

Genera SOLO JSON. Sin explicaciones. Formato profesional.`

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    const contenidoIA = JSON.parse(textContent.text)

    // Guardar en BD
    const { data: basesGenerada, error } = await supabase
      .from('bases_generadas')
      .insert([
        {
          licitacion_id: licitacionId,
          tipo_compra: tipo,
          contenido_bases: contenidoIA,
          estado: 'PROPUESTA',
        },
      ])
      .select()
      .single()

    if (error) throw error

    return res.status(200).json(basesGenerada)
  } catch (error) {
    console.error('Error generando bases:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
