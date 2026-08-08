import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { obtenerOferta, actualizarPuntajeOferta, type Oferta } from '@/lib/ofertas'
import { obtenerLicitacion, type Licitacion } from '@/lib/licitaciones'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Header } from '@/components/Header'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function EvaluarOfertaPage() {
  const router = useRouter()
  const { id, ofertaId } = router.query
  const [oferta, setOferta] = useState<Oferta | null>(null)
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [puntajes, setPuntajes] = useState({
    puntaje_precio: 50,
    puntaje_tecnica: 50,
    puntaje_plazo: 50,
  })

  useEffect(() => {
    if (!ofertaId || !id) return

    ;(async () => {
      try {
        const [ofertaData, licData] = await Promise.all([
          obtenerOferta(ofertaId as string),
          obtenerLicitacion(id as string),
        ])
        setOferta(ofertaData)
        setLicitacion(licData)
        if (ofertaData.puntaje_precio) {
          setPuntajes({
            puntaje_precio: ofertaData.puntaje_precio,
            puntaje_tecnica: ofertaData.puntaje_tecnica || 50,
            puntaje_plazo: ofertaData.puntaje_plazo || 50,
          })
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error cargando datos')
      } finally {
        setLoading(false)
      }
    })()
  }, [ofertaId, id])

  const calcularPuntajeTotal = () => {
    if (!licitacion) return 0
    return (
      (puntajes.puntaje_precio * licitacion.ponderacion_precio) / 100 +
      (puntajes.puntaje_tecnica * licitacion.ponderacion_tecnica) / 100 +
      (puntajes.puntaje_plazo * licitacion.ponderacion_plazo) / 100
    ).toFixed(2)
  }

  const handleGuardar = async () => {
    if (!licitacion) return
    setSaving(true)
    setError('')

    try {
      // Validar que puntajes sean válidos
      if (
        puntajes.puntaje_precio < 0 ||
        puntajes.puntaje_precio > 100 ||
        puntajes.puntaje_tecnica < 0 ||
        puntajes.puntaje_tecnica > 100 ||
        puntajes.puntaje_plazo < 0 ||
        puntajes.puntaje_plazo > 100
      ) {
        setError('Los puntajes deben estar entre 0 y 100')
        return
      }

      // Validar ponderaciones sumen 100%
      const sumaP =
        licitacion.ponderacion_precio +
        licitacion.ponderacion_tecnica +
        licitacion.ponderacion_plazo
      if (Math.abs(sumaP - 100) > 0.01) {
        setError('Las ponderaciones no suman 100%')
        return
      }

      // Guardar
      await actualizarPuntajeOferta(ofertaId as string, {
        puntaje_precio: puntajes.puntaje_precio,
        puntaje_tecnica: puntajes.puntaje_tecnica,
        puntaje_plazo: puntajes.puntaje_plazo,
        ponderacion_precio: licitacion.ponderacion_precio,
        ponderacion_tecnica: licitacion.ponderacion_tecnica,
        ponderacion_plazo: licitacion.ponderacion_plazo,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/licitaciones/${id}/ofertas`)
      }, 1500)
    } catch (err: any) {
      console.error('Error:', err)
      // Si es KevanzaError, usar userMessage; si no, mensaje genérico
      const message = err.userMessage || err.message || 'Error al guardar evaluación'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 flex items-center justify-center">
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </>
    )
  }

  if (!oferta || !licitacion) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 flex items-center justify-center">
          <Card variant="outlined" className="border-red-200 bg-red-50">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">Error: No se pudieron cargar los datos</p>
            </div>
          </Card>
        </div>
      </>
    )
  }

  const puntajeTotalValue = calcularPuntajeTotal()
  const puntajeTotal = typeof puntajeTotalValue === 'string' ? parseFloat(puntajeTotalValue) : puntajeTotalValue

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{oferta.proveedor_nombre}</h1>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Precio Ofertado</p>
                <p className="font-mono font-semibold">${oferta.precio_ofertado.toLocaleString('es-CL')}</p>
              </div>
              <div>
                <p className="text-gray-600">Plazo</p>
                <p className="font-semibold">{oferta.plazo_dias} días</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-xs truncate">{oferta.proveedor_email}</p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Evaluación guardada correctamente</p>
                <p className="text-sm text-green-700">Redirigiendo...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Criterios de Evaluación */}
          <Card variant="outlined" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Evaluación de Criterios</h2>
              <p className="text-gray-600">Ajusta los deslizadores para evaluar cada criterio</p>
            </div>

            <div className="space-y-8">
              {/* Criterio 1: Precio */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-lg font-semibold text-gray-900">
                    Criterio: Precio
                  </label>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-teal-700">{puntajes.puntaje_precio}</span>
                    <span className="text-sm text-gray-600">/100</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Ponderación: {licitacion.ponderacion_precio}%</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={puntajes.puntaje_precio}
                  onChange={(e) =>
                    setPuntajes({ ...puntajes, puntaje_precio: parseInt(e.target.value) })
                  }
                  disabled={saving || success}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Muy Bajo</span>
                  <span>Muy Alto</span>
                </div>
              </div>

              {/* Criterio 2: Técnica */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-lg font-semibold text-gray-900">
                    Criterio: Técnica
                  </label>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-teal-700">{puntajes.puntaje_tecnica}</span>
                    <span className="text-sm text-gray-600">/100</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Ponderación: {licitacion.ponderacion_tecnica}%</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={puntajes.puntaje_tecnica}
                  onChange={(e) =>
                    setPuntajes({ ...puntajes, puntaje_tecnica: parseInt(e.target.value) })
                  }
                  disabled={saving || success}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Muy Bajo</span>
                  <span>Muy Alto</span>
                </div>
              </div>

              {/* Criterio 3: Plazo */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-lg font-semibold text-gray-900">
                    Criterio: Plazo
                  </label>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-3xl font-bold text-teal-700">{puntajes.puntaje_plazo}</span>
                    <span className="text-sm text-gray-600">/100</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Ponderación: {licitacion.ponderacion_plazo}%</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={puntajes.puntaje_plazo}
                  onChange={(e) =>
                    setPuntajes({ ...puntajes, puntaje_plazo: parseInt(e.target.value) })
                  }
                  disabled={saving || success}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Muy Bajo</span>
                  <span>Muy Alto</span>
                </div>
              </div>
            </div>

            {/* Puntaje Total */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-lg border-2 border-teal-300">
              <p className="text-sm text-teal-800 font-medium mb-2">Puntaje Total Ponderado</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold text-teal-700">{puntajeTotal.toFixed(2)}</p>
                <p className="text-lg text-teal-700">/100</p>
              </div>
              <p className="text-xs text-teal-700 mt-2">
                Calculado automáticamente según ponderaciones de la licitación
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGuardar}
                disabled={saving || success}
                className="flex-1 md:flex-none"
              >
                {saving ? 'Guardando...' : success ? '✓ Guardado' : 'Guardar Evaluación'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                disabled={saving || success}
                className="flex-1 md:flex-none"
              >
                Cancelar
              </Button>
            </div>
          </Card>

          {/* Notas */}
          <Card variant="outlined" className="bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Consejos para evaluar</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Precio: Evalúa competitividad respecto al presupuesto</li>
                  <li>• Técnica: Valora calidad y cumplimiento de especificaciones</li>
                  <li>• Plazo: Considera viabilidad y urgencia del proyecto</li>
                  <li>• El puntaje total se calcula automáticamente según las ponderaciones</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
