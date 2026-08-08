import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { StatBadge } from '@/components/StatBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { supabase } from '@/lib/supabase'
import { ChevronDown, ArrowLeft, Edit2, Trash2, Clock, User, MapPin, DollarSign } from 'lucide-react'

interface Licitacion {
  id: number
  numero: string
  titulo: string
  descripcion: string
  estado: string
  tipo_licita: string
  municipio_id: number
  presupuesto_total: number
  ponderacion_precio: number
  ponderacion_tecnica: number
  ponderacion_experiencia: number
  ponderacion_otro: number
  created_at: string
  created_by: string
}

const MUNICIPIOS: { [key: number]: string } = {
  1: 'Pucón',
  2: 'Villarrica',
  3: 'Temuco',
}

const VALID_TRANSITIONS: { [key: string]: string[] } = {
  BORRADOR: ['PUBLICADA'],
  PUBLICADA: ['EN_EVALUACION'],
  EN_EVALUACION: ['ADJUDICADA'],
  ADJUDICADA: [],
}

const ESTADO_COLORS: { [key: string]: 'default' | 'success' | 'warning' | 'danger' | 'info' } = {
  BORRADOR: 'default',
  PUBLICADA: 'success',
  EN_EVALUACION: 'info',
  ADJUDICADA: 'warning',
}

export default function LicitacionDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = router.query

  const [licitacion, setLicitacion] = useState<Licitacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState({
    general: true,
    presupuesto: false,
    evaluacion: false,
  })
  const [deleting, setDeleting] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [estadoModal, setEstadoModal] = useState(false)
  const [pendingEstado, setPendingEstado] = useState('')
  const [changingEstado, setChangingEstado] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchLicitacion()
    }
  }, [id])

  const fetchLicitacion = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('licitaciones')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setLicitacion(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar licitación')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: 'general' | 'presupuesto' | 'evaluacion') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getValidTransitions = (estado: string): string[] => {
    return VALID_TRANSITIONS[estado] || []
  }

  const handleEstadoChange = (nuevoEstado: string) => {
    if (!licitacion) return
    const validTransitions = getValidTransitions(licitacion.estado)

    if (!validTransitions.includes(nuevoEstado)) {
      setError(`No se puede pasar de ${licitacion.estado} a ${nuevoEstado}`)
      return
    }

    setPendingEstado(nuevoEstado)
    setEstadoModal(true)
  }

  const confirmEstadoChange = async () => {
    if (!licitacion || !pendingEstado) return

    setChangingEstado(true)
    try {
      const { error: updateError } = await supabase
        .from('licitaciones')
        .update({ estado: pendingEstado })
        .eq('id', licitacion.id)

      if (updateError) throw updateError
      setLicitacion({ ...licitacion, estado: pendingEstado })
      setEstadoModal(false)
      setSuccessMsg(`Estado cambiado a ${pendingEstado}`)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setChangingEstado(false)
    }
  }

  const handleDelete = async () => {
    if (!licitacion) return

    setDeleting(true)
    try {
      const { error: deleteError } = await supabase
        .from('licitaciones')
        .delete()
        .eq('id', licitacion.id)

      if (deleteError) throw deleteError
      router.push('/licitaciones')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </>
    )
  }

  if (error && !licitacion) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="error">{error}</Alert>
          <Button onClick={() => router.push('/licitaciones')} className="mt-4">
            Volver a Licitaciones
          </Button>
        </div>
      </>
    )
  }

  if (!licitacion) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">Licitación no encontrada</p>
        </div>
      </>
    )
  }

  const canEdit = licitacion.estado === 'BORRADOR'
  const canDelete = licitacion.estado === 'BORRADOR'

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/licitaciones')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          {/* Success Message */}
          {successMsg && (
            <div className="mb-8 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
              ✓ {successMsg}
            </div>
          )}

          {error && <Alert type="error" className="mb-8">{error}</Alert>}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Licitación #{licitacion.numero}
                </p>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{licitacion.titulo}</h1>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant={ESTADO_COLORS[licitacion.estado]}>{licitacion.estado}</Badge>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Creada: {new Date(licitacion.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 p-6" variant="elevated">
            <div className="flex flex-wrap gap-3">
              {canEdit && (
                <Button
                  onClick={() => router.push(`/licitaciones/${licitacion.id}/edit`)}
                  variant="secondary"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              )}
              {canDelete && (
                <Button onClick={() => setDeleteModal(true)} variant="danger">
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              )}
              {getValidTransitions(licitacion.estado).length > 0 && (
                <select
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
                >
                  <option value="">Cambiar estado...</option>
                  {getValidTransitions(licitacion.estado).map((estado) => (
                    <option key={estado} value={estado}>
                      → {estado}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </Card>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatBadge icon="📍" label="Municipio" value={MUNICIPIOS[licitacion.municipio_id]} variant="info" />
            <StatBadge icon="📦" label="Tipo" value={licitacion.tipo_licita} variant="primary" />
            <StatBadge
              icon="💰"
              label="Presupuesto"
              value={`$${licitacion.presupuesto_total.toLocaleString()}`}
              variant="success"
            />
          </div>

          {/* Detalles Generales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('general')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors border-b border-gray-200/50"
            >
              <h2 className="text-lg font-bold text-gray-900">Detalles Generales</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.general ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.general && (
              <div className="px-6 py-6 space-y-4">
                {licitacion.descripcion && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Descripción</p>
                    <p className="text-gray-900">{licitacion.descripcion}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Tipo de Licitación</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{licitacion.tipo_licita}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Municipio</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {MUNICIPIOS[licitacion.municipio_id]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Presupuesto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('presupuesto')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors border-b border-gray-200/50"
            >
              <h2 className="text-lg font-bold text-gray-900">Presupuesto</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.presupuesto ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.presupuesto && (
              <div className="px-6 py-6">
                <div className="bg-teal-50 p-6 rounded-lg border-2 border-teal-200">
                  <p className="text-sm text-teal-600 font-medium mb-1">Presupuesto Total</p>
                  <p className="text-4xl font-bold text-teal-900">
                    ${licitacion.presupuesto_total.toLocaleString()}
                  </p>
                  <p className="text-xs text-teal-600 mt-2">CLP (sin restricción de monto)</p>
                </div>
              </div>
            )}
          </div>

          {/* Criterios de Evaluación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <button
              onClick={() => toggleSection('evaluacion')}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors border-b border-gray-200/50"
            >
              <h2 className="text-lg font-bold text-gray-900">Criterios de Evaluación</h2>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${openSections.evaluacion ? 'rotate-180' : ''}`}
              />
            </button>

            {openSections.evaluacion && (
              <div className="px-6 py-6 space-y-6">
                <ProgressBar
                  label="Precio"
                  value={licitacion.ponderacion_precio}
                  color="blue"
                />
                <ProgressBar
                  label="Técnica"
                  value={licitacion.ponderacion_tecnica}
                  color="purple"
                />
                <ProgressBar
                  label="Experiencia"
                  value={licitacion.ponderacion_experiencia}
                  color="green"
                />
                <ProgressBar
                  label="Otro"
                  value={licitacion.ponderacion_otro}
                  color="orange"
                />

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Ponderaciones</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {(
                          licitacion.ponderacion_precio +
                          licitacion.ponderacion_tecnica +
                          licitacion.ponderacion_experiencia +
                          licitacion.ponderacion_otro
                        ).toFixed(2)}
                        %
                      </span>
                      <span className="text-xl">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Eliminar Licitación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que deseas eliminar esta licitación? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setDeleteModal(false)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={handleDelete} variant="danger" isLoading={deleting}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Estado Change Modal */}
      {estadoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar Estado</h3>
            <p className="text-gray-600 mb-4">
              ¿Deseas cambiar el estado de <strong>{licitacion.estado}</strong> a{' '}
              <strong>{pendingEstado}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Este cambio afectará a los proveedores y evaluadores que trabajen en esta licitación.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setEstadoModal(false)
                  setPendingEstado('')
                }}
                variant="secondary"
                disabled={changingEstado}
              >
                Cancelar
              </Button>
              <Button onClick={confirmEstadoChange} isLoading={changingEstado}>
                Confirmar cambio
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
