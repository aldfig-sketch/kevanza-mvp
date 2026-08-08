import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import {
  CAMPOS_POR_TIPO,
  ESTADOS_EDITABLES,
  clasificarPorMonto,
  formatUTM,
  validarCamposTipo,
  validarGarantiaCumplimiento,
  validarGarantiaSeriedad,
  validarPonderaciones,
  type EstadoRequerimiento,
  type TipoCompra,
} from '@/lib/licitacionRules'

interface Licitacion {
  id: string
  numero: string
  titulo: string
  descripcion: string
  estado: string
  tipo_licita: string
  municipio_id: string
  presupuesto_total: number
  porcentaje_seriedad?: number | null
  porcentaje_cumplimiento?: number | null
  plazo_ejecucion_dias?: number | null
  datos_bases?: Record<string, any>
  ponderacion_precio: number
  ponderacion_tecnica: number
  ponderacion_plazo: number
}

export default function EditLicitacionPage() {
  const { profile, organismoNombre } = useAuth()
  const router = useRouter()
  const { id } = router.query

  const [licitacion, setLicitacion] = useState<Licitacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [datosBases, setDatosBases] = useState<Record<string, any>>({})

  const [openSections, setOpenSections] = useState({
    basico: true,
    presupuesto: false,
    especificos: false,
    ponderaciones: false,
  })

  useEffect(() => {
    if (id && profile?.municipio_id) {
      fetchLicitacion()
    }
  }, [id, profile?.municipio_id])

  const fetchLicitacion = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('licitaciones')
        .select('*')
        .eq('id', id)
        .eq('municipio_id', profile?.municipio_id)
        .single()

      if (fetchError) throw fetchError

      if (!ESTADOS_EDITABLES.includes(data.estado as EstadoRequerimiento)) {
        setError('Solo puedes editar requerimientos en borrador u observados')
        setLoading(false)
        return
      }

      setLicitacion(data)
      setFormData({
        numero: data.numero,
        titulo: data.titulo,
        descripcion: data.descripcion || '',
        tipo_licita: data.tipo_licita,
        presupuesto_total: (data.presupuesto_total ?? 0).toString(),
        porcentaje_seriedad: (data.porcentaje_seriedad ?? '').toString(),
        porcentaje_cumplimiento: (data.porcentaje_cumplimiento ?? '').toString(),
        plazo_ejecucion_dias: (data.plazo_ejecucion_dias ?? '').toString(),
        ponderacion_precio: (data.ponderacion_precio ?? 0).toString(),
        ponderacion_tecnica: (data.ponderacion_tecnica ?? 0).toString(),
        ponderacion_plazo: (data.ponderacion_plazo ?? 0).toString(),
      })
      setDatosBases(data.datos_bases || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar licitación')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: 'basico' | 'presupuesto' | 'especificos' | 'ponderaciones') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCampoTipo = (name: string, value: any) => {
    setDatosBases((prev) => ({ ...prev, [name]: value }))
  }

  const clasificacion = clasificarPorMonto(parseFloat(formData.presupuesto_total) || 0)
  const camposTipo = CAMPOS_POR_TIPO[formData.tipo_licita as TipoCompra] || []

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const algunaPonderacion =
      formData.ponderacion_precio || formData.ponderacion_tecnica || formData.ponderacion_plazo
    const errPonderaciones = validarPonderaciones(
      parseFloat(formData.ponderacion_precio) || 0,
      parseFloat(formData.ponderacion_tecnica) || 0,
      parseFloat(formData.ponderacion_plazo) || 0
    )
    if (algunaPonderacion && errPonderaciones) {
      setError(errPonderaciones)
      setSaving(false)
      return
    }

    const errSeriedad = validarGarantiaSeriedad(
      clasificacion,
      formData.porcentaje_seriedad ? parseFloat(formData.porcentaje_seriedad) : null
    )
    if (errSeriedad) {
      setError(errSeriedad)
      setSaving(false)
      return
    }

    const errCumplimiento = validarGarantiaCumplimiento(
      clasificacion,
      formData.porcentaje_cumplimiento ? parseFloat(formData.porcentaje_cumplimiento) : null
    )
    if (errCumplimiento) {
      setError(errCumplimiento)
      setSaving(false)
      return
    }

    const erroresTipo = validarCamposTipo(formData.tipo_licita as TipoCompra, datosBases)
    if (erroresTipo.length > 0) {
      setError(`Faltan datos del tipo de compra: ${erroresTipo.join('; ')}`)
      setSaving(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('licitaciones')
        .update({
          numero: formData.numero,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('municipio_id', profile?.municipio_id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push(`/licitaciones/${id}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </>
    )
  }

  if (error && !licitacion) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="error">{error}</Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Volver
          </Button>
        </div>
      </>
    )
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cambios guardados!</h2>
            <p className="text-gray-600">Redirigiendo...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar requerimiento</h1>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Básicos */}
          <div className="bg-white rounded-lg shadow">
            <button
              type="button"
              onClick={() => toggleSection('basico')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <h2 className="text-lg font-bold text-gray-900">Datos Básicos</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.basico ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.basico && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de requerimiento *
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de adquisición
                    </label>
                    <select
                      name="tipo_licita"
                      value={formData.tipo_licita}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Infraestructura">Infraestructura — Obras e Infraestructura</option>
                      <option value="Suministros">Suministros — Adquisición de Bienes</option>
                      <option value="Servicios">Servicios — Prestación de Servicios</option>
                      <option value="Consultoría">Consultoría — Estudios y Asesorías</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organismo
                    </label>
                    <div className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                      <span>📍</span>
                      <span className="font-medium">{organismoNombre || 'Tu organismo'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Presupuesto */}
          <div className="bg-white rounded-lg shadow">
            <button
              type="button"
              onClick={() => toggleSection('presupuesto')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <h2 className="text-lg font-bold text-gray-900">Presupuesto</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.presupuesto ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.presupuesto && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Presupuesto total ($)
                  </label>
                  <input
                    type="number"
                    name="presupuesto_total"
                    value={formData.presupuesto_total}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sin restricción de monto</p>
                </div>

                {clasificacion && (
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="font-bold text-teal-900">
                      {clasificacion.nombre} <span className="text-xs font-medium">≈ {formatUTM(clasificacion.montoUTM)}</span>
                    </p>
                    <p className="text-sm text-teal-800 mt-1">{clasificacion.nota}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plazo de ejecución (días)
                    </label>
                    <input
                      type="number"
                      name="plazo_ejecucion_dias"
                      value={formData.plazo_ejecucion_dias}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Garantía seriedad (%)
                    </label>
                    <input
                      type="number"
                      name="porcentaje_seriedad"
                      value={formData.porcentaje_seriedad}
                      onChange={handleChange}
                      min="0"
                      max="5"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Garantía cumplimiento (%)
                    </label>
                    <input
                      type="number"
                      name="porcentaje_cumplimiento"
                      value={formData.porcentaje_cumplimiento}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campos específicos */}
          <div className="bg-white rounded-lg shadow">
            <button
              type="button"
              onClick={() => toggleSection('especificos')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <h2 className="text-lg font-bold text-gray-900">Requisitos de {formData.tipo_licita}</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.especificos ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.especificos && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
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
                          {campo.help && <span className="block text-xs text-gray-500">{campo.help}</span>}
                        </span>
                      </label>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {campo.label}
                          {campo.obligatorio && <span className="text-red-600"> *</span>}
                          {campo.unidad && <span className="text-gray-500"> ({campo.unidad})</span>}
                        </label>
                        <input
                          type={campo.tipo === 'number' ? 'number' : 'text'}
                          value={datosBases[campo.name] ?? ''}
                          min={campo.min}
                          max={campo.max}
                          onChange={(e) => handleCampoTipo(campo.name, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {campo.help && <p className="text-xs text-gray-500 mt-1">{campo.help}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ponderaciones */}
          <div className="bg-white rounded-lg shadow">
            <button
              type="button"
              onClick={() => toggleSection('ponderaciones')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
            >
              <h2 className="text-lg font-bold text-gray-900">Ponderaciones</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.ponderaciones ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.ponderaciones && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Las ponderaciones deben sumar exactamente 100%
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (%)
                    </label>
                    <input
                      type="number"
                      name="ponderacion_precio"
                      value={formData.ponderacion_precio}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Técnica (%)
                    </label>
                    <input
                      type="number"
                      name="ponderacion_tecnica"
                      value={formData.ponderacion_tecnica}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plazo (%)
                    </label>
                    <input
                      type="number"
                      name="ponderacion_plazo"
                      value={formData.ponderacion_plazo}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    ponderacionesValidas
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  Total: {ponderacionesTotal.toFixed(2)}% {ponderacionesValidas ? '✓' : '⚠'}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" isLoading={saving}>
              Guardar cambios
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
