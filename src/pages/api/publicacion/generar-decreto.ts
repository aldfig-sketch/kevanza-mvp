import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '@/lib/supabaseServer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { basesId } = req.body

    const { data: bases } = await auth.client
      .from('bases_generadas')
      .select('*, licitaciones(*)')
      .eq('id', basesId)
      .single()

    if (!bases || bases.estado !== 'APROBADO') {
      return res.status(400).json({ error: 'Bases no están aprobadas' })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) return res.status(503).json({ error: 'Generación IA no configurada' })

    const { data: municipio } = await auth.client
      .from('municipios')
      .select('nombre')
      .eq('id', bases.licitaciones.municipio_id)
      .single()

    const fetch_response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `ERES EXPERTO EN DECRETOS MUNICIPALES CHILENOS.

Municipio: ${municipio?.nombre || 'Municipio'}
Requerimiento: ${bases.licitaciones.titulo}
Tipo: ${bases.licitaciones.tipo_licita}
Presupuesto: $${bases.licitaciones.presupuesto_total}
Plazo: ${bases.licitaciones.plazo_ejecucion_dias} días

GENERA UN DECRETO CONFORME A LEY 18.575:

DECRETO Nº [NÚMERO]
Fecha: ${new Date().toLocaleDateString('es-CL')}

CONSIDERANDO:
1º Que el artículo 4º de la Ley Nº 18.575 autoriza dictar actos...
2º Que es necesario autorizar la adquisición de ${bases.licitaciones.titulo}...
3º Que las presentes bases cumplen requisitos Ley Nº 19.886...

RESUELVE:
1º Autorizar la adquisición de ${bases.licitaciones.titulo}
2º Apruébanse las Bases Administrativas y Técnicas
3º Esta adquisición será tramitada conforme Ley Nº 19.886
4º Publíquese en Boletín del Ministerio de Hacienda

El Alcalde,
_____________________
[FIRMA Y TIMBRE]`,
          },
        ],
      }),
    })

    if (!fetch_response.ok) {
      const detail = await fetch_response.text()
      return res.status(502).json({ error: `Error del proveedor IA: ${detail}` })
    }

    const aiResponse = await fetch_response.json()
    const contenidoDecreto =
      aiResponse.content && aiResponse.content[0]
        ? aiResponse.content[0].text
        : 'Error generando decreto'

    const { data: ultimos } = await auth.client
      .from('publicaciones_mercado_publico')
      .select('numero_decreto')
      .order('created_at', { ascending: false })
      .limit(1)

    const anio = new Date().getFullYear()
    const numeroDecreto =
      ultimos && ultimos.length > 0
        ? `${anio}-${parseInt(ultimos[0].numero_decreto.split('-')[1]) + 1}`
        : `${anio}-0001`

    const { data: publicacion, error: pubError } = await auth.client
      .from('publicaciones_mercado_publico')
      .insert([
        {
          bases_id: basesId,
          licitacion_id: bases.licitaciones.id,
          publicado_por: auth.user.id,
          numero_decreto: numeroDecreto,
          fecha_decreto: new Date().toISOString(),
          contenido_decreto: contenidoDecreto,
          estado_publicacion: 'PENDIENTE',
        },
      ])
      .select()
      .single()

    if (pubError) throw pubError

    return res.status(200).json({ success: true, decreto: publicacion })
  } catch (error) {
    console.error('Error:', error)
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Server error' })
  }
}
