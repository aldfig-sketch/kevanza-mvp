import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  obtenerConfiguracionPlazos,
  actualizarConfiguracionPlazos,
} from '@/lib/plazoService'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

export default function ConfiguracionPlazosPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<any>(null)
  const [editar, setEditar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    cargarConfig()
  }, [user])

  const cargarConfig = async () => {
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

      const configData = await obtenerConfiguracionPlazos(usuario.municipio_id)
      setConfig(configData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
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

      await actualizarConfiguracionPlazos(usuario.municipio_id, config)
      setSuccess('✅ Configuración guardada exitosamente')
      setTimeout(() => setSuccess(null), 3000)
      setEditar(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando configuración')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !config) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert type="error">{error || 'Error cargando configuración'}</Alert>
        </div>
      </div>
    )
  }

  const campos = [
    { key: 'plazo_requerimiento_a_bases', label: 'Requerimiento → Bases (días)' },
    { key: 'plazo_bases_a_juridico', label: 'Bases → Jurídico (días)' },
    { key: 'plazo_revision_juridica', label: 'Revisión Jurídica (días)' },
    { key: 'plazo_observaciones_ajuste', label: 'Ajuste Observaciones (días)' },
    { key: 'plazo_decreto', label: 'Decreto (días)' },
    { key: 'plazo_publicacion', label: 'Publicación MP (días)' },
    { key: 'alerta_anticipada_dias', label: 'Alerta Anticipada (días antes)' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Plazos</h1>
        <p className="text-gray-600 mb-6">
          Define los plazos internos para los procesos de licitación en tu municipio
        </p>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="bg-white rounded-lg shadow p-6">
          {!editar ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Plazos Actuales</h2>
              <div className="space-y-3 mb-6">
                {campos.map((campo) => (
                  <div key={campo.key} className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-700">{campo.label}</span>
                    <span className="font-semibold text-teal-600">{config[campo.key]} días</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700">Email para alertas críticas</span>
                  <span className="font-semibold text-teal-600">{config.email_alertas || 'No configurado'}</span>
                </div>
              </div>

              <Button
                onClick={() => setEditar(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                ✏️ Editar Configuración
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Plazos</h2>

              <div className="space-y-4 mb-6">
                {campos.map((campo) => (
                  <div key={campo.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {campo.label}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={config[campo.key]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          [campo.key]: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email para Alertas Críticas
                  </label>
                  <input
                    type="email"
                    value={config.email_alertas || ''}
                    onChange={(e) =>
                      setConfig({ ...config, email_alertas: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleGuardar}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? '⏳ Guardando...' : '💾 Guardar'}
                </Button>
                <Button
                  onClick={() => setEditar(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500"
                >
                  ❌ Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
