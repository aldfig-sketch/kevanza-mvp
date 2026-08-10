import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { generarBasesPropuesta, obtenerBases, guardarAjustesUsuario } from '@/lib/basesGenerator'
import { ArrowLeft, Download, Copy } from 'lucide-react'

export default function GenerarBasesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = router.query

  const [licitacion, setLicitacion] = useState<any>(null)
  const [bases, setBases] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(false)
  const [contenido, setContenido] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    cargarDatos()
  }, [id, user])

  const cargarDatos = async () => {
    try {
      // Cargar requerimiento
      const { data: lic } = await supabase
        .from('licitaciones')
        .select('*')
        .eq('id', id)
        .single()

      setLicitacion(lic)

      // Cargar bases si existen
      const basesExistentes = await obtenerBases(id as string)
      if (basesExistentes) {
        setBases(basesExistentes)
        setContenido(JSON.stringify(basesExistentes.contenido_bases, null, 2))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    }
  }

  const handleGenerarBases = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token

      const basesGeneradas = await generarBasesPropuesta(licitacion, accessToken)
      setBases(basesGeneradas)
      setContenido(JSON.stringify(basesGeneradas.contenido_bases, null, 2))
      setSuccess('✅ Bases generadas con IA exitosamente')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando bases')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarAjustes = async () => {
    try {
      const ajustes = JSON.parse(contenido)
      await guardarAjustesUsuario(bases.id, ajustes)
      setSuccess('✅ Ajustes guardados')
      setEditando(false)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(
        err instanceof Error ? `Error al guardar: ${err.message}` : 'Error desconocido'
      )
    }
  }

  const handleDescargar = () => {
    const elemento = document.createElement('a')
    elemento.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(contenido)
    )
    elemento.setAttribute('download', `bases_${licitacion?.numero || 'requerimiento'}.json`)
    elemento.style.display = 'none'
    document.body.appendChild(elemento)
    elemento.click()
    document.body.removeChild(elemento)
  }

  const handleCopiar = () => {
    navigator.clipboard.writeText(contenido)
    setSuccess('✅ Contenido copiado')
    setTimeout(() => setSuccess(null), 3000)
  }

  if (!licitacion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Generación de Bases de Licitación
          </h1>
          <p className="text-gray-600">
            {licitacion.numero} — {licitacion.titulo}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tipo:</span>
              <p className="font-semibold">{licitacion.tipo_licita}</p>
            </div>
            <div>
              <span className="text-gray-500">Presupuesto:</span>
              <p className="font-semibold">${licitacion.presupuesto_total.toLocaleString('es-CL')}</p>
            </div>
            <div>
              <span className="text-gray-500">Estado:</span>
              <p className="font-semibold">{bases?.estado || 'Sin bases aún'}</p>
            </div>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {!bases ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-6">
              No hay bases generadas aún. La IA analizará tu requerimiento y generará una
              propuesta inicial basada en Ley 19.886.
            </p>
            <Button
              onClick={handleGenerarBases}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? 'Generando bases con IA...' : '🤖 Generar Propuesta de Bases'}
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Contenido de Bases</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopiar}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={handleDescargar}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>

            {!editando ? (
              <div>
                <div
                  className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {contenido}
                </div>
                <button
                  onClick={() => setEditando(true)}
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  ✏️ Editar
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  className="w-full h-96 p-4 border-2 border-teal-200 rounded-lg font-mono text-sm focus:outline-none focus:border-teal-500"
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleGuardarAjustes}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    💾 Guardar Ajustes
                  </button>
                  <button
                    onClick={() => {
                      setEditando(false)
                      setContenido(JSON.stringify(bases.contenido_bases, null, 2))
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {bases && (
          <div className="mt-6">
            <Button
              onClick={() => router.push(`/licitaciones/${id}`)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Enviar a Equipo de Validación →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
