import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface Licitacion {
  id: number
  numero: string
  titulo: string
  presupuesto_total: number
  tipo_licita: string
  municipio_id: number
  estado: string
}

interface Oferta {
  id: number
  numero: string
  empresa: string
  precio: number
  puntaje_total?: number
  estado: string
}

export function generatePDF(licitacion: Licitacion, ofertas: Oferta[]) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.text('REPORTE DE LICITACIÓN', 10, 15)

  // Info principal
  doc.setFontSize(12)
  doc.text(`Licitación: ${licitacion.numero}`, 10, 25)
  doc.text(`Título: ${licitacion.titulo}`, 10, 32)
  doc.text(`Presupuesto: $${licitacion.presupuesto_total.toLocaleString()} CLP`, 10, 39)
  doc.text(`Tipo: ${licitacion.tipo_licita}`, 10, 46)
  doc.text(`Estado: ${licitacion.estado}`, 10, 53)

  // Tabla de ofertas
  doc.setFontSize(14)
  doc.text('Ofertas Recibidas', 10, 65)

  const tableData = ofertas.map((oferta) => [
    oferta.numero,
    oferta.empresa,
    `$${oferta.precio.toLocaleString()}`,
    oferta.puntaje_total?.toFixed(2) || '-',
    oferta.estado,
  ])

  ;(doc as any).autoTable({
    head: [['Número', 'Empresa', 'Precio', 'Puntaje', 'Estado']],
    body: tableData,
    startY: 70,
    margin: 10,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(`Página ${i} de ${pageCount}`, 10, doc.internal.pageSize.getHeight() - 10)
    doc.text(`Generado: ${new Date().toLocaleString()}`, 180, doc.internal.pageSize.getHeight() - 10, {
      align: 'right',
    })
  }

  doc.save(`Licitación-${licitacion.numero}.pdf`)
}

export function generateExcel(ofertas: Oferta[], licitacionNumero: string) {
  const data = ofertas.map((oferta) => ({
    'Número Oferta': oferta.numero,
    Empresa: oferta.empresa,
    'Precio (CLP)': oferta.precio,
    'Puntaje Total': oferta.puntaje_total?.toFixed(2) || '-',
    Estado: oferta.estado,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ofertas')

  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
  ]

  XLSX.writeFile(wb, `Ofertas-Licitación-${licitacionNumero}-${Date.now()}.xlsx`)
}

export function generateSummaryPDF(licitacion: Licitacion, ofertas: Oferta[]) {
  const doc = new jsPDF('landscape')

  doc.setFontSize(18)
  doc.text('RESUMEN EJECUTIVO - LICITACIÓN', 10, 15)

  doc.setFontSize(11)
  doc.text(`Licitación: ${licitacion.numero} - ${licitacion.titulo}`, 10, 25)

  // Estadísticas
  const topOferta = ofertas.reduce((max, o) => (o.puntaje_total || 0 > (max.puntaje_total || 0) ? o : max))
  const minPrice = Math.min(...ofertas.map((o) => o.precio))
  const maxPrice = Math.max(...ofertas.map((o) => o.precio))

  doc.setFontSize(12)
  doc.text(`Total de Ofertas: ${ofertas.length}`, 10, 40)
  doc.text(`Oferta Ganadora: ${topOferta.empresa} (Puntaje: ${topOferta.puntaje_total?.toFixed(2)})`, 10, 47)
  doc.text(`Rango de Precios: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`, 10, 54)

  // Tabla resumida
  const topOfertas = ofertas.slice(0, 5).map((o, i) => [
    (i + 1).toString(),
    o.empresa,
    `$${o.precio.toLocaleString()}`,
    o.puntaje_total?.toFixed(2) || '-',
  ])

  ;(doc as any).autoTable({
    head: [['Ranking', 'Empresa', 'Precio', 'Puntaje']],
    body: topOfertas,
    startY: 65,
    margin: 10,
  })

  doc.text(`Generado: ${new Date().toLocaleString()}`, 10, doc.internal.pageSize.getHeight() - 10)

  doc.save(`Resumen-${licitacion.numero}.pdf`)
}
