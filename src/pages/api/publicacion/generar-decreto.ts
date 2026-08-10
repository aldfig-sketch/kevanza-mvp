import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { basesId } = await req.json()

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      token
    )
    if (userError || !user)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('municipio_id')
      .eq('id', user.id)
      .single()

    if (!usuario?.municipio_id) {
      return NextResponse.json(
        { error: 'No municipio found' },
        { status: 400 }
      )
    }

    const { data: bases } = await supabase
      .from('bases_generadas')
      .select('*, requerimientos(*)')
      .eq('id', basesId)
      .single()

    if (!bases || bases.estado !== 'APROBADO') {
      throw new Error('Bases no están aprobadas')
    }

    const { data: municipio } = await supabase
      .from('municipios')
      .select('nombre')
      .eq('id', usuario.municipio_id)
      .single()

    const client = new Anthropic()
    const ahora = new Date()
    const anio = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')

    const prompt = `ERES EXPERTO EN REDACCIÓN DE DECRETOS MUNICIPALES CHILENOS.

Municipio: ${municipio?.nombre || 'Municipio'}
Requerimiento: ${bases.requerimientos.titulo}
Tipo: ${bases.requerimientos.tipo_licita || 'Adquisición'}
Presupuesto: $${bases.requerimientos.presupuesto_total}
Plazo: ${bases.requerimientos.plazo_ejecucion_dias} días

GENERA UN DECRETO CONFORME A LEY 18.575 (Bases de Procedimiento Administrativo):

FORMATO EXACTO:

DECRETO Nº [NÚMERO]
Fecha: ${dia}-${mes}-${anio}

CONSIDERANDO:

1º Que el artículo 4º de la Ley Nº 18.575, Bases Generales de la Administración del Estado, autoriza a los órganos de la Administración para dictar actos y resoluciones en materias de su competencia;

2º Que es necesario autorizar la adquisición de ${bases.requerimientos.titulo} conforme a las bases administrativas y técnicas adjuntas;

3º Que las presentes bases cumplen con los requisitos legales establecidos en la Ley Nº 19.886 sobre Compras Públicas.

RESUELVE:

1º Autorizar la adquisición de ${bases.requerimientos.titulo}, por un monto estimado de \$${bases.requerimientos.presupuesto_total}.

2º Apruébanse las Bases Administrativas y Técnicas para dicha adquisición, que se adjuntan como anexo.

3º Esta adquisición será tramitada conforme a lo establecido en la Ley Nº 19.886 y su Reglamento.

4º Publíquese este decreto en el Boletín del Ministerio de Hacienda y en el Sistema de Compras Públicas.

Contra esta resolución procede el recurso de reclamación de conformidad a los artículos 51 y siguientes de la Ley Nº 18.575.

El Alcalde,

_____________________
[FIRMA Y TIMBRE]

---

INSTRUCCIONES:
- Redacta decreto completo, profesional, listo para firmar
- Incluye considerandos legales (Ley 18.575, Ley 19.886)
- Numeración clara de artículos
- Formato municipal chileno
- Espacio para firma del alcalde`

    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const contenidoDecreto =
      message.content[0].type === 'text' ? message.content[0].text : ''

    const { data: ultimos } = await supabase
      .from('publicaciones_mercado_publico')
      .select('numero_decreto')
      .order('created_at', { ascending: false })
      .limit(1)

    const numeroDecreto =
      ultimos && ultimos.length > 0
        ? `${anio}-${String(parseInt(ultimos[0].numero_decreto.split('-')[1]) + 1).padStart(4, '0')}`
        : `${anio}-0001`

    const { data: publicacion, error } = await supabase
      .from('publicaciones_mercado_publico')
      .insert([
        {
          bases_id: basesId,
          requerimiento_id: bases.requerimiento_id,
          numero_decreto: numeroDecreto,
          fecha_decreto: ahora.toISOString(),
          contenido_decreto: contenidoDecreto,
          estado_publicacion: 'PENDIENTE',
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, decreto: publicacion })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
