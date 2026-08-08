import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Eye, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Licitacion {
  id: number
  numero: string
  titulo: string
  estado: string
  presupuesto_total: number
  tipo_licita: string
  created_at: string
}

export default function LicitacionesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchLicitaciones()
    }
  }, [user, authLoading, router])

  const fetchLicitaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('licitaciones')
        .select('*')
        .eq('municipio_id', 1)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLicitaciones(data || [])
    } catch (err) {
      console.error('Error fetching licitaciones:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      BORRADOR: 'default',
      PUBLICADA: 'success',
      EN_EVALUACION: 'info',
      ADJUDICADA: 'warning',
    }
    return variants[estado as keyof typeof variants] || 'default'
  }

  const filteredLicitaciones = filterEstado
    ? licitaciones.filter((lic) => lic.estado === filterEstado)
    : licitaciones

  const estadoOptions = ['BORRADOR', 'PUBLICADA', 'EN_EVALUACION', 'ADJUDICADA']

  if (authLoading || !user) return null

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Licitaciones</h1>
            <p className="text-gray-600 mt-1">Gestiona todas tus licitaciones ({filteredLicitaciones.length} de {licitaciones.length})</p>
          </div>
          <Link
            href="/licitaciones/crear"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva licitación
          </Link>
        </div>

        {/* Filtro por estado */}
        {licitaciones.length > 0 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterEstado(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterEstado === null
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({licitaciones.length})
            </button>
            {estadoOptions.map((estado) => {
              const count = licitaciones.filter((lic) => lic.estado === estado).length
              return (
                count > 0 && (
                  <button
                    key={estado}
                    onClick={() => setFilterEstado(estado)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterEstado === estado
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {estado} ({count})
                  </button>
                )
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando licitaciones...</p>
          </div>
        ) : licitaciones.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin licitaciones</h3>
            <p className="text-gray-600 mb-6">Aún no hay licitaciones para este municipio</p>
            <Link
              href="/licitaciones/crear"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Crear la primera licitación
            </Link>
          </div>
        ) : filteredLicitaciones.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No hay licitaciones con estado {filterEstado}</p>
            <button
              onClick={() => setFilterEstado(null)}
              className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
            >
              Ver todas
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredLicitaciones.map((lic) => (
              <Card key={lic.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{lic.numero}</p>
                    <h3 className="text-xl font-bold text-gray-900">{lic.titulo}</h3>
                  </div>
                  <Badge variant={getEstadoBadge(lic.estado) as any}>{lic.estado}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-y border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Presupuesto</p>
                    <p className="font-bold text-gray-900">
                      ${(lic.presupuesto_total || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="font-bold text-gray-900">{lic.tipo_licita}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Creado</p>
                    <p className="font-bold text-gray-900">{new Date(lic.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div></div>
                  <div className="flex gap-2">
                    {lic.estado === 'BORRADOR' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/licitaciones/${lic.id}/edit`)
                        }}
                        variant="secondary"
                        className="text-sm"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/licitaciones/${lic.id}`)
                      }}
                      className="text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
