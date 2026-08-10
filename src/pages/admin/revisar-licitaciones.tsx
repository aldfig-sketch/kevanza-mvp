import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

type Licitacion = {
  id: string
  numero: string
  titulo: string
  tipo_licita: string | null
  presupuesto_total: number | null
  estado: string
  created_at: string
}

export default function RevisarLicitacionesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [items, setItems] = useState<Licitacion[]>([])
  const [selected, setSelected] = useState<Licitacion | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    if (!profile?.municipio_id) return
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('licitaciones')
      .select('id, numero, titulo, tipo_licita, presupuesto_total, estado, created_at')
      .eq('municipio_id', profile.municipio_id)
      .in('estado', ['BORRADOR', 'ENVIADA_COMPRA', 'RECHAZADA_COMPRA'])
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    setItems((data || []) as Licitacion[])
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
      const response = await fetch('/api/licitacion/revisar-compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session?.access_token || ''}`,
        },
        body: JSON.stringify({ licitacionId: selected.id, aprobada, observaciones }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar la revisión')
      setSuccess(aprobada ? 'Requerimiento aprobado por compras' : 'Requerimiento observado')
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Revisión de requerimientos</h1>
        <p className="text-gray-600 mt-2 mb-6">Unidad de Compra · pendientes del organismo</p>
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <section className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold text-gray-900 mb-3">Pendientes ({items.length})</h2>
            {loading ? <p className="text-gray-500">Cargando...</p> : items.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay requerimientos pendientes.</p>
            ) : items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full text-left p-3 mb-2 rounded border ${selected?.id === item.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}
              >
                <strong className="block text-gray-900">{item.titulo}</strong>
                <span className="text-xs text-gray-500">{item.numero} · {item.estado}</span>
              </button>
            ))}
          </section>
          <section className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            {!selected ? <p className="text-gray-500">Selecciona un requerimiento para revisarlo.</p> : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{selected.titulo}</h2>
                <dl className="grid grid-cols-2 gap-4 my-6 text-sm">
                  <div><dt className="text-gray-500">Número</dt><dd className="font-semibold">{selected.numero}</dd></div>
                  <div><dt className="text-gray-500">Tipo</dt><dd className="font-semibold">{selected.tipo_licita || '-'}</dd></div>
                  <div><dt className="text-gray-500">Presupuesto</dt><dd className="font-semibold">${Number(selected.presupuesto_total || 0).toLocaleString('es-CL')}</dd></div>
                  <div><dt className="text-gray-500">Estado</dt><dd className="font-semibold">{selected.estado}</dd></div>
                </dl>
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  className="w-full min-h-32 border border-gray-300 rounded-lg p-3"
                  placeholder="Indica ajustes o antecedentes faltantes"
                />
                <div className="flex gap-3 mt-4">
                  <Button disabled={saving} onClick={() => review(true)}>Aprobar</Button>
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
