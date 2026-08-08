import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { ChevronDown, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CrearLicitacionPage() {
  const { user, profile, municipioNombre } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    numero: '',
    titulo: '',
    descripcion: '',
    tipo_licita: 'Equipamiento',
    presupuesto_total: '',
    ponderacion_precio: '',
    ponderacion_tecnica: '',
    ponderacion_plazo: '',
  })

  const [openSections, setOpenSections] = useState({
    basico: true,
    presupuesto: false,
    ponderaciones: false,
  })

  const toggleSection = (section: 'basico' | 'presupuesto' | 'ponderaciones') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getPonderacionesTotal = () => {
    const values = [
      parseFloat(formData.ponderacion_precio) || 0,
      parseFloat(formData.ponderacion_tecnica) || 0,
      parseFloat(formData.ponderacion_plazo) || 0,
    ]
    return values.reduce((a, b) => a + b, 0)
  }

  const ponderacionesTotal = getPonderacionesTotal()
  const ponderacionesValidas = Math.abs(ponderacionesTotal - 100) < 0.01

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setError(null)

    // Al publicar, las ponderaciones deben sumar exactamente 100%
    const algunaPonderacion =
      formData.ponderacion_precio || formData.ponderacion_tecnica || formData.ponderacion_plazo
    if ((publish || algunaPonderacion) && !ponderacionesValidas) {
      setError(`Las ponderaciones deben sumar 100%. Suma actual: ${ponderacionesTotal.toFixed(2)}%`)
      setOpenSections((prev) => ({ ...prev, ponderaciones: true }))
      return
    }

    if (!profile?.municipio_id) {
      setError('No se pudo determinar tu municipio. Recarga la página e intenta de nuevo.')
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase.from('licitaciones').insert([
        {
          numero: formData.numero,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          municipio_id: profile.municipio_id,
          tipo_licita: formData.tipo_licita,
          presupuesto_total: parseFloat(formData.presupuesto_total) || 0,
          ponderacion_precio: parseFloat(formData.ponderacion_precio) || 0,
          ponderacion_tecnica: parseFloat(formData.ponderacion_tecnica) || 0,
          ponderacion_plazo: parseFloat(formData.ponderacion_plazo) || 0,
          estado: publish ? 'PUBLICADA' : 'BORRADOR',
          created_by: user?.id,
          published_at: publish ? new Date().toISOString() : null,
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/licitaciones')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear licitación')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Requerimiento guardado!</h2>
            <p className="text-gray-600">Tu requerimiento de compra ha sido registrado exitosamente</p>
            <p className="text-sm text-gray-500 mt-4">Redirigiendo...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Nuevo requerimiento de compra</h1>
            <p className="text-gray-600">Registra el requerimiento interno antes de publicarlo en Mercado Público</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert type="error" className="mb-8">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </Alert>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Sección 1: Datos Básicos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('basico')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Datos Básicos</h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSections.basico ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.basico && (
                <div className="px-6 py-6 space-y-5">
                  {/* Número */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Número de requerimiento *
                    </label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      required
                      placeholder="LIC-2026-001"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ej: LIC-2026-001</p>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      required
                      placeholder="Compra de Equipamiento Deportivo"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Detalles de la licitación..."
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Tipo y Municipio */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Tipo de adquisición
                      </label>
                      <select
                        name="tipo_licita"
                        value={formData.tipo_licita}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      >
                        <option>Equipamiento</option>
                        <option>Servicios</option>
                        <option>Infraestructura</option>
                        <option>Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Municipio
                      </label>
                      <div className="w-full px-4 py-2.5 border-2 border-gray-100 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                        <span>📍</span>
                        <span className="font-medium">{municipioNombre || 'Tu municipio'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Se asigna automáticamente a tu municipio
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Presupuesto */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('presupuesto')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Presupuesto</h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSections.presupuesto ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.presupuesto && (
                <div className="px-6 py-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Presupuesto total ($)
                    </label>
                    <input
                      type="number"
                      name="presupuesto_total"
                      value={formData.presupuesto_total}
                      onChange={handleChange}
                      placeholder="1000000"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sin restricción de monto</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Ponderaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('ponderaciones')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                    3
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Criterios de Evaluación</h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSections.ponderaciones ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.ponderaciones && (
                <div className="px-6 py-6 space-y-5">
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    📊 Las ponderaciones deben sumar exactamente 100%
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: 'ponderacion_precio', label: 'Precio (%)' },
                      { name: 'ponderacion_tecnica', label: 'Técnica (%)' },
                      { name: 'ponderacion_plazo', label: 'Plazo (%)' },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Total Indicator */}
                  <div
                    className={`p-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                      ponderacionesValidas
                        ? 'bg-green-50 text-green-700 border-2 border-green-200'
                        : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200'
                    }`}
                  >
                    <span className="text-lg">{ponderacionesValidas ? '✓' : '⚠'}</span>
                    <span>Total: {ponderacionesTotal.toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={(e) => handleSubmit(e as any, true)}
                disabled={loading}
              >
                Publicar ahora
              </Button>
              <Button type="submit" size="lg" isLoading={loading}>
                Guardar como borrador
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
