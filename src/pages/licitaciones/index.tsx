import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
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
      EVALUACION: 'info',
      ADJUDICADA: 'warning',
    }
    return variants[estado as keyof typeof variants] || 'default'
  }

  if (authLoading || !user) return null

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Licitaciones</h1>
            <p className="text-gray-600 mt-1">Gestiona todas tus licitaciones ({licitaciones.length})</p>
          </div>
          <Link
            href="/licitaciones/crear"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva licitación
          </Link>
        </div>

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
        ) : (
          <div className="grid gap-6">
            {licitaciones.map((lic) => (
              <Card key={lic.id} onClick={() => router.push(`/licitaciones/${lic.id}`)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
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

                <div className="flex items-center justify-end gap-2 text-teal-600">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver detalles</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
