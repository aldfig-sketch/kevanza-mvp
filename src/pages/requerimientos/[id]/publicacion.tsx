import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

export default function PaginaPublicacion() {
  const router = useRouter()
  const { user } = useAuth()
  const { id } = router.query

  const [requerimiento, setRequerimiento] = useState<any>(null)
  const [bases, setBases] = useState<any>(null)
  const [decreto, setDecreto] = useState<any>(null)
  const [publicacion, setPublicacion] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [paso, setPaso] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      const { data: req } = await supabase
        .from('requerimientos')
        .select('*')
        .eq('id', id)
        .single()
      setRequerimiento(req)

      const { data: base } = await supabase
        .from('bases_generadas')
        .select('*')
        .eq('requerimiento_id', id)
        .eq('estado', 'APROBADO')
        .single()
      setBases(base)

      if (base) {
        const { data: decretoExistente } = await supabase
          .from('publicaciones_mercado_publico')
          .select('*')
          .eq('bases_id', base.id)
          .single()

        if (decretoExistente) {
          setDecreto(decretoExistente)
          setPaso(1)

          if (decretoExistente.estado_publicacion === 'PUBLICADA') {
            setPublicacion(decretoExistente)
            setPaso(2)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    }
  }

  const handleGenerarDecreto = async () => {
    if (!bases) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('No autorizado')

      const response = await fetch('/api/publicacion/generar-decreto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ basesId: bases.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error generando decreto')
      }

      const { decreto: nuevoDecreto } = await response.json()
      setDecreto(nuevoDecreto)
      setPaso(1)
      alert('✅ Decreto generado exitosamente')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      alert('❌ Error: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePublicarMP = async () => {
    if (!decreto || !bases || !requerimiento) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('No autorizado')

      const response = await fetch('/api/publicacion/publicar-mp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decretoId: decreto.id,
          basesId: bases.id,
          titulo: requerimiento.titulo,
          presupuesto: requerimiento.presupuesto_total,
          plazo: requerimiento.plazo_ejecucion_dias,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error publicando')
      }

      const { publicacion: nuevaPublicacion } = await response.json()
      setPublicacion(nuevaPublicacion)
      setPaso(2)
      alert('✅ Publicado en Mercado Público')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      alert('❌ Error: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  if (!requerimiento) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Publicación en Mercado Público
        </h1>
        <h2 className="text-xl text-gray-600 mb-8">{requerimiento.titulo}</h2>

        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* PASO 1: DECRETO */}
          <div
            className={`p-6 rounded-lg border-l-4 ${
              paso >= 0 ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-400'
            }`}
          >
            <h3 className="text-lg font-bold mb-4">1️⃣ Generar Decreto</h3>
            {!decreto ? (
              <Button
                onClick={handleGenerarDecreto}
                disabled={!bases || loading}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? '⏳ Generando...' : '📄 Generar Decreto'}
              </Button>
            ) : (
              <>
                <p className="text-green-700 font-semibold mb-2">
                  ✅ Decreto Nº {decreto.numero_decreto}
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-teal-600 hover:underline">
                    Ver contenido del decreto
                  </summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64 border">
                    {decreto.contenido_decreto}
                  </pre>
                </details>
              </>
            )}
          </div>

          {/* PASO 2: PUBLICACIÓN MP */}
          <div
            className={`p-6 rounded-lg border-l-4 transition-opacity ${
              paso >= 1 ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-400 opacity-50'
            }`}
          >
            <h3 className="text-lg font-bold mb-4">2️⃣ Publicar en MP</h3>
            {!publicacion ? (
              <Button
                onClick={handlePublicarMP}
                disabled={!decreto || loading}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? '⏳ Publicando...' : '🌐 Publicar MP'}
              </Button>
            ) : (
              <>
                <p className="text-green-700 font-semibold mb-2">✅ Publicado</p>
                <p className="text-sm text-gray-700">
                  <strong>ID:</strong> {publicacion.id_mercado_publico}
                </p>
              </>
            )}
          </div>

          {/* PASO 3: COMPLETADO */}
          <div
            className={`p-6 rounded-lg border-l-4 transition-opacity ${
              paso >= 2 ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-400 opacity-50'
            }`}
          >
            <h3 className="text-lg font-bold mb-4">3️⃣ Completado</h3>
            {publicacion ? (
              <>
                <p className="text-green-700 font-semibold mb-2">
                  ✅ Licitación publicada
                </p>
                <a
                  href={publicacion.url_mercado_publico}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline text-sm"
                >
                  Ver en Mercado Público →
                </a>
              </>
            ) : (
              <p className="text-gray-500">Pendiente</p>
            )}
          </div>
        </div>

        {/* INFORMACIÓN FINAL */}
        {publicacion && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Información de Publicación
            </h3>
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    ID Mercado Público
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-mono">
                    {publicacion.id_mercado_publico}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    Decreto
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    Nº {decreto?.numero_decreto}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    Fecha Publicación
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {publicacion.fecha_publicacion
                      ? new Date(publicacion.fecha_publicacion).toLocaleDateString('es-CL')
                      : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-700">
                    Estado
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {publicacion.estado_publicacion}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
