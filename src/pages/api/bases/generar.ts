import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'

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

    if (!licitacionId || !titulo || !tipo || presupuesto === null || presupuesto === undefined) {
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

    // Insert directly via REST API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/bases_generadas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          licitacion_id: licitacionId,
          tipo_compra: tipo,
          contenido_bases: contenidoIA,
          estado: 'PROPUESTA',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Supabase error: ${error}`)
    }

    const basesGenerada = await response.json()
    return res.status(200).json(basesGenerada[0] || basesGenerada)
  } catch (error) {
    console.error('Error generando bases:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
