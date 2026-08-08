import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { ChevronDown, ArrowLeft, CheckCircle2, AlertCircle, Scale } from 'lucide-react'
import {
  clasificarPorMonto,
  CAMPOS_POR_TIPO,
  validarCamposTipo,
  validarGarantiaCumplimiento,
  validarGarantiaSeriedad,
  validarPonderaciones,
  formatUTM,
  type TipoCompra,
} from '@/lib/licitacionRules'

export default function CrearLicitacionPage() {
  const { user, profile, organismoNombre } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    numero: '',
    titulo: '',
    descripcion: '',
    tipo_licita: 'Infraestructura',
    presupuesto_total: '',
    porcentaje_seriedad: '',
    porcentaje_cumplimiento: '',
    plazo_ejecucion_dias: '',
    ponderacion_precio: '',
    ponderacion_tecnica: '',
    ponderacion_plazo: '',
  })

  // Campos específicos según tipo de compra (datos_bases)
  const [datosBases, setDatosBases] = useState<Record<string, any>>({})

  const [openSections, setOpenSections] = useState({
    basico: true,
    presupuesto: false,
    especificos: false,
    ponderaciones: false,
  })

  const toggleSection = (section: 'basico' | 'presupuesto' | 'especificos' | 'ponderaciones') => {
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

  const handleCampoTipo = (name: string, value: any) => {
    setDatosBases((prev) => ({ ...prev, [name]: value }))
  }

  // Clasificación por UTM (en vivo) y campos del tipo seleccionado
  const clasificacion = clasificarPorMonto(parseFloat(formData.presupuesto_total) || 0)
  const camposTipo = CAMPOS_POR_TIPO[formData.tipo_licita as TipoCompra] || []

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

  const handleSubmit = async (e: React.FormEvent, marcarListo = false) => {
    e.preventDefault()
    setError(null)

    const algunaPonderacion =
      formData.ponderacion_precio || formData.ponderacion_tecnica || formData.ponderacion_plazo
    const errPonderaciones = validarPonderaciones(
      parseFloat(formData.ponderacion_precio) || 0,
      parseFloat(formData.ponderacion_tecnica) || 0,
      parseFloat(formData.ponderacion_plazo) || 0
    )
    if ((marcarListo || algunaPonderacion) && errPonderaciones) {
      setError(errPonderaciones)
      setOpenSections((prev) => ({ ...prev, ponderaciones: true }))
      return
    }

    if (!profile?.municipio_id) {
      setError('No se pudo determinar tu organismo. Recarga la página e intenta de nuevo.')
      return
    }

    // Validaciones normativas antes de marcar listo para Mercado Público.
    if (marcarListo) {
      const errSeriedad = validarGarantiaSeriedad(
        clasificacion,
        formData.porcentaje_seriedad ? parseFloat(formData.porcentaje_seriedad) : null
      )
      if (errSeriedad) {
        setError(errSeriedad)
        setOpenSections((prev) => ({ ...prev, presupuesto: true }))
        return
      }
      const errGarantia = validarGarantiaCumplimiento(
        clasificacion,
        formData.porcentaje_cumplimiento ? parseFloat(formData.porcentaje_cumplimiento) : null
      )
      if (errGarantia) {
        setError(errGarantia)
        setOpenSections((prev) => ({ ...prev, presupuesto: true }))
        return
      }
      const erroresTipo = validarCamposTipo(formData.tipo_licita as TipoCompra, datosBases)
      if (erroresTipo.length > 0) {
        setError(`Faltan datos del tipo de compra: ${erroresTipo.join('; ')}`)
        setOpenSections((prev) => ({ ...prev, especificos: true }))
        return
      }
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
          clasificacion: clasificacion?.codigo || null,
          porcentaje_seriedad: formData.porcentaje_seriedad
            ? parseFloat(formData.porcentaje_seriedad)
            : null,
          porcentaje_cumplimiento: formData.porcentaje_cumplimiento
            ? parseFloat(formData.porcentaje_cumplimiento)
            : null,
          plazo_ejecucion_dias: formData.plazo_ejecucion_dias
            ? parseInt(formData.plazo_ejecucion_dias)
            : null,
          datos_bases: datosBases,
          ponderacion_precio: parseFloat(formData.ponderacion_precio) || 0,
          ponderacion_tecnica: parseFloat(formData.ponderacion_tecnica) || 0,
          ponderacion_plazo: parseFloat(formData.ponderacion_plazo) || 0,
          estado: marcarListo ? 'LISTO_MERCADO_PUBLICO' : 'BORRADOR',
          created_by: user?.id,
          published_at: marcarListo ? new Date().toISOString() : null,
        },
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        router.push('/licitaciones')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear requerimiento')
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
            <p className="text-gray-600">Registra el requerimiento interno antes de derivarlo a Mercado Público</p>
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
                      placeholder="Detalles del requerimiento..."
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Tipo y organismo */}
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
                        <option value="Infraestructura">Infraestructura — Obras e Infraestructura</option>
                        <option value="Suministros">Suministros — Adquisición de Bienes</option>
                        <option value="Servicios">Servicios — Prestación de Servicios</option>
                        <option value="Consultoría">Consultoría — Estudios y Asesorías</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Según Ley 19.886 y DS 661/2024</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Organismo
                      </label>
                      <div className="w-full px-4 py-2.5 border-2 border-gray-100 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                        <span>📍</span>
                        <span className="font-medium">{organismoNombre || 'Tu organismo'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Se asigna automáticamente a tu organismo
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
                <div className="px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Presupuesto total ($)
                    </label>
                    <input
                      type="number"
                      name="presupuesto_total"
                      value={formData.presupuesto_total}
                      onChange={handleChange}
                      placeholder="45000000"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Monto máximo disponible (CLP)</p>
                  </div>

                  {/* Clasificación por UTM (en vivo) */}
                  {clasificacion && (
                    <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Scale className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-teal-900">{clasificacion.nombre}</span>
                        <span className="text-xs text-teal-700">
                          ≈ {formatUTM(clasificacion.montoUTM)}
                        </span>
                      </div>
                      <p className="text-sm text-teal-800">{clasificacion.nota}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Plazo de ejecución (días)
                      </label>
                      <input
                        type="number"
                        name="plazo_ejecucion_dias"
                        value={formData.plazo_ejecucion_dias}
                        onChange={handleChange}
                        min="1"
                        placeholder="60"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Garantía de seriedad (%)
                        {clasificacion?.garantiaSeriedadObligatoria && (
                          <span className="text-red-600"> *</span>
                        )}
                      </label>
                      <input
                        type="number"
                        name="porcentaje_seriedad"
                        value={formData.porcentaje_seriedad}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.01"
                        placeholder="2"
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {clasificacion?.garantiaSeriedadObligatoria
                          ? 'Obligatoria para LR: 2% – 5%'
                          : 'Opcional según monto'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Garantía fiel cumplimiento (%)
                      {clasificacion?.garantiaCumplimientoObligatoria && (
                        <span className="text-red-600"> *</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="porcentaje_cumplimiento"
                      value={formData.porcentaje_cumplimiento}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      step="0.01"
                      placeholder="5"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {clasificacion?.garantiaCumplimientoObligatoria
                        ? 'Obligatoria: 5% - 30%'
                        : 'Opcional según monto'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Campos específicos del tipo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('especificos')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm">
                    3
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Requisitos de {formData.tipo_licita}
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSections.especificos ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.especificos && (
                <div className="px-6 py-6 space-y-5">
                  <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
                    Campos específicos exigidos para procesos de <strong>{formData.tipo_licita}</strong> (Ley 19.886).
                  </p>
                  {camposTipo.map((campo) => (
                    <div key={campo.name}>
                      {campo.tipo === 'boolean' ? (
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!datosBases[campo.name]}
                            onChange={(e) => handleCampoTipo(campo.name, e.target.checked)}
                            className="mt-1 w-4 h-4 accent-teal-600"
                          />
                          <span>
                            <span className="text-sm font-semibold text-gray-900">
                              {campo.label}
                              {campo.debeSer && <span className="text-red-600"> *</span>}
                            </span>
                            {campo.help && (
                              <span className="block text-xs text-gray-500">{campo.help}</span>
                            )}
                          </span>
                        </label>
                      ) : (
                        <>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            {campo.label}
                            {campo.obligatorio && <span className="text-red-600"> *</span>}
                            {campo.unidad && (
                              <span className="text-gray-500 font-normal"> ({campo.unidad})</span>
                            )}
                          </label>
                          <input
                            type={campo.tipo === 'number' ? 'number' : 'text'}
                            value={datosBases[campo.name] ?? ''}
                            min={campo.min}
                            max={campo.max}
                            onChange={(e) =>
                              handleCampoTipo(
                                campo.name,
                                campo.tipo === 'number' ? e.target.value : e.target.value
                              )
                            }
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                          />
                          {campo.help && <p className="text-xs text-gray-500 mt-1">{campo.help}</p>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección 4: Ponderaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('ponderaciones')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                    4
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
                Marcar listo para Mercado Público
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
