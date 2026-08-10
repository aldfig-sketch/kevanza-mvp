import type { NextApiRequest, NextApiResponse } from 'next'

interface GenerarBasesRequest {
  licitacionId: string
  titulo: string
  tipo: string
  presupuesto: number
  plazo?: number
  descripcion?: string
}

interface AnthropicMessage {
  content: Array<{ type: string; text: string }>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - no token provided' })
    }

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

    // Call Anthropic API directly via fetch
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      throw new Error(`Claude API error: ${error}`)
    }

    const message = (await claudeResponse.json()) as AnthropicMessage
    const textContent = message.content.find((block) => block.type === 'text')
    if (!textContent) {
      throw new Error('No text response from Claude')
    }

    const contenidoIA = JSON.parse(textContent.text)

    // Insert via REST API with authenticated user token
    const supabaseResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/bases_generadas`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

    if (!supabaseResponse.ok) {
      const error = await supabaseResponse.text()
      throw new Error(`Supabase error: ${error}`)
    }

    const basesGenerada = await supabaseResponse.json()
    return res.status(200).json(basesGenerada[0] || basesGenerada)
  } catch (error) {
    console.error('Error generando bases:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
