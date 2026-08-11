import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '@/lib/supabaseServer'
import { hasAnyRole } from '@/lib/roles'

const ADMIN_ROLES = ['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const body = req.body || {}
    const action = body.action
    const isAdmin = await hasAnyRole(auth.client, auth.user.id, ADMIN_ROLES)

    if (action === 'crear') {
      if (!isAdmin && !(await hasAnyRole(auth.client, auth.user.id, ['UNIDAD_COMPRA']))) {
        return res.status(403).json({ error: 'No tienes permiso para crear versiones' })
      }
      if (typeof body.basesTipoId !== 'string' || typeof body.version !== 'string' || !isRecord(body.contenido)) {
        return res.status(400).json({ error: 'Tipo de base, versión y contenido son obligatorios' })
      }
      if (!/^\d+(\.\d+)?$/.test(body.version) || body.version.length > 20) {
        return res.status(400).json({ error: 'La versión debe ser numérica, por ejemplo 2.0' })
      }

      const { data: template, error: templateError } = await auth.client
        .from('bases_tipos')
        .select('id,institucion_id,activo')
        .eq('id', body.basesTipoId)
        .eq('activo', true)
        .maybeSingle()
      if (templateError || !template) return res.status(404).json({ error: 'Base tipo no encontrada' })

      const { data: profile } = await auth.client.from('usuarios').select('municipio_id').eq('id', auth.user.id).single()
      if (!profile || (template.institucion_id && template.institucion_id !== profile.municipio_id)) {
        return res.status(403).json({ error: 'La base tipo no pertenece a tu organismo' })
      }

      const { data, error } = await auth.client.from('bases_tipo_versiones').insert({
        bases_tipo_id: body.basesTipoId,
        version: body.version,
        contenido: body.contenido,
        estado: 'PENDIENTE_REVISION',
        solicitada_por: auth.user.id,
      }).select().single()
      if (error) return res.status(error.code === '23505' ? 409 : 400).json({ error: error.message })
      return res.status(201).json({ version: data })
    }

    if (!['jefatura', 'juridico'].includes(action)) return res.status(400).json({ error: 'Acción no válida' })
    if (typeof body.versionId !== 'string') return res.status(400).json({ error: 'Versión obligatoria' })

    const allowed = action === 'jefatura' ? ['JEFE_COMPRAS'] : ['JURIDICO']
    if (!isAdmin && !(await hasAnyRole(auth.client, auth.user.id, allowed))) {
      return res.status(403).json({ error: 'No tienes permiso para aprobar esta versión' })
    }

    const { data: version, error: versionError } = await auth.client
      .from('bases_tipo_versiones')
      .select('id,bases_tipo_id,version,contenido,estado,aprobada_jefatura,aprobada_juridico,bases_tipos(institucion_id)')
      .eq('id', body.versionId)
      .single()
    if (versionError || !version) return res.status(404).json({ error: 'Versión no encontrada' })
    const template = Array.isArray(version.bases_tipos) ? version.bases_tipos[0] : version.bases_tipos
    const { data: profile } = await auth.client.from('usuarios').select('municipio_id').eq('id', auth.user.id).single()
    if (template?.institucion_id && template.institucion_id !== profile?.municipio_id) {
      return res.status(403).json({ error: 'La versión no pertenece a tu organismo' })
    }
    if (version.estado === 'RECHAZADA') return res.status(409).json({ error: 'Una versión rechazada no puede aprobarse' })

    const approvedByJefatura = action === 'jefatura' ? true : version.aprobada_jefatura === true
    const approvedByJuridico = action === 'juridico' ? true : version.aprobada_juridico === true
    const update = action === 'jefatura'
      ? { aprobada_jefatura: true, revisada_jefatura_por: auth.user.id, fecha_revision_jefatura: new Date().toISOString(), estado: approvedByJuridico ? 'APROBADA' : 'APROBADA_JEFATURA' }
      : { aprobada_juridico: true, revisada_juridico_por: auth.user.id, fecha_revision_juridico: new Date().toISOString(), estado: approvedByJefatura ? 'APROBADA' : 'PENDIENTE_REVISION' }

    const { data: updated, error: updateError } = await auth.client.from('bases_tipo_versiones').update({
      ...update,
      ...(approvedByJefatura && approvedByJuridico ? { activada_como_oficial: new Date().toISOString() } : {}),
    }).eq('id', body.versionId).select().single()
    if (updateError) throw updateError

    if (approvedByJefatura && approvedByJuridico) {
      const contenido = isRecord(version.contenido) ? version.contenido : {}
      const estructura = contenido.estructura || contenido.estructura_base || contenido
      const { error: templateUpdateError } = await auth.client.from('bases_tipos').update({
        estructura_base: estructura,
        version: Number.parseInt(String(version.version || '1'), 10) || 1,
        actualizado_por: auth.user.id,
        fecha_actualizacion: new Date().toISOString(),
      }).eq('id', version.bases_tipo_id)
      if (templateUpdateError) throw templateUpdateError
    }

    return res.status(200).json({ version: updated })
  } catch (error) {
    console.error('Error gestionando versión de base:', error)
    return res.status(500).json({ error: 'No se pudo gestionar la versión' })
  }
}
