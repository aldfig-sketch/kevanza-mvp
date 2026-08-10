import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '@/lib/supabaseServer'

const REVIEWER_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'UNIDAD_COMPRA'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { licitacionId, aprobada, observaciones = '' } = req.body || {}
    if (typeof licitacionId !== 'string' || typeof aprobada !== 'boolean') {
      return res.status(400).json({ error: 'Datos de revisión inválidos' })
    }
    if (!aprobada && !String(observaciones).trim()) {
      return res.status(400).json({ error: 'Las observaciones son obligatorias al rechazar' })
    }

    const { data: profile } = await auth.client
      .from('usuarios')
      .select('municipio_id, rol, activo')
      .eq('id', auth.user.id)
      .single()
    if (!profile?.activo || !REVIEWER_ROLES.has(profile.rol || '')) {
      return res.status(403).json({ error: 'No tienes permisos para revisar requerimientos' })
    }

    const { data: licitacion, error: licitacionError } = await auth.client
      .from('licitaciones')
      .select('id, municipio_id, estado')
      .eq('id', licitacionId)
      .single()
    if (licitacionError || !licitacion) return res.status(404).json({ error: 'Requerimiento no encontrado' })
    if (licitacion.estado !== 'BORRADOR' && licitacion.estado !== 'ENVIADA_COMPRA' && licitacion.estado !== 'RECHAZADA_COMPRA') {
      return res.status(409).json({ error: 'El requerimiento no está disponible para revisión' })
    }

    const { data: revision, error: revisionError } = await auth.client
      .from('revisiones_licitacion')
      .insert({
        licitacion_id: licitacionId,
        estado: aprobada ? 'APROBADA' : 'RECHAZADA',
        revisado_por: auth.user.id,
        observaciones: String(observaciones).trim() || null,
        fecha_revision: new Date().toISOString(),
      })
      .select()
      .single()
    if (revisionError) throw revisionError

    const { error: updateError } = await auth.client
      .from('licitaciones')
      .update({ estado: aprobada ? 'APROBADA_COMPRA' : 'RECHAZADA_COMPRA' })
      .eq('id', licitacionId)
    if (updateError) throw updateError

    return res.status(200).json({ success: true, revision })
  } catch (error) {
    console.error('Error revisando requerimiento:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
}
