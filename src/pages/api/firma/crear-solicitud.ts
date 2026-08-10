import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { authenticateRequest } from '@/lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { publicacionId, autoridadEmail, autoridadNombre } = req.body || {}
    if (!publicacionId || !autoridadEmail || !autoridadNombre) {
      return res.status(400).json({ error: 'Faltan datos de la autoridad o publicación' })
    }

    const { data: publicacion, error: publicacionError } = await auth.client
      .from('publicaciones_mercado_publico')
      .select('id, licitacion_id, estado_publicacion')
      .eq('id', publicacionId)
      .single()
    if (publicacionError || !publicacion) return res.status(404).json({ error: 'Decreto no encontrado' })
    if (publicacion.estado_publicacion !== 'PENDIENTE') {
      return res.status(409).json({ error: 'El decreto ya tiene una solicitud o fue publicado' })
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: solicitud, error: insertError } = await auth.client
      .from('solicitudes_firma')
      .insert({
        publicacion_id: publicacionId,
        token_hash: tokenHash,
        token_expira: expiresAt,
        autoridad_email: String(autoridadEmail).trim(),
        autoridad_nombre: String(autoridadNombre).trim(),
        estado: 'PENDIENTE',
      })
      .select('id, publicacion_id, autoridad_email, autoridad_nombre, token_expira, estado')
      .single()
    if (insertError) throw insertError

    const { error: publicationUpdateError } = await auth.client
      .from('publicaciones_mercado_publico')
      .update({ estado_publicacion: 'PENDIENTE_FIRMA', updated_at: new Date().toISOString() })
      .eq('id', publicacionId)
    if (publicationUpdateError) throw publicationUpdateError

    const { error: licitacionUpdateError } = await auth.client
      .from('licitaciones')
      .update({ estado: 'PENDIENTE_FIRMA' })
      .eq('id', publicacion.licitacion_id)
    if (licitacionUpdateError) throw licitacionUpdateError

    return res.status(200).json({
      success: true,
      solicitud,
      linkFirma: `${process.env.NEXT_PUBLIC_APP_URL || ''}/firmar/${rawToken}`,
    })
  } catch (error) {
    console.error('Error creando solicitud de firma:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
}
