import { useMemo } from 'react'
import { CalendarDays, CheckCircle2, Clock3, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

const ROLE_LABELS: Record<string, string> = { ADMIN_SISTEMA: 'Administrador sistema', ADMIN_INSTITUCION: 'Administrador institución', ADMIN_MUNICIPIO: 'Administrador organismo', UNIDAD_TECNICA: 'Unidad técnica', UNIDAD_COMPRA: 'Unidad de compra', JURIDICO: 'Jurídico', JEFE_COMPRAS: 'Jefatura de compras', LECTOR: 'Lector' }

export default function PerfilPage() {
  const { user, profile, organismoNombre, loading } = useAuth()
  const name = profile?.nombre || profile?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const initials = useMemo(() => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), [name])
  if (loading) return <><Header /><main className="min-h-screen bg-slate-50 p-6"><p className="text-slate-500">Cargando perfil...</p></main></>
  if (!user) return null
  return <><Header /><main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wide text-teal-700">CUENTA</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Mi perfil</h1><p className="mt-2 text-slate-600">Información de tu acceso y organismo.</p></div><section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-5 border-b border-slate-200 bg-slate-950 px-6 py-7 text-white sm:flex-row sm:items-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-400 text-xl font-bold text-slate-950">{initials}</span><div><h2 className="text-xl font-bold">{name}</h2><p className="mt-1 text-sm text-slate-300">{ROLE_LABELS[profile?.rol || ''] || profile?.rol || 'Usuario'}</p></div></div><div className="grid gap-0 sm:grid-cols-2"><Info icon={Mail} label="Correo electrónico" value={user.email || '-'} /><Info icon={UserRound} label="Nombre completo" value={name} /><Info icon={ShieldCheck} label="Rol actual" value={ROLE_LABELS[profile?.rol || ''] || profile?.rol || 'Sin rol asignado'} tone="teal" /><Info icon={UserRound} label="Organismo" value={organismoNombre || 'No informado'} /><Info icon={Clock3} label="Último acceso" value={profile?.ultimo_login ? new Date(profile.ultimo_login).toLocaleString('es-CL') : 'Primer acceso'} /><Info icon={CalendarDays} label="Cuenta creada" value={user.created_at ? new Date(user.created_at).toLocaleDateString('es-CL') : '-'} /><Info icon={CheckCircle2} label="Estado" value={profile?.activo === false ? 'Inactivo' : 'Activo'} tone={profile?.activo === false ? 'red' : 'teal'} /></div></section></div></main></>
}

function Info({ icon: Icon, label, value, tone = 'slate' }: { icon: typeof Mail; label: string; value: string; tone?: 'slate' | 'teal' | 'red' }) {
  const tones = { slate: 'text-slate-500', teal: 'text-teal-700', red: 'text-red-700' }
  return <div className="border-b border-slate-100 p-6 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"><div className="flex items-start gap-3"><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tones[tone]}`} /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 break-words text-sm font-semibold ${tone === 'red' ? 'text-red-700' : 'text-slate-900'}`}>{value}</p></div></div></div>
}
