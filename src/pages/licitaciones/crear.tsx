import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { ChevronDown } from 'lucide-react'

export default function CrearLicitacionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    numero: '',
    titulo: '',
    descripcion: '',
    tipo_licita: 'Equipamiento',
    municipio_id: '1',
    presupuesto_total: '',
    ponderacion_precio: '',
    ponderacion_tecnica: '',
    ponderacion_experiencia: '',
    ponderacion_otro: '',
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
      parseFloat(formData.ponderacion_experiencia) || 0,
      parseFloat(formData.ponderacion_otro) || 0,
    ]
    return values.reduce((a, b) => a + b, 0)
  }

  const ponderacionesTotal = getPonderacionesTotal()
  const ponderacionesValidas = Math.abs(ponderacionesTotal - 100) < 0.01

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!ponderacionesValidas && Object.values(formData).some((v) => v.includes('ponderacion'))) {
      setError(`Las ponderaciones deben sumar 100%. Suma actual: ${ponderacionesTotal}%`)
      setLoading(false)
      return
    }

    try {
      const { data, error: insertError } = await supabase.from('licitaciones').insert([
        {
          numero: formData.numero,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          municipio_id: parseInt(formData.municipio_id),
          tipo_licita: formData.tipo_licita,
          presupuesto_total: parseFloat(formData.presupuesto_total) || 0,
          ponderacion_precio: parseFloat(formData.ponderacion_precio) || 0,
          ponderacion_tecnica: parseFloat(formData.ponderacion_tecnica) || 0,
          ponderacion_experiencia: parseFloat(formData.ponderacion_experiencia) || 0,
          ponderacion_otro: parseFloat(formData.ponderacion_otro) || 0,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Licitación creada!</h2>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear licitación</h1>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
                    Número de licitación *
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    required
                    placeholder="LIC-2026-001"
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
                    placeholder="Compra de Equipamiento Deportivo"
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
                    placeholder="Detalles de la licitación..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de licitación
                    </label>
                    <select
                      name="tipo_licita"
                      value={formData.tipo_licita}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option>Equipamiento</option>
                      <option>Servicios</option>
                      <option>Infraestructura</option>
                      <option>Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Municipio
                    </label>
                    <select
                      name="municipio_id"
                      value={formData.municipio_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="1">Pucón</option>
                      <option value="2">Villarrica</option>
                      <option value="3">Temuco</option>
                    </select>
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
                    placeholder="1000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sin restricción de monto</p>
                </div>
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

                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="0"
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
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experiencia (%)
                    </label>
                    <input
                      type="number"
                      name="ponderacion_experiencia"
                      value={formData.ponderacion_experiencia}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Otro (%)
                    </label>
                    <input
                      type="number"
                      name="ponderacion_otro"
                      value={formData.ponderacion_otro}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0"
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
                  Total: {ponderacionesTotal}% {ponderacionesValidas ? '✓' : '⚠'}
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Button type="submit" isLoading={loading}>
              Guardar como borrador
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
            >
              Publicar ahora
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
