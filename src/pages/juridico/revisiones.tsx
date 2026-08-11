import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { obtenerRevisionesEnEspera } from '@/lib/revisionesJuridicas'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

export default function RevisionesJuridicasPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [revisiones, setRevisiones] = useState<any[]>([])
  const [seleccionada, setSeleccionada] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [nuevasObservaciones, setNuevasObservaciones] = useState('')

  useEffect(() => {
    if (!user) return
    cargarRevisiones()
  }, [user])

  const cargarRevisiones = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await obtenerRevisionesEnEspera(user.id)
      setRevisiones(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando revisiones')
    } finally {
      setLoading(false)
    }
  }

  const getSession = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  const handleAprobar = async () => {
    if (!seleccionada) return
    setEnviando(true)
    setError(null)
    try {
      const token = await getSession()
      const response = await fetch('/api/revisiones/aprobar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ revisionId: seleccionada.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error aprobando bases')
      }

      setSuccess('✅ Bases aprobadas exitosamente')
      setTimeout(() => setSuccess(null), 3000)
      cargarRevisiones()
      setSeleccionada(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setEnviando(false)
    }
  }

  const handleObservaciones = async () => {
    if (!seleccionada || !nuevasObservaciones.trim()) return

    setEnviando(true)
    setError(null)
    try {
      const observaciones = JSON.parse(nuevasObservaciones)
      const token = await getSession()

      const response = await fetch('/api/revisiones/observaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revisionId: seleccionada.id,
          observaciones,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error guardando observaciones')
      }

      setSuccess('✅ Observaciones enviadas al usuario')
      setTimeout(() => setSuccess(null), 3000)
      cargarRevisiones()
      setSeleccionada(null)
      setNuevasObservaciones('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando observaciones')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel Jurídico</h1>
          <p className="text-gray-600">Revisión y aprobación de bases de licitación</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LISTA DE REVISIONES */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                En Revisión ({revisiones.length})
              </h2>

              {loading ? (
                <p className="text-gray-500">Cargando...</p>
              ) : revisiones.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay bases pendientes</p>
              ) : (
                <div className="space-y-2">
                  {revisiones.map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => setSeleccionada(rev)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        seleccionada?.id === rev.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">
                        {rev.licitaciones?.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Nº {rev.licitaciones?.numero}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {rev.estado}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DETALLES + ACCIONES */}
          <div className="lg:col-span-2">
            {seleccionada ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {seleccionada.licitaciones?.titulo}
                  </h2>
                  <p className="text-gray-600 mt-1">Nº {seleccionada.licitaciones?.numero}</p>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo</span>
                      <p className="font-semibold">{seleccionada.licitaciones?.tipo_licita}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Presupuesto</span>
                      <p className="font-semibold">
                        ${seleccionada.licitaciones?.presupuesto_total?.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado</span>
                      <p className="font-semibold">{seleccionada.estado}</p>
                    </div>
                  </div>
                </div>

                {/* BASES AJUSTADAS */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Bases ajustadas por Compras</h3>
                  <pre
                    className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 font-mono text-xs"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {JSON.stringify(
                      seleccionada.bases_generadas?.contenido_bases,
                      null,
                      2
                    )}
                  </pre>
                </div>

                {/* OBSERVACIONES ANTERIORES */}
                {seleccionada.observaciones_juridicas && (
                  <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h3 className="font-bold text-yellow-900 mb-2">
                      Observaciones Anteriores
                    </h3>
                    <pre className="text-xs text-yellow-800" style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(seleccionada.observaciones_juridicas, null, 2)}
                    </pre>
                  </div>
                )}

                {/* AGREGAR OBSERVACIONES */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Observaciones (JSON)
                  </label>
                  <textarea
                    value={nuevasObservaciones}
                    onChange={(e) => setNuevasObservaciones(e.target.value)}
                    placeholder='{"seccion": "especificaciones", "problema": "...", "sugerencia": "..."}'
                    className="w-full h-32 p-3 border-2 border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAprobar}
                    disabled={enviando}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {enviando ? '⏳ Aprobando...' : '✅ Aprobar Bases'}
                  </Button>

                  <Button
                    onClick={handleObservaciones}
                    disabled={enviando || !nuevasObservaciones.trim()}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {enviando ? '⏳ Enviando...' : '⚠️ Enviar Observaciones'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">Selecciona una revisión para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
