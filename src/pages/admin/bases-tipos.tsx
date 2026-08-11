import { useEffect, useState } from 'react'
import { Check, FilePlus2, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Template = { id: string; nombre: string; tipo_compra: string; version: number; estructura_base: unknown }
type Version = { id: string; bases_tipo_id: string; version: string; estado: string; contenido: Record<string, unknown>; aprobada_jefatura: boolean | null; aprobada_juridico: boolean | null; bases_tipos?: { nombre?: string } | { nombre?: string }[] }
const ADMIN_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_COMPRA', 'JEFE_COMPRAS', 'JURIDICO'])

export default function BasesTiposPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [versionNumber, setVersionNumber] = useState('')
  const [content, setContent] = useState('{}')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const [{ data: templateRows }, { data: versionRows }] = await Promise.all([
      supabase.from('bases_tipos').select('id,nombre,tipo_compra,version,estructura_base').eq('activo', true).order('tipo_compra'),
      supabase.from('bases_tipo_versiones').select('id,bases_tipo_id,version,estado,contenido,aprobada_jefatura,aprobada_juridico,bases_tipos(nombre)').order('created_at', { ascending: false }),
    ])
    setTemplates((templateRows || []) as Template[])
    setVersions((versionRows || []) as Version[])
    setLoading(false)
  }

  useEffect(() => { if (user && profile?.municipio_id) void load() }, [profile?.municipio_id, user])

  const createVersion = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    let parsed: unknown
    try { parsed = JSON.parse(content) } catch { setMessage('El contenido debe ser JSON válido.'); return }
    setSaving(true)
    const { data: session } = await supabase.auth.getSession()
    const response = await fetch('/api/bases/versiones', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token || ''}` }, body: JSON.stringify({ action: 'crear', basesTipoId: selectedTemplate, version: versionNumber, contenido: parsed }) })
    const result = await response.json()
    setSaving(false)
    setMessage(response.ok ? 'Versión creada y enviada a revisión.' : result.error || 'No se pudo crear la versión.')
    if (response.ok) { setVersionNumber(''); setContent('{}'); await load() }
  }

  const approve = async (versionId: string, action: 'jefatura' | 'juridico') => {
    setMessage(null)
    const { data: session } = await supabase.auth.getSession()
    const response = await fetch('/api/bases/versiones', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token || ''}` }, body: JSON.stringify({ action, versionId }) })
    const result = await response.json()
    setMessage(response.ok ? 'Aprobación registrada.' : result.error || 'No se pudo registrar la aprobación.')
    if (response.ok) await load()
  }

  if (authLoading || loading) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Cargando versiones...</main></>
  if (!user || !ADMIN_ROLES.has(profile?.rol || '')) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><p className="text-gray-700">No tienes permisos para administrar bases tipo.</p></main></>

  return <><Header /><main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="mb-8"><p className="text-sm font-semibold text-teal-700">CONFIGURACIÓN CONTROLADA</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Versiones de bases tipo</h1><p className="text-gray-600 mt-2">Toda versión debe pasar por jefatura y jurídico antes de quedar oficial.</p></div>
    {message && <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">{message}</div>}
    <section className="bg-white border border-gray-200 rounded-lg p-6 mb-8"><div className="flex items-center gap-2 mb-5"><FilePlus2 className="w-5 h-5 text-teal-700" /><h2 className="font-bold text-gray-900">Crear nueva versión</h2></div><form onSubmit={createVersion} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="text-sm font-semibold text-gray-700">Base tipo<select required value={selectedTemplate} onChange={(event) => { setSelectedTemplate(event.target.value); const template = templates.find((item) => item.id === event.target.value); if (template) setContent(JSON.stringify({ estructura: template.estructura_base }, null, 2)) }} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"><option value="">Selecciona una base</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.nombre} · {template.tipo_compra}</option>)}</select></label><label className="text-sm font-semibold text-gray-700">Número de versión<input required value={versionNumber} onChange={(event) => setVersionNumber(event.target.value)} placeholder="2.0" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" /></label></div><label className="block text-sm font-semibold text-gray-700">Contenido JSON<textarea required value={content} onChange={(event) => setContent(event.target.value)} rows={8} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs font-normal" /></label><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"><FilePlus2 className="w-4 h-4" /> {saving ? 'Guardando...' : 'Enviar a revisión'}</button></form></section>
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden"><div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-700" /><h2 className="font-bold text-gray-900">Historial de versiones</h2></div>{versions.length === 0 ? <p className="p-6 text-gray-500">Todavía no hay versiones registradas.</p> : <div className="divide-y divide-gray-100">{versions.map((version) => { const template = Array.isArray(version.bases_tipos) ? version.bases_tipos[0] : version.bases_tipos; return <div key={version.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div><p className="font-semibold text-gray-900">{template?.nombre || 'Base tipo'} · v{version.version}</p><p className="text-sm text-gray-600 mt-1">Estado: {version.estado} · Jefatura: {version.aprobada_jefatura ? 'OK' : 'Pendiente'} · Jurídico: {version.aprobada_juridico ? 'OK' : 'Pendiente'}</p></div><div className="flex flex-wrap gap-2">{!version.aprobada_jefatura && ['JEFE_COMPRAS', 'ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'].includes(profile?.rol || '') && <button onClick={() => approve(version.id, 'jefatura')} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><Check className="w-3.5 h-3.5" /> Aprobar jefatura</button>}{!version.aprobada_juridico && ['JURIDICO', 'ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'].includes(profile?.rol || '') && <button onClick={() => approve(version.id, 'juridico')} className="inline-flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"><Check className="w-3.5 h-3.5" /> Aprobar jurídico</button>}</div></div> })}</div>}</section>
  </div></main></>
}
