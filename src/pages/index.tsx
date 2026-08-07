import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowRight, CheckCircle, Users, Zap } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-600">KEVANZA</h1>
          <div className="flex gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Gestiona licitaciones <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
            con confianza
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          KEVANZA es la plataforma moderna para que municipios gestionen licitaciones públicas
          de forma transparente, eficiente y segura.
        </p>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg transition-colors text-lg"
        >
          Comenzar ahora <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Características</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Zap className="w-12 h-12 text-teal-600 mb-4" />
            <h4 className="text-xl font-bold mb-2">Rápido y simple</h4>
            <p className="text-gray-600">
              Crea y publica licitaciones en minutos con nuestro formulario intuitivo.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <Users className="w-12 h-12 text-teal-600 mb-4" />
            <h4 className="text-xl font-bold mb-2">Colaborativo</h4>
            <p className="text-gray-600">
              Invita evaluadores y gestiona el proceso con tu equipo fácilmente.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircle className="w-12 h-12 text-teal-600 mb-4" />
            <h4 className="text-xl font-bold mb-2">Transparente</h4>
            <p className="text-gray-600">
              Auditoría completa y trazabilidad de todos los procesos de licitación.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">¿Listo para mejorar tus licitaciones?</h3>
          <p className="text-lg mb-8 opacity-90">
            Únete a municipios que ya confían en KEVANZA
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-teal-600 font-medium py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Crear cuenta gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 KEVANZA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
