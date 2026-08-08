import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface RequerimientoCompra {
  id: string
  numero: string
  titulo: string
  descripcion?: string
  presupuesto_total: number
  tipo_licita: string
  municipio_id: string
  estado: string
  clasificacion?: string
  porcentaje_seriedad?: number | null
  porcentaje_cumplimiento?: number | null
  plazo_ejecucion_dias?: number | null
  datos_bases?: Record<string, any>
  ponderacion_precio?: number
  ponderacion_tecnica?: number
  ponderacion_plazo?: number
}

export function generateBasesPDF(requerimiento: RequerimientoCompra) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('FICHA DE BASES EN PREPARACION', 10, 15)

  doc.setFontSize(12)
  doc.text(`Requerimiento: ${requerimiento.numero}`, 10, 28)
  doc.text(`Titulo: ${requerimiento.titulo}`, 10, 36)
  doc.text(`Tipo: ${requerimiento.tipo_licita}`, 10, 44)
  doc.text(`Estado: ${requerimiento.estado}`, 10, 52)
  doc.text(`Presupuesto: $${requerimiento.presupuesto_total.toLocaleString()} CLP`, 10, 60)
  doc.text(`Clasificacion: ${requerimiento.clasificacion || '-'}`, 10, 68)
  doc.text(`Plazo ejecucion: ${requerimiento.plazo_ejecucion_dias || '-'} dias`, 10, 76)

  doc.setFontSize(14)
  doc.text('Garantias', 10, 92)
  doc.setFontSize(12)
  doc.text(`Seriedad: ${requerimiento.porcentaje_seriedad ?? '-'}%`, 10, 102)
  doc.text(`Fiel cumplimiento: ${requerimiento.porcentaje_cumplimiento ?? '-'}%`, 10, 110)

  doc.setFontSize(14)
  doc.text('Criterios de evaluacion definidos en bases', 10, 126)
  doc.setFontSize(12)
  doc.text(`Precio: ${requerimiento.ponderacion_precio ?? 0}%`, 10, 136)
  doc.text(`Tecnica: ${requerimiento.ponderacion_tecnica ?? 0}%`, 10, 144)
  doc.text(`Plazo: ${requerimiento.ponderacion_plazo ?? 0}%`, 10, 152)

  doc.save(`Bases-${requerimiento.numero}-${Date.now()}.pdf`)
}

export function generateBasesExcel(requerimientos: RequerimientoCompra[]) {
  const data = requerimientos.map((req) => ({
    Numero: req.numero,
    Titulo: req.titulo,
    Tipo: req.tipo_licita,
    Estado: req.estado,
    Clasificacion: req.clasificacion || '',
    'Presupuesto CLP': req.presupuesto_total,
    'Garantia seriedad %': req.porcentaje_seriedad ?? '',
    'Garantia cumplimiento %': req.porcentaje_cumplimiento ?? '',
    'Plazo ejecucion dias': req.plazo_ejecucion_dias ?? '',
    'Ponderacion precio': req.ponderacion_precio ?? 0,
    'Ponderacion tecnica': req.ponderacion_tecnica ?? 0,
    'Ponderacion plazo': req.ponderacion_plazo ?? 0,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Requerimientos')
  ws['!cols'] = [
    { wch: 16 },
    { wch: 35 },
    { wch: 18 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ]

  XLSX.writeFile(wb, `Requerimientos-KEVANZA-${Date.now()}.xlsx`)
}
