import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function LicitacionesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Licitaciones</h1>
            <p className="text-gray-600 mt-1">Gestiona todas tus licitaciones</p>
          </div>
          <Link
            href="/licitaciones/crear"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva licitación
          </Link>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sin licitaciones</h3>
          <p className="text-gray-600 mb-6">Aún no has creado ninguna licitación</p>
          <Link
            href="/licitaciones/crear"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Crear la primera licitación
          </Link>
        </div>
      </div>
    </>
  )
}
