import Link from 'next/link'
import { useRouter } from 'next/router'
import { AlertTriangle, FileCheck2, Settings, ShieldCheck, Users, Clock3 } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

const ADMIN_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'])
const cards = [
  { href: '/admin/usuarios', title: 'Usuarios y permisos', description: 'Crea cuentas, asigna roles y controla accesos.', icon: Users, color: 'text-teal-700 bg-teal-50' },
  { href: '/admin/alertas', title: 'Alertas de plazo', description: 'Revisa y resuelve alertas del flujo de compra.', icon: AlertTriangle, color: 'text-amber-700 bg-amber-50' },
  { href: '/admin/auditoria', title: 'Trazabilidad', description: 'Consulta la actividad registrada del organismo.', icon: ShieldCheck, color: 'text-indigo-700 bg-indigo-50' },
  { href: '/admin/bases-tipos', title: 'Versiones de bases', description: 'Administra plantillas y sus aprobaciones.', icon: FileCheck2, color: 'text-blue-700 bg-blue-50' },
  { href: '/admin/configuracion-plazos', title: 'Configuración de plazos', description: 'Define los tiempos de seguimiento institucional.', icon: Clock3, color: 'text-slate-700 bg-slate-100' },
]

export default function AdminPanelPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  if (loading) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Cargando administración...</main></>
  if (!user) { if (typeof window !== 'undefined') void router.replace('/auth/login'); return null }
  if (!ADMIN_ROLES.has(profile?.rol || '')) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><p className="text-gray-700">No tienes permisos para administrar este organismo.</p></main></>

  return <><Header /><main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex items-start justify-between gap-4 mb-8"><div><p className="text-sm font-semibold text-teal-700">ADMINISTRACIÓN</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Control del organismo</h1><p className="text-gray-600 mt-2">Gestiona accesos, trazabilidad y reglas del proceso.</p></div><Settings className="w-8 h-8 text-gray-400" aria-hidden="true" /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{cards.map(({ href, title, description, icon: Icon, color }) => <Link key={href} href={href} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-teal-300 hover:shadow-sm transition-all"><div className="flex items-start gap-4"><span className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></span><span><span className="block font-semibold text-gray-900">{title}</span><span className="block text-sm text-gray-600 mt-1">{description}</span></span></div></Link>)}</div>
  </div></main></>
}
