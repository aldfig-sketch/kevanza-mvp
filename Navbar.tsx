import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChevronDown, Menu, UserRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLayout } from '@/components/AppLayout'
import { useState } from 'react'

const LABELS: Record<string, string> = { dashboard: 'Inicio', licitaciones: 'Requerimientos', admin: 'Administración', usuarios: 'Usuarios', alertas: 'Alertas', auditoria: 'Trazabilidad', 'bases-tipos': 'Versiones de bases', 'configuracion-plazos': 'Configuración de plazos', comprador: 'Compras', juridico: 'Jurídico', revisiones: 'Revisiones', perfil: 'Mi perfil', onboarding: 'Primer acceso' }

export default function Navbar() {
  const router = useRouter()
  const { user, profile, organismoNombre } = useAuth()
  const { openSidebar } = useLayout()
  const [open, setOpen] = useState(false)
  const name = profile?.nombre || profile?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const segments = router.asPath.split('?')[0].split('/').filter(Boolean)
  const crumbs = segments.map((segment, index) => ({ label: LABELS[segment] || (segment.length > 20 ? 'Detalle' : segment), href: `/${segments.slice(0, index + 1).join('/')}` }))
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button title="Abrir menú" onClick={openSidebar} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"><Menu className="h-5 w-5" /></button><nav aria-label="Migas de pan" className="flex min-w-0 items-center gap-2 text-sm"><Link href="/dashboard" className="hidden font-bold text-teal-700 sm:inline">KEVANZA</Link>{crumbs.length > 0 && <span className="hidden text-slate-300 sm:inline">/</span>}{crumbs.map((crumb, index) => <span key={crumb.href} className="flex min-w-0 items-center gap-2"><Link href={crumb.href} className={`truncate ${index === crumbs.length - 1 ? 'font-semibold text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>{crumb.label}</Link>{index < crumbs.length - 1 && <span className="text-slate-300">/</span>}</span>)}</nav></div><div className="relative"><button aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">{name.charAt(0).toUpperCase()}</span><span className="hidden text-left sm:block"><span className="block max-w-40 truncate text-xs font-semibold text-slate-900">{name}</span><span className="block max-w-40 truncate text-[11px] text-slate-500">{organismoNombre || 'Organismo'}</span></span><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="absolute right-0 top-12 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"><div className="border-b border-slate-100 px-3 py-2"><p className="text-xs text-slate-500">Sesión activa</p><p className="truncate text-sm font-semibold text-slate-900">{user?.email}</p></div><Link href="/perfil" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><UserRound className="h-4 w-4" /> Mi perfil</Link><Link href="/cambiar-contrasena" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Cambiar contraseña</Link></div>}</div></div></header>
}
