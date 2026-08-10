import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

type BaseItem = {
  id: string
  licitacion_id: string
  estado: string
  contenido_bases: Record<string, unknown>
  licitaciones?: { titulo?: string; numero?: string; tipo_licita?: string }
}

export default function RevisarBasesCompraPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [items, setItems] = useState<BaseItem[]>([])
  const [selected, setSelected] = useState<BaseItem | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    if (!profile?.municipio_id) return
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('bases_generadas')
      .select('id, licitacion_id, estado, contenido_bases, licitaciones(titulo, numero, tipo_licita)')
      .eq('licitaciones.municipio_id', profile.municipio_id)
      .in('estado', ['PROPUESTA', 'AJUSTADO', 'OBSERVADO'])
      .order('fecha_generacion', { ascending: false })
    if (queryError) setError(queryError.message)
    setItems((data || []) as BaseItem[])
    setLoading(false)
  }

  useEffect(() => {
    if (user && profile?.municipio_id) load()
  }, [user, profile?.municipio_id])

  const review = async (aprobada: boolean) => {
    if (!selected) return
    if (!aprobada && !observaciones.trim()) {
      setError('Las observaciones son obligatorias al rechazar')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const response = await fetch('/api/bases/revisar-compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session?.access_token || ''}`,
        },
        body: JSON.stringify({ basesId: selected.id, aprobada, observaciones }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar la revisión')
      setSuccess(aprobada ? 'Bases aprobadas y enviadas a Jurídico' : 'Bases observadas')
      setSelected(null)
      setObservaciones('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando la revisión')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Revisión de bases</h1>
        <p className="text-gray-600 mt-2 mb-6">Validación administrativa y técnica antes de Jurídico</p>
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <section className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold text-gray-900 mb-3">Pendientes ({items.length})</h2>
            {loading ? <p className="text-gray-500">Cargando...</p> : items.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay bases pendientes.</p>
            ) : items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left p-3 mb-2 rounded border ${selected?.id === item.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}
              >
                <strong className="block text-gray-900">{item.licitaciones?.titulo || item.licitacion_id}</strong>
                <span className="text-xs text-gray-500">{item.licitaciones?.numero || '-'} · {item.estado}</span>
              </button>
            ))}
          </section>
          <section className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            {!selected ? <p className="text-gray-500">Selecciona unas bases para revisarlas.</p> : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{selected.licitaciones?.titulo || 'Bases propuestas'}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.licitaciones?.tipo_licita || ''} · {selected.estado}</p>
                <pre className="mt-5 max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100 whitespace-pre-wrap">{JSON.stringify(selected.contenido_bases, null, 2)}</pre>
                <label className="block text-sm font-semibold text-gray-900 mt-5 mb-2" htmlFor="observaciones-bases">Observaciones</label>
                <textarea
                  id="observaciones-bases"
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  className="w-full min-h-32 border border-gray-300 rounded-lg p-3"
                  placeholder="Indica ajustes administrativos o técnicos"
                />
                <div className="flex gap-3 mt-4">
                  <Button disabled={saving} onClick={() => review(true)}>Aprobar y enviar a Jurídico</Button>
                  <Button disabled={saving || !observaciones.trim()} onClick={() => review(false)} className="bg-red-600 hover:bg-red-700">Rechazar</Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
