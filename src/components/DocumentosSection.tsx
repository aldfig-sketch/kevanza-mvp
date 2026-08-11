import { useEffect, useRef, useState } from 'react'
import {
  Documento,
  CategoriaDocumento,
  obtenerDocumentos,
  subirDocumento,
  urlDescarga,
  eliminarDocumento,
} from '@/lib/documentos'
import { Button } from './Button'
import { FileText, Upload, Download, Trash2, Loader2, Shield } from 'lucide-react'

interface Props {
  licitacionId: string
  organismoId: string
  userId?: string
  canEdit?: boolean
}

const CATEGORIAS: { key: CategoriaDocumento; label: string; desc: string }[] = [
  { key: 'CERTIFICADO_DISPONIBILIDAD', label: 'Certificado de disponibilidad', desc: 'PDF obligatorio de disponibilidad presupuestaria' },
  { key: 'OFICIO_CONDUCTOR', label: 'Oficio conductor', desc: 'PDF obligatorio firmado por la unidad técnica' },
  { key: 'TECNICO', label: 'Documentos técnicos', desc: 'PDF opcional: especificaciones, planos o antecedentes' },
  { key: 'BASE', label: 'Bases', desc: 'Bases administrativas y técnicas' },
  { key: 'ANEXO', label: 'Anexos', desc: 'Anexos y documentos de apoyo' },
  { key: 'DECRETO', label: 'Decretos', desc: 'Actos administrativos que respaldan el proceso' },
]

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentosSection({ licitacionId, organismoId, userId, canEdit = true }: Props) {
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingCat, setUploadingCat] = useState<CategoriaDocumento | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})

  const cargar = async () => {
    try {
      setDocs(await obtenerDocumentos(licitacionId))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (licitacionId) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licitacionId])

  const handleUpload = async (categoria: CategoriaDocumento, file?: File) => {
    if (!file) return
    setError(null)
    setUploadingCat(categoria)
    try {
      await subirDocumento(licitacionId, organismoId, categoria, file, userId)
      await cargar()
    } catch (err: any) {
      setError(err?.message || 'Error al subir el documento')
    } finally {
      setUploadingCat(null)
      if (inputs.current[categoria]) inputs.current[categoria]!.value = ''
    }
  }

  const handleDownload = async (doc: Documento) => {
    try {
      const url = await urlDescarga(doc, userId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err: any) {
      setError(err?.message || 'No se pudo descargar')
    }
  }

  const handleDelete = async (doc: Documento) => {
    if (!confirm(`¿Eliminar "${doc.nombre}" (v${doc.version})? Esta acción no se puede deshacer.`)) return
    try {
      await eliminarDocumento(doc, userId)
      await cargar()
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Documentos del proceso</h2>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          Reservado · con trazabilidad
        </span>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="p-6 space-y-6">
        {CATEGORIAS.map(({ key, label, desc }) => {
          const items = docs.filter((d) => d.categoria === key)
          const isUploading = uploadingCat === key
          return (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70">
                <div>
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                {canEdit && (
                  <>
                    <input
                      ref={(el) => {
                        inputs.current[key] = el
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => handleUpload(key, e.target.files?.[0])}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isUploading}
                      onClick={() => inputs.current[key]?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Subiendo…
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Subir
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="px-4 py-6 text-sm text-gray-500">Cargando…</div>
                ) : items.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Sin documentos en esta categoría
                  </div>
                ) : (
                  items.map((doc) => (
                    <div key={doc.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-teal-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.nombre}</p>
                        <p className="text-xs text-gray-500">
                          v{doc.version} · {formatBytes(doc.tamano_bytes)} ·{' '}
                          {new Date(doc.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-teal-700 transition-colors"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
