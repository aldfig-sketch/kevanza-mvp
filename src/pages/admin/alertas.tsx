import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type AlertRow = { id: string; licitacion_id: string; tipo_alerta: string; descripcion: string; severidad: string; fecha_creacion: string; resuelta: boolean; fecha_resolucion: string | null }
const ADMIN_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'])

export default function AlertasAdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [alerts, setAlerts] = useState<AlertRow[]>([])
  const [showResolved, setShowResolved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = async () => { const { data, error: queryError } = await supabase.from('alertas_registradas').select('id,licitacion_id,tipo_alerta,descripcion,severidad,fecha_creacion,resuelta,fecha_resolucion').order('fecha_creacion', { ascending: false }).limit(200); if (queryError) setError('No se pudieron cargar las alertas.'); else setAlerts((data || []) as AlertRow[]) }
  useEffect(() => { if (user && ADMIN_ROLES.has(profile?.rol || '')) void load() }, [profile?.rol, user])
  const visible = useMemo(() => alerts.filter((item) => showResolved || !item.resuelta), [alerts, showResolved])
  const resolve = async (id: string) => { const { error: updateError } = await supabase.from('alertas_registradas').update({ resuelta: true, fecha_resolucion: new Date().toISOString() }).eq('id', id); if (updateError) setError('No se pudo resolver la alerta.'); else await load() }
  if (authLoading) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Cargando alertas...</main></>
  if (!user || !ADMIN_ROLES.has(profile?.rol || '')) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><p className="text-gray-700">No tienes permisos para ver alertas.</p></main></>
  return <><Header /><main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="flex flex-col md:flex-row md:justify-between gap-4 mb-8"><div><p className="text-sm font-semibold text-teal-700">CONTROL DE PLAZOS</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Alertas</h1><p className="text-gray-600 mt-2">Acompaña las etapas que requieren atención.</p></div><label className="inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} /> Mostrar resueltas</label></div>{error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}<section className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">{visible.length === 0 ? <p className="p-8 text-gray-500">No hay alertas pendientes.</p> : visible.map((alert) => <div key={alert.id} className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div className="flex gap-3"><AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severidad === 'critica' || alert.severidad === 'roja' ? 'text-red-600' : 'text-amber-600'}`} /><div><p className="font-semibold text-gray-900">{alert.tipo_alerta} <span className="text-xs font-normal text-gray-500">· {alert.severidad}</span></p><p className="text-sm text-gray-600 mt-1">{alert.descripcion}</p><p className="text-xs text-gray-400 mt-2">Requerimiento: {alert.licitacion_id} · {new Date(alert.fecha_creacion).toLocaleString('es-CL')}</p></div></div>{alert.resuelta ? <span className="inline-flex items-center gap-1 text-sm text-green-700"><CheckCircle2 className="w-4 h-4" /> Resuelta</span> : <button onClick={() => void resolve(alert.id)} className="inline-flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50">Marcar resuelta</button>}</div>)}</section></div></main></>
}
