import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '@/lib/supabaseServer'
import { hasAnyRole } from '@/lib/roles'

const ROLES_COMPRA = ['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_COMPRA']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const auth = await authenticateRequest(req.headers.authorization)
    if (!auth) return res.status(401).json({ error: 'Usuario no válido' })

    const { licitacionId, basesTipoId } = req.body || {}
    if (typeof licitacionId !== 'string' || typeof basesTipoId !== 'string') {
      return res.status(400).json({ error: 'Requerimiento y base tipo son obligatorios' })
    }

    const { data: profile } = await auth.client
      .from('usuarios')
      .select('municipio_id, rol, activo')
      .eq('id', auth.user.id)
      .single()
    if (!profile?.activo || !(await hasAnyRole(auth.client, auth.user.id, ROLES_COMPRA))) {
      return res.status(403).json({ error: 'Solo la Unidad de Compra puede seleccionar la base tipo' })
    }

    const { data: requerimiento, error: reqError } = await auth.client
      .from('licitaciones')
      .select('id, municipio_id, tipo_licita, estado')
      .eq('id', licitacionId)
      .single()
    if (reqError || !requerimiento || requerimiento.municipio_id !== profile.municipio_id) {
      return res.status(404).json({ error: 'Requerimiento no encontrado' })
    }
    if (!['APROBADA_COMPRA', 'BASES_GENERADAS', 'OBSERVADO'].includes(requerimiento.estado)) {
      return res.status(409).json({ error: 'El requerimiento no está listo para seleccionar bases' })
    }

    const { data: plantilla, error: plantillaError } = await auth.client
      .from('bases_tipos')
      .select('id, tipo_compra, nombre, version, estructura_base, institucion_id')
      .eq('id', basesTipoId)
      .eq('tipo_compra', requerimiento.tipo_licita)
      .eq('activo', true)
      .single()
    if (plantillaError || !plantilla) return res.status(404).json({ error: 'Base tipo no encontrada' })
    if (plantilla.institucion_id && plantilla.institucion_id !== profile.municipio_id) {
      return res.status(404).json({ error: 'Base tipo no disponible para este organismo' })
    }

    const contenido = {
      plantilla: {
        id: plantilla.id,
        nombre: plantilla.nombre,
        version: plantilla.version,
      },
      estructura: plantilla.estructura_base,
      personalizaciones: {},
    }

    const { data: base, error: insertError } = await auth.client
      .from('bases_generadas')
      .insert({
        licitacion_id: licitacionId,
        bases_tipo_id: plantilla.id,
        tipo_compra: plantilla.tipo_compra,
        contenido_bases: contenido,
        estado: 'SELECCIONADA',
        seleccionado_por: auth.user.id,
        fecha_seleccion: new Date().toISOString(),
      })
      .select()
      .single()
    if (insertError) throw insertError

    const { error: updateError } = await auth.client
      .from('licitaciones')
      .update({ bases_tipo_id: plantilla.id, estado: 'BASES_GENERADAS', bases_ajustadas: contenido })
      .eq('id', licitacionId)
    if (updateError) throw updateError

    return res.status(200).json({ success: true, base })
  } catch (error) {
    console.error('Error seleccionando base tipo:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
}
