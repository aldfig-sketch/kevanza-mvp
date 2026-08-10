import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { obtenerRequerimientosEnRiesgo } from '@/lib/plazoService'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

export default function SeguimientoPlazosPage() {
  const { user } = useAuth()
  const [enRiesgo, setEnRiesgo] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    cargarEnRiesgo()
  }, [user])

  const cargarEnRiesgo = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('municipio_id')
        .eq('id', user.id)
        .single()

      if (!usuario?.municipio_id) {
        throw new Error('No se encontró el municipio del usuario')
      }

      const data = await obtenerRequerimientosEnRiesgo(usuario.municipio_id)
      setEnRiesgo(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando requerimientos')
    } finally {
      setLoading(false)
    }
  }

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'EN_RIESGO':
        return 'bg-yellow-50 border-yellow-400 text-yellow-900'
      case 'ATRASADO':
        return 'bg-red-50 border-red-400 text-red-900'
      case 'ON_TRACK':
        return 'bg-green-50 border-green-400 text-green-900'
      default:
        return 'bg-gray-50 border-gray-400 text-gray-900'
    }
  }

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'EN_RIESGO':
        return 'bg-yellow-100 text-yellow-800'
      case 'ATRASADO':
        return 'bg-red-100 text-red-800'
      case 'ON_TRACK':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDiasRestantes = (fechaLimite: string) => {
    const ahora = new Date()
    const limite = new Date(fechaLimite)
    const diff = Math.ceil((limite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguimiento de Plazos</h1>
        <p className="text-gray-600 mb-6">
          Requerimientos en riesgo o atrasados en los plazos configurados
        </p>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : enRiesgo.length === 0 ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
            <p className="text-green-900 font-semibold">
              ✅ Todos los requerimientos están dentro de los plazos configurados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enRiesgo.map((req) => {
              const diasRestantes = getDiasRestantes(req.fecha_limite_bases)
              return (
                <div
                  key={req.id}
                  className={`p-6 rounded-lg border-l-4 ${getColorEstado(req.estado_general)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{req.licitaciones?.titulo}</h3>
                      <p className="text-sm opacity-75 mt-1">Nº {req.licitaciones?.numero}</p>
                      <p className="text-sm opacity-75 mt-2">
                        Límite: {new Date(req.fecha_limite_bases).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm opacity-75">
                        Días restantes: <span className="font-semibold">{diasRestantes}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold inline-block ${getBadgeColor(
                          req.estado_general
                        )}`}
                      >
                        {req.estado_general === 'EN_RIESGO'
                          ? '⚠️ EN RIESGO'
                          : req.estado_general === 'ATRASADO'
                            ? '🔴 ATRASADO'
                            : '✅ ON TRACK'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Button
          onClick={cargarEnRiesgo}
          disabled={loading}
          className="mt-6 bg-teal-600 hover:bg-teal-700"
        >
          🔄 Actualizar
        </Button>
      </div>
    </div>
  )
}
