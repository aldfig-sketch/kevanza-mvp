import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  total: number
  borrador: number
  publicada: number
  evaluacion: number
  adjudicada: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    borrador: 0,
    publicada: 0,
    evaluacion: 0,
    adjudicada: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.from('licitaciones').select('estado')

      if (error) throw error

      const licitaciones = data || []
      setStats({
        total: licitaciones.length,
        borrador: licitaciones.filter((l) => l.estado === 'BORRADOR').length,
        publicada: licitaciones.filter((l) => l.estado === 'PUBLICADA').length,
        evaluacion: licitaciones.filter((l) => l.estado === 'EN_EVALUACION').length,
        adjudicada: licitaciones.filter((l) => l.estado === 'ADJUDICADA').length,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Bienvenido, {user.email?.split('@')[0]}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {/* Total */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-2">Licitaciones</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Borrador */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Borradores</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.borrador}</p>
                  <p className="text-xs text-gray-500 mt-2">En edición</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Publicada */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Publicadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.publicada}</p>
                  <p className="text-xs text-gray-500 mt-2">Activas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Evaluación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">En evaluación</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.evaluacion}</p>
                  <p className="text-xs text-gray-500 mt-2">Propuestas</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Adjudicada */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Adjudicadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.adjudicada}</p>
                  <p className="text-xs text-gray-500 mt-2">Finalizadas</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/licitaciones/crear"
                  className="flex items-center gap-4 p-5 border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-transparent rounded-lg hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <div className="p-3 bg-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Nueva licitación</p>
                    <p className="text-xs text-gray-600">Crea una licitación desde cero</p>
                  </div>
                </Link>

                <Link
                  href="/licitaciones"
                  className="flex items-center gap-4 p-5 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-transparent rounded-lg hover:border-gray-400 hover:shadow-md transition-all group"
                >
                  <div className="p-3 bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ver todas</p>
                    <p className="text-xs text-gray-600">Gestiona tus licitaciones</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-teal-900 mb-4">💡 Tip</h3>
              <p className="text-teal-800 text-sm mb-4">
                Las licitaciones comienzan en estado BORRADOR. Puedes editarlas libremente hasta que las publiques.
              </p>
              <div className="space-y-2 text-xs text-teal-700 font-medium">
                <p>✓ Crea borradores</p>
                <p>✓ Publica cuando esté listo</p>
                <p>✓ Recibe propuestas</p>
                <p>✓ Adjudica</p>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white border border-gray-200/50 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Cómo funciona KEVANZA</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-teal-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Crear</h4>
                <p className="text-sm text-gray-600">Ingresa todos los detalles de tu licitación</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Publicar</h4>
                <p className="text-sm text-gray-600">Publica para que los proveedores vean</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-orange-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Evaluar</h4>
                <p className="text-sm text-gray-600">Recibe y compara propuestas</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-green-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Adjudicar</h4>
                <p className="text-sm text-gray-600">Selecciona al mejor oferente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
