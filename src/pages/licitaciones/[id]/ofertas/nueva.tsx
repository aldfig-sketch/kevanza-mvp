import { useState } from 'react'
import { useRouter } from 'next/router'
import { crearOferta } from '@/lib/ofertas'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Header } from '@/components/Header'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function NuevaOfertaPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    proveedor_nombre: '',
    proveedor_email: '',
    precio_ofertado: '',
    plazo_dias: '',
    descripcion_tecnica: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.proveedor_nombre || !form.proveedor_email || !form.precio_ofertado || !form.plazo_dias) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      await crearOferta({
        licitacion_id: id as string,
        proveedor_nombre: form.proveedor_nombre.trim(),
        proveedor_email: form.proveedor_email.trim(),
        precio_ofertado: parseFloat(form.precio_ofertado),
        plazo_dias: parseInt(form.plazo_dias),
        descripcion_tecnica: form.descripcion_tecnica.trim() || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/licitaciones/${id}/ofertas`)
      }, 1500)
    } catch (err) {
      console.error('Error creando oferta:', err)
      setError('Error al crear la oferta. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Nueva Oferta</h1>
            <p className="text-gray-600 mt-2">Completa los datos de tu propuesta</p>
          </div>

          <Card variant="outlined">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Oferta creada correctamente</p>
                  <p className="text-sm text-green-700">Redirigiendo...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Proveedor *"
                  placeholder="Empresa Contratista S.A."
                  value={form.proveedor_nombre}
                  onChange={(e) => setForm({ ...form, proveedor_nombre: e.target.value })}
                  disabled={loading || success}
                  required
                />

                <Input
                  label="Email del Proveedor *"
                  type="email"
                  placeholder="contacto@empresa.cl"
                  value={form.proveedor_email}
                  onChange={(e) => setForm({ ...form, proveedor_email: e.target.value })}
                  disabled={loading || success}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Precio Ofertado (CLP) *"
                  type="number"
                  placeholder="45000000"
                  value={form.precio_ofertado}
                  onChange={(e) => setForm({ ...form, precio_ofertado: e.target.value })}
                  disabled={loading || success}
                  required
                  min="0"
                  step="1000"
                />

                <Input
                  label="Plazo de Entrega (días) *"
                  type="number"
                  placeholder="30"
                  value={form.plazo_dias}
                  onChange={(e) => setForm({ ...form, plazo_dias: e.target.value })}
                  disabled={loading || success}
                  required
                  min="1"
                  max="365"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Descripción Técnica
                </label>
                <textarea
                  value={form.descripcion_tecnica}
                  onChange={(e) => setForm({ ...form, descripcion_tecnica: e.target.value })}
                  placeholder="Detalles técnicos de tu propuesta..."
                  disabled={loading || success}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">Opcional - proporciona detalles técnicos relevantes</p>
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={loading || success} className="flex-1 md:flex-none">
                  {loading ? 'Guardando...' : success ? '✓ Guardado' : 'Guardar Oferta'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={loading || success}
                  className="flex-1 md:flex-none"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>

          <Card variant="outlined" className="bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Asegúrate de proporcionar</p>
                <ul className="space-y-1 text-blue-800">
                  <li>✓ Email válido para contacto</li>
                  <li>✓ Precio competitivo en CLP</li>
                  <li>✓ Plazo realista de entrega</li>
                  <li>✓ Descripción clara de tu propuesta</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
