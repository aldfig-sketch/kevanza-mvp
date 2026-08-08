import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { Button } from '@/components/Button'
import { CheckCircle, BarChart3, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="fixed w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold">
              KV
            </div>
            <span className="text-xl font-bold">KEVANZA</span>
          </div>
          <Link href="/auth/login">
            <Button size="sm">Iniciar Sesión</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Licitaciones Municipales
            <span className="text-teal-700"> Simplificadas</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma moderna para gestionar procesos de compra pública en municipios chilenos.
            Transparencia, eficiencia y conformidad con normativa.
          </p>

          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/auth/login">
              <Button size="lg">Acceder Plataforma</Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="secondary">Ver Demo</Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="text-sm text-gray-600 pt-8">
            ✅ Usado por municipios en La Araucanía
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Características</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'Crear Licitaciones', desc: 'Define presupuesto, criterios y condiciones' },
              { icon: BarChart3, title: 'Recibir Ofertas', desc: 'Proveedores envían propuestas automáticamente' },
              { icon: Zap, title: 'Evaluar Automático', desc: 'Sistema calcula puntajes ponderados en vivo' },
              { icon: Shield, title: 'Reportes Oficiales', desc: 'PDF y Excel con trazabilidad completa' },
            ].map((feat, i) => {
              const Icon = feat.icon
              return (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-lg transition-shadow">
                  <Icon className="w-8 h-8 text-teal-700 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Credenciales Demo</h2>
          <div className="bg-teal-50 border-2 border-teal-200 p-8 rounded-lg text-center space-y-3">
            <p className="text-sm text-gray-600">Prueba la plataforma ahora:</p>
            <p className="font-mono text-lg">Email: <span className="font-bold">alexis@kevanza.test</span></p>
            <p className="font-mono text-lg">Contraseña: <span className="font-bold">TempPassword123!</span></p>
            <p className="text-sm text-gray-600 pt-4">Puedes crear licitaciones, recibir ofertas y generar reportes.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold">¿Tu municipio está listo?</h2>
          <p className="text-xl opacity-90">Simplifica tus procesos de licitación hoy mismo.</p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <p>© 2026 KEVANZA • Plataforma para municipios chilenos</p>
          <p className="text-sm">Transparencia, eficiencia y conformidad</p>
        </div>
      </footer>
    </div>
  )
}
