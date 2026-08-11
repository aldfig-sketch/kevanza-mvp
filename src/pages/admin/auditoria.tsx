import { useEffect, useState } from 'react'
import { History, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Log = { id: string; usuario_id: string | null; accion: string; tabla: string; registro_id: string | null; cambios: Record<string, unknown> | null; created_at: string }
const ADMIN_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'])

export default function AuditoriaPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<Log[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (!user || !ADMIN_ROLES.has(profile?.rol || '')) return; void (async () => { const { data: session } = await supabase.auth.getSession(); const response = await fetch('/api/admin/auditoria', { headers: { Authorization: `Bearer ${session.session?.access_token || ''}` } }); const result = await response.json(); if (!response.ok) setError(result.error || 'No se pudo cargar la trazabilidad'); else setLogs(result.logs || []) })() }, [profile?.rol, user])
  if (authLoading) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Cargando trazabilidad...</main></>
  if (!user || !ADMIN_ROLES.has(profile?.rol || '')) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><p className="text-gray-700">No tienes permisos para ver la trazabilidad.</p></main></>
  return <><Header /><main className="min-h-screen bg-gray-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="mb-8"><p className="text-sm font-semibold text-teal-700">PROBIDAD Y CONTROL</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Trazabilidad de actividad</h1><p className="text-gray-600 mt-2">Registro de acciones disponibles para el ámbito de tu organismo.</p></div>{error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}<section className="bg-white border border-gray-200 rounded-lg overflow-hidden"><div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-700" /><h2 className="font-bold text-gray-900">Últimas acciones</h2></div>{logs.length === 0 ? <div className="p-8 text-center text-gray-500"><History className="w-8 h-8 mx-auto mb-2 text-gray-400" />No hay actividad registrada.</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-gray-500"><tr><th className="px-5 py-3 font-semibold">Fecha</th><th className="px-5 py-3 font-semibold">Acción</th><th className="px-5 py-3 font-semibold">Objeto</th><th className="px-5 py-3 font-semibold">Usuario</th><th className="px-5 py-3 font-semibold">Cambios</th></tr></thead><tbody className="divide-y divide-gray-100">{logs.map((log) => <tr key={log.id}><td className="px-5 py-3 whitespace-nowrap text-gray-600">{new Date(log.created_at).toLocaleString('es-CL')}</td><td className="px-5 py-3 font-semibold text-gray-900">{log.accion}</td><td className="px-5 py-3 text-gray-700">{log.tabla}{log.registro_id ? <span className="block text-xs text-gray-400">{log.registro_id}</span> : null}</td><td className="px-5 py-3 text-gray-600">{log.usuario_id || 'Sistema'}</td><td className="px-5 py-3 max-w-sm truncate text-gray-600">{log.cambios ? JSON.stringify(log.cambios) : '—'}</td></tr>)}</tbody></table></div>}</section></div></main></>
}
