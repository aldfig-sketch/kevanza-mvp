import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { ChevronDown, ArrowLeft, Edit2, Trash2 } from 'lucide-react'

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

const ESTADO_OPTIONS = ['BORRADOR', 'PUBLICADA', 'EN_EVALUACION', 'ADJUDICADA']

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
  const [publishingModal, setPublishingModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [newEstado, setNewEstado] = useState('')
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
      setNewEstado(data.estado)
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

  const handlePublish = async () => {
    if (!licitacion) return

    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('licitaciones')
        .update({ estado: 'PUBLICADA', published_at: new Date().toISOString() })
        .eq('id', licitacion.id)

      if (updateError) throw updateError
      setLicitacion({ ...licitacion, estado: 'PUBLICADA' })
      setNewEstado('PUBLICADA')
      setPublishingModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setLoading(false)
    }
  }

  const getValidTransitions = (estado: string): string[] => {
    return VALID_TRANSITIONS[estado] || []
  }

  const handleEstadoChange = (nuevoEstado: string) => {
    if (!licitacion) return
    const validTransitions = getValidTransitions(licitacion.estado)

    if (!validTransitions.includes(nuevoEstado)) {
      setError(`No se puede pasar de ${licitacion.estado} a ${nuevoEstado}`)
      setNewEstado(licitacion.estado)
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
      setNewEstado(pendingEstado)
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">Cargando...</p>
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
  const canPublish = licitacion.estado === 'BORRADOR'

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/licitaciones')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{licitacion.titulo}</h1>
              <Badge variant={ESTADO_COLORS[licitacion.estado]}>{licitacion.estado}</Badge>
            </div>
            <p className="text-gray-600">{licitacion.numero}</p>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <Button
                onClick={() => router.push(`/licitaciones/${licitacion.id}/edit`)}
                variant="secondary"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                onClick={() => setDeleteModal(true)}
                variant="danger"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-700 font-medium">✓ {successMsg}</p>
          </div>
        )}

        {/* Estado Selector */}
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Estado de la Licitación</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getValidTransitions(licitacion.estado).length === 0
                  ? 'Estado final - no se puede cambiar'
                  : 'Cambiar estado actual'}
              </p>
            </div>
            <select
              value={newEstado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              disabled={loading || changingEstado || getValidTransitions(licitacion.estado).length === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value={licitacion.estado}>{licitacion.estado} (actual)</option>
              {getValidTransitions(licitacion.estado).map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Datos Generales */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => toggleSection('general')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <h2 className="text-lg font-bold text-gray-900">Datos Generales</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${openSections.general ? 'rotate-180' : ''}`}
            />
          </button>

          {openSections.general && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Número</p>
                  <p className="font-semibold text-gray-900">{licitacion.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-semibold text-gray-900">{licitacion.tipo_licita}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Municipio</p>
                  <p className="font-semibold text-gray-900">
                    {MUNICIPIOS[licitacion.municipio_id] || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Creado</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(licitacion.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {licitacion.descripcion && (
                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="text-gray-900">{licitacion.descripcion}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Presupuesto */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => toggleSection('presupuesto')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <h2 className="text-lg font-bold text-gray-900">Presupuesto</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${openSections.presupuesto ? 'rotate-180' : ''}`}
            />
          </button>

          {openSections.presupuesto && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-sm text-teal-600">Presupuesto Total</p>
                  <p className="text-3xl font-bold text-teal-900">
                    ${licitacion.presupuesto_total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Evaluación y Ponderaciones */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => toggleSection('evaluacion')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
          >
            <h2 className="text-lg font-bold text-gray-900">Criterios de Evaluación</h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${openSections.evaluacion ? 'rotate-180' : ''}`}
            />
          </button>

          {openSections.evaluacion && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Precio</p>
                  <p className="text-2xl font-bold text-blue-900">{licitacion.ponderacion_precio}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Técnica</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {licitacion.ponderacion_tecnica}%
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Experiencia</p>
                  <p className="text-2xl font-bold text-green-900">
                    {licitacion.ponderacion_experiencia}%
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600">Otro</p>
                  <p className="text-2xl font-bold text-orange-900">{licitacion.ponderacion_otro}%</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-gray-50 text-center">
                <p className="text-sm text-gray-600">Total Ponderaciones</p>
                <p className="text-xl font-bold text-gray-900">
                  {(
                    licitacion.ponderacion_precio +
                    licitacion.ponderacion_tecnica +
                    licitacion.ponderacion_experiencia +
                    licitacion.ponderacion_otro
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          )}
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
              <Button
                onClick={() => setDeleteModal(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                isLoading={deleting}
              >
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
              ¿Deseas cambiar el estado de <strong>{licitacion.estado}</strong> a <strong>{pendingEstado}</strong>?
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
              <Button
                onClick={confirmEstadoChange}
                isLoading={changingEstado}
              >
                Confirmar cambio
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
