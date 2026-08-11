import Link from 'next/link'
import { useRouter } from 'next/router'
import { BarChart3, Bell, BookOpenCheck, ClipboardList, FileCheck2, Home, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, UserRound, Users, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLayout } from '@/components/AppLayout'

type SidebarProps = { open: boolean; onClose: () => void }
type MenuItem = { label: string; href: string; icon: typeof Home; section?: string }

const ADMIN_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'])
const ROLE_LABELS: Record<string, string> = {
  ADMIN_SISTEMA: 'Administrador sistema', ADMIN_INSTITUCION: 'Administrador institución', ADMIN_MUNICIPIO: 'Administrador organismo',
  UNIDAD_TECNICA: 'Unidad técnica', UNIDAD_COMPRA: 'Unidad de compra', JURIDICO: 'Jurídico', JEFE_COMPRAS: 'Jefatura de compras', LECTOR: 'Lector',
}

function menuForRole(role?: string): MenuItem[] {
  const common: MenuItem[] = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Requerimientos', href: '/licitaciones', icon: ClipboardList },
  ]
  if (role === 'UNIDAD_TECNICA') return [...common, { label: 'Nuevo requerimiento', href: '/licitaciones/crear', icon: FileCheck2 }]
  if (role === 'UNIDAD_COMPRA') return [...common, { label: 'Panel de compras', href: '/comprador/dashboard', icon: LayoutDashboard }, { label: 'Revisar requerimientos', href: '/admin/revisar-licitaciones', icon: ClipboardList }, { label: 'Revisar bases', href: '/admin/revisar-bases-compra', icon: BookOpenCheck }]
  if (role === 'JURIDICO') return [...common, { label: 'Revisiones jurídicas', href: '/juridico/revisiones', icon: ShieldCheck }, { label: 'Versiones de bases', href: '/admin/bases-tipos', icon: FileCheck2 }]
  if (role === 'JEFE_COMPRAS') return [...common, { label: 'Panel de compras', href: '/comprador/dashboard', icon: LayoutDashboard }, { label: 'Seguimiento de plazos', href: '/admin/seguimiento-plazos', icon: Bell }, { label: 'Versiones de bases', href: '/admin/bases-tipos', icon: FileCheck2 }]
  if (ADMIN_ROLES.has(role || '')) return [...common, { label: 'Panel de administración', href: '/admin/panel', icon: Settings, section: 'Administración' }, { label: 'Usuarios y permisos', href: '/admin/usuarios', icon: Users }, { label: 'Alertas de plazo', href: '/admin/alertas', icon: Bell }, { label: 'Trazabilidad', href: '/admin/auditoria', icon: ShieldCheck }, { label: 'Versiones de bases', href: '/admin/bases-tipos', icon: FileCheck2 }, { label: 'Configuración de plazos', href: '/admin/configuracion-plazos', icon: Settings }]
  return common
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, profile, organismoNombre, signOut } = useAuth()
  const { closeSidebar } = useLayout()
  const router = useRouter()
  const displayName = profile?.nombre || profile?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const items = menuForRole(profile?.rol)
  const logout = async () => { await signOut(); onClose(); router.push('/auth/login') }
  const close = () => { closeSidebar(); onClose() }
  if (!user) return null
  return <>
    <button aria-label="Cerrar menú" onClick={close} className={`fixed inset-0 z-40 bg-slate-950/40 md:hidden ${open ? 'block' : 'hidden'}`} />
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col bg-slate-950 text-white transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0' : ''}`}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5"><Link href="/dashboard" onClick={close} className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-extrabold text-slate-950">KV</span><span className="text-sm font-bold tracking-wide">KEVANZA</span></Link><button title="Cerrar menú" onClick={close} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"><X className="h-5 w-5" /></button></div>
      <div className="border-b border-white/10 px-5 py-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-slate-950">{displayName.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-xs text-slate-400">{organismoNombre || 'Organismo'}</p></div></div><span className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-teal-200"><UserRound className="h-3.5 w-3.5" /> {ROLE_LABELS[profile?.rol || ''] || profile?.rol || 'Usuario'}</span></div>
      <nav aria-label="Navegación principal" className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">{items.map((item, index) => { const Icon = item.icon; const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`); return <div key={item.href}>{item.section && <p className="mb-2 mt-4 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{item.section}</p>}<Link href={item.href} onClick={close} className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-teal-500 font-semibold text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'} ${index === 0 ? 'mt-0' : ''}`}><Icon className="h-4 w-4 shrink-0" />{item.label}</Link></div>})}</nav>
      <div className="border-t border-white/10 p-3"><Link href="/perfil" onClick={close} className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"><UserRound className="h-4 w-4" /> Mi perfil</Link><button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200"><LogOut className="h-4 w-4" /> Cerrar sesión</button></div>
    </aside>
  </>
}
