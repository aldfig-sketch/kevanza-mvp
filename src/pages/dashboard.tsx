import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { LineChartComponent } from '@/components/LineChartComponent'
import { DonutChartComponent } from '@/components/DonutChartComponent'
import { BarChartComponent } from '@/components/BarChartComponent'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  total: number
  borrador: number
  revision: number
  aprobacion: number
  listoMercadoPublico: number
  byType: { [key: string]: number }
}

export default function DashboardPage() {
  const { user, profile, organismoNombre, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    borrador: 0,
    revision: 0,
    aprobacion: 0,
    listoMercadoPublico: 0,
    byType: {},
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && profile?.municipio_id) {
      fetchStats()
    } else if (user && !authLoading) {
      setLoadingStats(false)
    }
  }, [user, profile?.municipio_id, authLoading])

  const fetchStats = async () => {
    try {
      const query = supabase
        .from('licitaciones')
        .select('estado,tipo_licita')
        .eq('municipio_id', profile?.municipio_id)
      const { data, error } = await query

      if (error) throw error

      const licitaciones = data || []
      const byType: { [key: string]: number } = {}

      licitaciones.forEach((l) => {
        byType[l.tipo_licita] = (byType[l.tipo_licita] || 0) + 1
      })

      setStats({
        total: licitaciones.length,
        borrador: licitaciones.filter((l) => l.estado === 'BORRADOR').length,
        revision: licitaciones.filter((l) => ['ENVIADA_COMPRA', 'RECHAZADA_COMPRA', 'BASES_GENERADAS', 'ENVIADA_JURIDICO', 'EN_REVISION', 'OBSERVADO', 'RECHAZADA_JURIDICO'].includes(l.estado)).length,
        aprobacion: licitaciones.filter((l) => ['APROBADA_COMPRA', 'APROBADO_JURIDICO', 'DECRETO_GENERADO', 'PENDIENTE_FIRMA'].includes(l.estado)).length,
        listoMercadoPublico: licitaciones.filter((l) => ['LISTO_PUBLICACION', 'PUBLICADA_MP', 'LISTO_MERCADO_PUBLICO'].includes(l.estado)).length,
        byType,
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

  // Mock data for charts
  const lineChartData = [
    { month: 'Ago', licitaciones: 2 },
    { month: 'Sep', licitaciones: 5 },
    { month: 'Oct', licitaciones: 3 },
    { month: 'Nov', licitaciones: 4 },
    { month: 'Dic', licitaciones: stats.total },
  ]

  const donutData = [
    { name: 'Borrador', value: stats.borrador, color: '#94a3b8' },
    { name: 'Revisión', value: stats.revision, color: '#3b82f6' },
    { name: 'Aprobación', value: stats.aprobacion, color: '#f59e0b' },
    { name: 'Listo MP', value: stats.listoMercadoPublico, color: '#10b981' },
  ].filter((d) => d.value > 0)

  const barData = Object.entries(stats.byType).map(([type, count]) => ({
    type,
    count,
  }))

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Hola, {profile?.nombre || profile?.full_name || user.email?.split('@')[0]} 👋
              </h1>
              <p className="text-gray-600">
                {organismoNombre || 'Panel de gestión de requerimientos'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {(profile?.rol === 'ADMIN_MUNICIPIO' || profile?.rol === 'ADMIN_INSTITUCION' || profile?.rol === 'UNIDAD_TECNICA') && (
                <Link href="/licitaciones/crear">
                  <Button size="lg">
                    <Plus className="w-5 h-5" />
                    Nuevo requerimiento
                  </Button>
                </Link>
              )}
              {(profile?.rol === 'ADMIN_MUNICIPIO' || profile?.rol === 'ADMIN_INSTITUCION' || profile?.rol === 'UNIDAD_COMPRA') && (
                <>
                  <Link href="/admin/revisar-licitaciones">
                    <Button size="lg" className="bg-slate-700 hover:bg-slate-800">Revisar requerimientos</Button>
                  </Link>
                  <Link href="/admin/revisar-bases-compra">
                    <Button size="lg" className="bg-indigo-700 hover:bg-indigo-800">Revisar bases</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Borradores</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.borrador}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">En revisión</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.revision}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Aprobación</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.aprobacion}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Listos MP</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.listoMercadoPublico}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <LineChartComponent data={lineChartData} title="Requerimientos por Mes" />

            {donutData.length > 0 && (
              <DonutChartComponent data={donutData} title="Distribución por Estado" />
            )}
          </div>

          {barData.length > 0 && (
            <div className="mb-8">
              <BarChartComponent data={barData} title="Requerimientos por Tipo" />
            </div>
          )}

          {/* Getting Started */}
          <Card className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">🚀 Cómo funciona KEVANZA</h3>
            <p className="text-sm text-gray-600 mb-6">
              La gestión interna previa a publicar en Mercado Público.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-teal-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Registrar</h4>
                <p className="text-sm text-gray-600">Ingresa el requerimiento de compra de tu unidad</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Elaborar bases</h4>
                <p className="text-sm text-gray-600">Redacta bases, anexos y criterios de evaluación</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-orange-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Validar en equipo</h4>
                <p className="text-sm text-gray-600">Revisión y aprobación interna con trazabilidad</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                  <span className="text-lg font-bold text-green-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Formalizar</h4>
                <p className="text-sm text-gray-600">Genera el decreto y queda listo para publicar</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
