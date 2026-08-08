import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { obtenerOfertasPorLicitacion, type Oferta } from '@/lib/ofertas'
import { obtenerLicitacion, type Licitacion } from '@/lib/licitaciones'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Header } from '@/components/Header'

export default function OfertasPage() {
  const router = useRouter()
  const { id } = router.query
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    ;(async () => {
      try {
        const [data, licData] = await Promise.all([
          obtenerOfertasPorLicitacion(id as string),
          obtenerLicitacion(id as string),
        ])
        setOfertas(data || [])
        setLicitacion(licData)
      } catch (error) {
        console.error('Error cargando ofertas:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'GANADORA':
        return 'success'
      case 'EVALUADA':
        return 'info'
      default:
        return 'default'
    }
  }

  const sortedOfertas = [...ofertas].sort((a, b) => {
    if (a.estado === 'GANADORA') return -1
    if (b.estado === 'GANADORA') return 1
    if (a.puntaje_total && b.puntaje_total) {
      return (b.puntaje_total || 0) - (a.puntaje_total || 0)
    }
    return 0
  })

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Ofertas Recibidas</h1>
              <p className="text-gray-600 mt-1">Total: {ofertas.length} ofertas</p>
              {licitacion && (
                <p className="text-sm text-gray-500 mt-2">{licitacion.numero} - {licitacion.titulo}</p>
              )}
            </div>
            <Button
              onClick={() => router.push(`/licitaciones/${id}/ofertas/nueva`)}
              className="md:w-auto"
            >
              + Nueva Oferta
            </Button>
          </div>

          {/* Contenido */}
          {loading ? (
            <Card>
              <div className="py-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </Card>
          ) : ofertas.length === 0 ? (
            <Card variant="outlined">
              <div className="py-16 text-center space-y-4">
                <div className="text-4xl">📮</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sin ofertas aún</h3>
                  <p className="text-gray-600">Los proveedores enviarán sus ofertas una vez publicada la licitación</p>
                </div>
                <Button onClick={() => router.push(`/licitaciones/${id}/ofertas/nueva`)}>
                  + Agregar primera oferta
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Tabla Desktop */}
              <div className="hidden md:block">
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-4 font-semibold text-gray-700">Proveedor</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Precio</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Plazo</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Puntaje</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
                          <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedOfertas.map((oferta) => (
                          <tr
                            key={oferta.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-4">
                              <p className="font-medium text-gray-900">{oferta.proveedor_nombre}</p>
                              <p className="text-xs text-gray-500">{oferta.proveedor_email}</p>
                            </td>
                            <td className="p-4 font-mono text-teal-700">
                              ${oferta.precio_ofertado.toLocaleString('es-CL')}
                            </td>
                            <td className="p-4">{oferta.plazo_dias} días</td>
                            <td className="p-4">
                              {oferta.puntaje_total ? (
                                <span className="font-semibold text-lg">{oferta.puntaje_total.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge variant={getEstadoBadgeVariant(oferta.estado)}>
                                {oferta.estado}
                              </Badge>
                            </td>
                            <td className="p-4 space-x-2">
                              {oferta.estado === 'RECIBIDA' && (
                                <Button
                                  size="sm"
                                  onClick={() => router.push(`/licitaciones/${id}/ofertas/${oferta.id}/evaluar`)}
                                >
                                  Evaluar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/licitaciones/${id}/ofertas/${oferta.id}`)}
                              >
                                Ver
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-3">
                {sortedOfertas.map((oferta) => (
                  <Card key={oferta.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900">{oferta.proveedor_nombre}</p>
                        <p className="text-xs text-gray-500">{oferta.proveedor_email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Precio</p>
                          <p className="font-mono font-semibold">${oferta.precio_ofertado.toLocaleString('es-CL')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Plazo</p>
                          <p className="font-semibold">{oferta.plazo_dias} días</p>
                        </div>
                      </div>
                      {oferta.puntaje_total && (
                        <div className="bg-teal-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-600">Puntaje</p>
                          <p className="text-lg font-bold text-teal-700">{oferta.puntaje_total.toFixed(2)}</p>
                        </div>
                      )}
                      <Badge variant={getEstadoBadgeVariant(oferta.estado)}>
                        {oferta.estado}
                      </Badge>
                      <div className="flex gap-2">
                        {oferta.estado === 'RECIBIDA' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/licitaciones/${id}/ofertas/${oferta.id}/evaluar`)}
                          >
                            Evaluar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => router.push(`/licitaciones/${id}/ofertas/${oferta.id}`)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
