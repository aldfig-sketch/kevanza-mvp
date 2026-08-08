import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { Button } from '@/components/Button'
import { FileText, Users, Stamp, ShieldCheck } from 'lucide-react'

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
      <header className="fixed w-full bg-white/90 backdrop-blur border-b border-gray-200 z-50">
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
          <span className="inline-block text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full">
            Gestión previa a la publicación · Sector público
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Gestión documental de tus
            <span className="text-teal-700"> procesos de adquisición</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elabora las bases, valídalas entre tus equipos y formaliza los decretos.
            Todo el trabajo interno previo a publicar en Mercado Público, con trazabilidad
            y probidad.
          </p>

          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/auth/login">
              <Button size="lg">Acceder a la plataforma</Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="secondary">Cómo funciona</Button>
            </a>
          </div>

          <div className="text-sm text-gray-600 pt-8">
            Para instituciones del Estado regidas por la Ley de Compras Públicas
          </div>
        </div>
      </section>

      {/* Aclaración legal */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-teal-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">KEVANZA no publica procesos ni recibe ofertas.</span>{' '}
              La publicación de los procesos de compra y la recepción de ofertas se realizan
              exclusivamente en <span className="font-medium">Mercado Público</span>, conforme a la
              Ley N° 19.886. KEVANZA gestiona la etapa interna previa: preparación, validación y
              formalización de la documentación.
            </p>
          </div>
        </div>
      </section>

      {/* Features / Cómo funciona */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">Del requerimiento al decreto</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Ordena el trabajo interno de tu unidad de compras en un solo lugar, listo para publicar.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Elaborar bases', desc: 'Redacta bases, anexos y requerimientos con plantillas y control de versiones' },
              { icon: Users, title: 'Validar en equipo', desc: 'Revisión y aprobación interna entre unidades, con trazabilidad de cada cambio' },
              { icon: Stamp, title: 'Formalizar decretos', desc: 'Genera los actos administrativos y decretos que respaldan el proceso' },
              { icon: ShieldCheck, title: 'Probidad y control', desc: 'Acceso por rol, auditoría completa y resguardo de la información antes de publicar' },
            ].map((feat, i) => {
              const Icon = feat.icon
              return (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-teal-700" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-600">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Probidad */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Diseñado para la probidad</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              La etapa previa a la publicación exige reserva y transparencia. KEVANZA lo integra por diseño.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Reserva de la información', desc: 'Las bases en preparación no se pueden extraer ni copiar antes de su publicación oficial.' },
              { title: 'Acceso por rol y comisión', desc: 'Cada integrante del equipo y de la comisión evaluadora ve solo lo que le corresponde.' },
              { title: 'Trazabilidad total', desc: 'Cada acción queda registrada: quién, qué y cuándo. Auditoría permanente.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ordena tus procesos de adquisición</h2>
          <p className="text-xl opacity-90">Prepara, valida y formaliza — con trazabilidad y probidad.</p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100">
              Comenzar ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <p>© 2026 KEVANZA • Gestión de procesos de adquisición para el sector público</p>
          <p className="text-sm">Preparación, validación y formalización previa a Mercado Público</p>
        </div>
      </footer>
    </div>
  )
}
