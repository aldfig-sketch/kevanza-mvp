import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Eye, Edit2, Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredLicitaciones = licitaciones
    .filter((lic) => (filterEstado ? lic.estado === filterEstado : true))
    .filter((lic) =>
      lic.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.numero.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const estadoOptions = ['BORRADOR', 'PUBLICADA', 'EN_EVALUACION', 'ADJUDICADA']

  if (authLoading || !user) return null

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Licitaciones</h1>
              <p className="text-gray-600">Gestiona {filteredLicitaciones.length} de {licitaciones.length} licitaciones</p>
            </div>
            <Link href="/licitaciones/crear">
              <Button size="lg">
                <Plus className="w-5 h-5" />
                Nueva licitación
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="md:col-span-3 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterEstado(null)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  filterEstado === null
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300'
                }`}
              >
                Todas ({licitaciones.length})
              </button>
              {estadoOptions.map((estado) => {
                const count = licitaciones.filter((lic) => lic.estado === estado).length
                return (
                  count > 0 && (
                    <button
                      key={estado}
                      onClick={() => setFilterEstado(estado)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                        filterEstado === estado
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                    >
                      {estado} ({count})
                    </button>
                  )
                )
              })}
            </div>
          </div>

          {/* Empty State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando licitaciones...</p>
            </div>
          ) : licitaciones.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin licitaciones</h3>
              <p className="text-gray-600 mb-6">Aún no hay licitaciones para este municipio</p>
              <Link href="/licitaciones/crear">
                <Button size="lg">Crear la primera licitación</Button>
              </Link>
            </Card>
          ) : filteredLicitaciones.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600 mb-4">No hay licitaciones con los filtros seleccionados</p>
              <button
                onClick={() => {
                  setFilterEstado(null)
                  setSearchQuery('')
                }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Limpiar filtros
              </button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredLicitaciones.map((lic) => (
                <Card key={lic.id} variant="default" className="p-6 hover:border-teal-300">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{lic.numero}</p>
                          <h3 className="text-lg font-bold text-gray-900 truncate">{lic.titulo}</h3>
                        </div>
                        <Badge variant={getEstadoBadge(lic.estado) as any}>{lic.estado}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 py-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Presupuesto</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            ${(lic.presupuesto_total || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Tipo</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{lic.tipo_licita}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Creado</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {new Date(lic.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Estado</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{lic.estado}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {lic.estado === 'BORRADOR' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/licitaciones/${lic.id}/edit`)}
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden md:inline">Editar</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => router.push(`/licitaciones/${lic.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">Ver</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
