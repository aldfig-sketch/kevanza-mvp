import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '@/lib/supabaseServer'

const REVIEWER_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'UNIDAD_COMPRA'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { basesId, aprobada, observaciones = '' } = req.body || {}
    if (typeof basesId !== 'string' || typeof aprobada !== 'boolean') {
      return res.status(400).json({ error: 'Datos de revisión inválidos' })
    }
    if (!aprobada && !String(observaciones).trim()) {
      return res.status(400).json({ error: 'Las observaciones son obligatorias al rechazar' })
    }

    const { data: profile } = await auth.client
      .from('usuarios')
      .select('rol, activo, municipio_id')
      .eq('id', auth.user.id)
      .single()
    if (!profile?.activo || !REVIEWER_ROLES.has(profile.rol || '')) {
      return res.status(403).json({ error: 'No tienes permisos para revisar bases' })
    }

    const { data: bases, error: basesError } = await auth.client
      .from('bases_generadas')
      .select('id, licitacion_id, estado, licitaciones(municipio_id)')
      .eq('id', basesId)
      .single()
    if (basesError || !bases) return res.status(404).json({ error: 'Bases no encontradas' })
    const parent = bases.licitaciones as { municipio_id?: string } | null
    if (!parent?.municipio_id || parent.municipio_id !== profile.municipio_id) {
      return res.status(404).json({ error: 'Bases no encontradas' })
    }
    if (!['SELECCIONADA', 'PROPUESTA', 'AJUSTADO', 'OBSERVADO'].includes(bases.estado)) {
      return res.status(409).json({ error: 'Las bases no están disponibles para revisión' })
    }

    const { data: revision, error: revisionError } = await auth.client
      .from('revisiones_bases_compra')
      .insert({
        bases_id: basesId,
        licitacion_id: bases.licitacion_id,
        estado: aprobada ? 'APROBADA' : 'RECHAZADA',
        revisado_por: auth.user.id,
        observaciones: String(observaciones).trim() || null,
        fecha_revision: new Date().toISOString(),
      })
      .select()
      .single()
    if (revisionError) throw revisionError

    if (!aprobada) {
      const { error } = await auth.client
        .from('bases_generadas')
        .update({ estado: 'OBSERVADO' })
        .eq('id', basesId)
      if (error) throw error
      return res.status(200).json({ success: true, revision })
    }

    const { error: basesUpdateError } = await auth.client
      .from('bases_generadas')
      .update({ estado: 'ENVIADA_JURIDICO' })
      .eq('id', basesId)
    if (basesUpdateError) throw basesUpdateError

    const { error: licitacionError } = await auth.client
      .from('licitaciones')
      .update({ estado: 'ENVIADA_JURIDICO' })
      .eq('id', bases.licitacion_id)
    if (licitacionError) throw licitacionError

    const { error: juridicoError } = await auth.client
      .from('revisiones_juridicas')
      .insert({
        bases_id: basesId,
        requerimiento_id: bases.licitacion_id,
        enviado_por: auth.user.id,
        estado: 'ENVIADA',
      })
    if (juridicoError) throw juridicoError

    return res.status(200).json({ success: true, revision, enviadoAJuridico: true })
  } catch (error) {
    console.error('Error revisando bases:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
}
