import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/Button'
import { Alert } from '@/components/Alert'

type Solicitud = {
  autoridad_nombre: string
  autoridad_email: string
  estado: string
  token_expira: string
  publicaciones_mercado_publico?: { numero_decreto?: string; contenido_decreto?: string }
}

export default function FirmarDecretoPage() {
  const router = useRouter()
  const { token } = router.query
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null)
  const [loading, setLoading] = useState(true)
  const [firmando, setFirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || typeof token !== 'string') return
    fetch(`/api/firma/obtener?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Solicitud inválida')
        setSolicitud(data.solicitud)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Solicitud inválida'))
      .finally(() => setLoading(false))
  }, [token])

  const firmar = async () => {
    if (typeof token !== 'string') return
    setFirmando(true)
    setError(null)
    try {
      const response = await fetch('/api/firma/firmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo registrar la firma')
      setSolicitud((current) => current ? { ...current, estado: 'FIRMADA' } : current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la firma')
    } finally {
      setFirmando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <section className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Firma de decreto</h1>
        {loading && <p className="text-gray-500 mt-4">Cargando solicitud...</p>}
        {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}
        {solicitud && (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
              <div><dt className="text-gray-500">Autoridad</dt><dd className="font-semibold">{solicitud.autoridad_nombre}</dd></div>
              <div><dt className="text-gray-500">Decreto</dt><dd className="font-semibold">Nº {solicitud.publicaciones_mercado_publico?.numero_decreto || '-'}</dd></div>
              <div><dt className="text-gray-500">Correo</dt><dd className="font-semibold">{solicitud.autoridad_email}</dd></div>
              <div><dt className="text-gray-500">Estado</dt><dd className="font-semibold">{solicitud.estado}</dd></div>
            </dl>
            <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100 whitespace-pre-wrap">{solicitud.publicaciones_mercado_publico?.contenido_decreto}</pre>
            {solicitud.estado === 'PENDIENTE' && <Button className="w-full mt-6" disabled={firmando} onClick={firmar}>{firmando ? 'Registrando firma...' : 'Firmar decreto'}</Button>}
            {solicitud.estado === 'FIRMADA' && <p className="mt-6 text-green-700 font-semibold">Firma registrada. El proceso queda listo para publicación.</p>}
          </>
        )}
      </section>
    </main>
  )
}
