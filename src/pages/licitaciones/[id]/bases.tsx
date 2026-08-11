import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle2, Download, FileText } from 'lucide-react'

type Plantilla = {
  id: string
  tipo_compra: string
  nombre: string
  descripcion: string | null
  version: number
  estructura_base: Record<string, unknown>
}

type BaseAjustada = {
  id: string
  licitacion_id: string
  estado: string
  contenido_bases: Record<string, unknown>
  bases_tipo_id?: string | null
}

export default function BasesRequerimientoPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const [requerimiento, setRequerimiento] = useState<any>(null)
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [base, setBase] = useState<BaseAjustada | null>(null)
  const [contenido, setContenido] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    if (typeof id !== 'string') return
    setLoading(true)
    setError(null)
    const [{ data: req, error: reqError }, { data: existing }, { data: templates, error: templateError }] = await Promise.all([
      supabase.from('licitaciones').select('*').eq('id', id).single(),
      supabase.from('bases_generadas').select('id, licitacion_id, estado, contenido_bases, bases_tipo_id').eq('licitacion_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('bases_tipos').select('id, tipo_compra, nombre, descripcion, version, estructura_base').eq('activo', true).order('version', { ascending: false }),
    ])

    if (reqError || !req) setError('No se pudo cargar el requerimiento')
    if (templateError) setError(templateError.message)
    setRequerimiento(req)
    setPlantillas(((templates || []) as Plantilla[]).filter((item) => item.tipo_compra === req?.tipo_licita))
    if (existing) {
      setBase(existing as BaseAjustada)
      setContenido(JSON.stringify(existing.contenido_bases || {}, null, 2))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (id && user) load()
  }, [id, user])

  const seleccionarPlantilla = async (plantilla: Plantilla) => {
    if (!profile || !user || typeof id !== 'string') return
    setSaving(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const response = await fetch('/api/bases/seleccionar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token || ''}`,
        },
        body: JSON.stringify({ licitacionId: id, basesTipoId: plantilla.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo seleccionar la base tipo')
      setBase(result.base)
      setContenido(JSON.stringify(result.base.contenido_bases, null, 2))
      setSuccess('Base tipo seleccionada. Personalízala para este requerimiento.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error seleccionando la base tipo')
    } finally {
      setSaving(false)
    }
  }

  const guardarAjustes = async () => {
    if (!base || typeof id !== 'string') return
    setSaving(true)
    setError(null)
    try {
      const ajustes = JSON.parse(contenido) as Record<string, unknown>
      const { data: saved, error: saveError } = await supabase
        .from('bases_generadas')
        .update({ contenido_bases: ajustes, estado: 'AJUSTADO', actualizado_por: user?.id, updated_at: new Date().toISOString() })
        .eq('id', base.id)
        .select('id, licitacion_id, estado, contenido_bases, bases_tipo_id')
        .single()
      if (saveError) throw saveError
      const { error: reqError } = await supabase.from('licitaciones').update({ bases_ajustadas: ajustes }).eq('id', id)
      if (reqError) throw reqError
      setBase(saved as BaseAjustada)
      setSuccess('Ajustes guardados')
    } catch (err) {
      setError(err instanceof Error ? `JSON inválido o error al guardar: ${err.message}` : 'Error al guardar ajustes')
    } finally {
      setSaving(false)
    }
  }

  const enviarAJuridico = async () => {
    if (!base) return
    setSending(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const response = await fetch('/api/revisiones/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token || ''}` },
        body: JSON.stringify({ basesId: base.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar a jurídico')
      setSuccess('Bases ajustadas enviadas a Jurídico')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error enviando a Jurídico')
    } finally {
      setSending(false)
    }
  }

  const descargar = () => {
    const blob = new Blob([contenido], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `bases_ajustadas_${requerimiento?.numero || 'requerimiento'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !requerimiento) {
    return <><Header /><main className="max-w-5xl mx-auto px-4 py-8"><p className="text-gray-500">Cargando...</p></main></>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-700 font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Bases tipo del requerimiento</h1>
        <p className="text-gray-600 mt-2 mb-6">{requerimiento.numero} · {requerimiento.titulo}</p>
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {!base ? (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-3 mb-6">
              <FileText className="w-6 h-6 text-teal-700 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Selecciona una estructura base</h2>
                <p className="text-sm text-gray-600">La plantilla es un repositorio institucional. No se genera contenido de bases con IA.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {plantillas.map((plantilla) => (
                <article key={plantilla.id} className="border border-gray-200 rounded-lg p-5">
                  <h3 className="font-bold text-gray-900">{plantilla.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-2">{plantilla.descripcion || 'Plantilla institucional'}</p>
                  <p className="text-xs text-gray-500 mt-3">Versión {plantilla.version}</p>
                  <Button className="mt-4" disabled={saving} onClick={() => seleccionarPlantilla(plantilla)}>Seleccionar base tipo</Button>
                </article>
              ))}
            </div>
            {plantillas.length === 0 && <p className="text-gray-500">No hay una base tipo disponible para {requerimiento.tipo_licita}.</p>}
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bases ajustadas</h2>
                <p className="text-sm text-gray-600">Personaliza la estructura seleccionada con los datos de la ficha.</p>
              </div>
              <button onClick={descargar} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm"><Download className="w-4 h-4" /> Descargar JSON</button>
            </div>
            <textarea value={contenido} onChange={(event) => setContenido(event.target.value)} className="w-full min-h-[28rem] p-4 border border-gray-300 rounded-lg font-mono text-sm" aria-label="Bases ajustadas" />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button disabled={saving} onClick={guardarAjustes}>Guardar ajustes</Button>
              <Button disabled={saving || sending || base.estado === 'ENVIADA_JURIDICO'} onClick={enviarAJuridico} className="bg-indigo-700 hover:bg-indigo-800">
                {sending ? 'Enviando...' : 'Enviar a Jurídico'}
              </Button>
              <Button variant="secondary" onClick={() => router.push(`/licitaciones/${id}`)}>Volver al requerimiento</Button>
            </div>
            {base.estado === 'ENVIADA_JURIDICO' && <p className="text-sm text-indigo-700 mt-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> En revisión jurídica</p>}
          </section>
        )}
      </main>
    </div>
  )
}
