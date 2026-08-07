import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Licitaciones</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <FileText className="w-12 h-12 text-teal-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En Borrador</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Publicadas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <FileText className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/licitaciones/crear"
              className="flex items-center gap-3 p-4 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
            >
              <Plus className="w-6 h-6 text-teal-600" />
              <span className="font-medium text-gray-900">Crear licitación</span>
            </Link>

            <Link
              href="/licitaciones"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-6 h-6 text-gray-600" />
              <span className="font-medium text-gray-900">Ver licitaciones</span>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">¡Comienza aquí!</h3>
          <p className="text-blue-800 mb-4">
            KEVANZA es la plataforma para gestionar licitaciones municipales de forma
            eficiente.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Crea una nueva licitación con todos los detalles</li>
            <li>Publica la licitación para que los proveedores se enteren</li>
            <li>Recibe propuestas y evalúalas</li>
            <li>Adjudica el contrato al mejor oferente</li>
          </ol>
        </div>
      </div>
    </>
  )
}
