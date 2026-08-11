import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, ClipboardCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Requirement = {
  id: string
  numero: string | null
  titulo: string | null
  estado: string
  tipo_licita: string | null
  created_at: string
  fecha_envio_compra: string | null
  fecha_envio_juridico: string | null
  fecha_decreto_generado: string | null
}

type Alert = { licitacion_id: string; severidad: 'amarilla' | 'roja' | 'critica'; resuelta: boolean; descripcion: string }

const BUYER_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_COMPRA', 'JEFE_COMPRAS'])
const STAGE_LABELS: Record<string, string> = {
  ENVIADA_COMPRA: 'Revisión de Compras',
  ENVIADA_JURIDICO: 'Revisión jurídica',
  EN_REVISION: 'Revisión jurídica',
  PENDIENTE_FIRMA: 'Firma pendiente',
  DECRETO_GENERADO: 'Decreto generado',
}

function stageStart(requirement: Requirement): string {
  if (['ENVIADA_COMPRA'].includes(requirement.estado)) return requirement.fecha_envio_compra || requirement.created_at
  if (['ENVIADA_JURIDICO', 'EN_REVISION'].includes(requirement.estado)) return requirement.fecha_envio_juridico || requirement.created_at
  if (requirement.estado === 'PENDIENTE_FIRMA') return requirement.fecha_decreto_generado || requirement.created_at
  return requirement.created_at
}

function elapsedDays(start: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 86_400_000))
}

export default function CompradorDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login')
  }, [authLoading, router, user])

  useEffect(() => {
    if (!user || !profile?.municipio_id) return
    if (!BUYER_ROLES.has(profile.rol || '')) {
      setLoading(false)
      return
    }
    const load = async () => {
      setLoading(true)
      const { data, error: requirementsError } = await supabase
        .from('licitaciones')
        .select('id,numero,titulo,estado,tipo_licita,created_at,fecha_envio_compra,fecha_envio_juridico,fecha_decreto_generado')
        .eq('municipio_id', profile.municipio_id)
        .not('estado', 'in', '(PUBLICADA_MP,ARCHIVADO)')
        .order('updated_at', { ascending: false })
      if (requirementsError) {
        setError(requirementsError.message)
        setLoading(false)
        return
      }
      const rows = (data || []) as Requirement[]
      setRequirements(rows)
      const ids = rows.map((row) => row.id)
      if (ids.length) {
        const { data: alertRows } = await supabase
          .from('alertas_registradas')
          .select('licitacion_id,severidad,resuelta,descripcion')
          .in('licitacion_id', ids)
          .eq('resuelta', false)
        setAlerts((alertRows || []) as Alert[])
      } else {
        setAlerts([])
      }
      setLoading(false)
    }
    void load()
  }, [profile?.municipio_id, profile?.rol, user])

  const alertByRequirement = useMemo(() => new Map(alerts.map((alert) => [alert.licitacion_id, alert])), [alerts])
  const lateCount = alerts.filter((alert) => alert.severidad === 'roja' || alert.severidad === 'critica').length
  const reviewCount = requirements.filter((row) => ['ENVIADA_COMPRA', 'ENVIADA_JURIDICO', 'EN_REVISION'].includes(row.estado)).length

  if (authLoading || loading) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Cargando panel de Compras...</main></>
  if (!user) return null
  if (!BUYER_ROLES.has(profile?.rol || '')) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900">Acceso restringido</h1><p className="mt-2 text-gray-600">Este panel está disponible para Compras, jefatura y administración.</p></div></main></>

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div><p className="text-sm font-semibold text-teal-700">UNIDAD DE COMPRA</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Panel de seguimiento</h1><p className="text-gray-600 mt-2">Control de requerimientos, revisiones y alertas de plazo.</p></div>
            <Link href="/licitaciones" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"><ClipboardCheck className="w-4 h-4" /> Ver todos los requerimientos</Link>
          </div>

          {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">No se pudo cargar el panel: {error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-5"><p className="text-sm text-gray-500">Requerimientos activos</p><p className="text-3xl font-bold text-gray-900 mt-2">{requirements.length}</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-5"><p className="text-sm text-gray-500">En revisión</p><p className="text-3xl font-bold text-blue-700 mt-2">{reviewCount}</p></div>
            <div className="bg-white border border-gray-200 rounded-lg p-5"><p className="text-sm text-gray-500">Con alerta de plazo</p><p className="text-3xl font-bold text-red-700 mt-2">{lateCount}</p></div>
          </div>

          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2"><Clock3 className="w-5 h-5 text-teal-700" /><h2 className="font-bold text-gray-900">Seguimiento por etapa</h2></div>
            {requirements.length === 0 ? <p className="p-6 text-gray-500">No hay requerimientos activos para este organismo.</p> : <div className="divide-y divide-gray-100">
              {requirements.map((requirement) => {
                const alert = alertByRequirement.get(requirement.id)
                return <Link key={requirement.id} href={`/licitaciones/${requirement.id}`} className="block p-5 hover:bg-gray-50 transition-colors"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div><p className="text-xs text-gray-500">{requirement.numero || 'Sin número'} · {requirement.tipo_licita || 'Sin tipo'}</p><h3 className="font-semibold text-gray-900 mt-1">{requirement.titulo || 'Requerimiento sin título'}</h3><p className="text-sm text-gray-600 mt-2">{STAGE_LABELS[requirement.estado] || requirement.estado} · {elapsedDays(stageStart(requirement))} días en seguimiento</p></div><div className="flex items-center gap-3">{alert ? <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${alert.severidad === 'amarilla' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}><AlertTriangle className="w-3.5 h-3.5" /> {alert.severidad === 'critica' ? 'Crítica' : alert.severidad === 'roja' ? 'Atrasado' : 'Próximo a vencer'}</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><CheckCircle2 className="w-4 h-4" /> En plazo</span>}<ArrowRight className="w-4 h-4 text-gray-400" /></div></div></Link>
              })}
            </div>}
          </section>
        </div>
      </main>
    </>
  )
}
