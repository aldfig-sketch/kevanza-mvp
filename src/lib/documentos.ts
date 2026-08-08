import { supabase } from './supabase'
import { auditLog } from './audit'

export type CategoriaDocumento = 'BASE' | 'ANEXO' | 'DECRETO'

export interface Documento {
  id: string
  licitacion_id: string
  categoria: CategoriaDocumento
  nombre: string
  storage_path: string
  version: number
  tamano_bytes: number | null
  mime_type: string | null
  uploaded_by: string | null
  created_at: string
}

const BUCKET = 'documentos'
const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

function sanitizeName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Sube un documento al bucket privado y registra la fila.
 * Si ya existe un documento con el mismo nombre y categoría, incrementa la versión.
 */
export async function subirDocumento(
  licitacionId: string,
  organismoId: string,
  categoria: CategoriaDocumento,
  file: File,
  userId?: string
): Promise<Documento> {
  if (file.size > MAX_BYTES) {
    throw new Error('El archivo supera el máximo de 25 MB')
  }

  // Determinar versión: última versión del mismo nombre + categoría + 1
  const { data: previas } = await supabase
    .from('documentos')
    .select('version')
    .eq('licitacion_id', licitacionId)
    .eq('categoria', categoria)
    .eq('nombre', file.name)
    .order('version', { ascending: false })
    .limit(1)

  const version = (previas && previas[0]?.version ? previas[0].version : 0) + 1

  const safe = sanitizeName(file.name)
  const storage_path = `${organismoId}/${licitacionId}/${categoria}/v${version}-${Date.now()}-${safe}`

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(storage_path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })
  if (upErr) throw new Error(`Error subiendo archivo: ${upErr.message}`)

  const { data, error } = await supabase
    .from('documentos')
    .insert([
      {
        licitacion_id: licitacionId,
        categoria,
        nombre: file.name,
        storage_path,
        version,
        tamano_bytes: file.size,
        mime_type: file.type || null,
        uploaded_by: userId || null,
      },
    ])
    .select()
    .single()

  if (error) {
    // Rollback del archivo si falla el registro
    await supabase.storage.from(BUCKET).remove([storage_path])
    throw new Error(`Error registrando documento: ${error.message}`)
  }

  if (userId) {
    await auditLog.createdRecord(userId, 'documentos', data.id, {
      categoria,
      nombre: file.name,
      version,
    })
  }

  return data as Documento
}

/**
 * Lista los documentos de un requerimiento (más recientes primero).
 */
export async function obtenerDocumentos(licitacionId: string): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('licitacion_id', licitacionId)
    .order('categoria', { ascending: true })
    .order('version', { ascending: false })

  if (error) throw error
  return (data || []) as Documento[]
}

/**
 * Genera una URL firmada temporal para descargar (bucket privado).
 * Registra la descarga en auditoría (probidad/trazabilidad).
 */
export async function urlDescarga(
  doc: Documento,
  userId?: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60)

  if (error || !data?.signedUrl) {
    throw new Error('No se pudo generar el enlace de descarga')
  }

  if (userId) {
    await auditLog.downloadedFile(userId, 'documentos', doc.id, doc.categoria)
  }

  return data.signedUrl
}

/**
 * Elimina un documento (archivo + registro).
 */
export async function eliminarDocumento(doc: Documento, userId?: string): Promise<void> {
  const { error } = await supabase.from('documentos').delete().eq('id', doc.id)
  if (error) throw error
  await supabase.storage.from(BUCKET).remove([doc.storage_path])

  if (userId) {
    await auditLog.deletedRecord(userId, 'documentos', doc.id)
  }
}
