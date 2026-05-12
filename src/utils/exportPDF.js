import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportCereriPDF(cereri, numeUtilizator) {
  const doc = new jsPDF()


  doc.setFontSize(18)
  doc.setTextColor(26, 115, 232)
  doc.text('Platforma ERP & Ticketing', 14, 20)

  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text('Raport cereri', 14, 28)
  doc.text(`Generat de: ${numeUtilizator}`, 14, 34)
  doc.text(`Data: ${new Date().toLocaleDateString('ro-RO')}`, 14, 40)


  doc.setDrawColor(26, 115, 232)
  doc.line(14, 44, 196, 44)


  doc.setFontSize(10)
  doc.setTextColor(0)
  const total = cereri.length
  const acceptate = cereri.filter(c => c.status === 'acceptat').length
  const respinse = cereri.filter(c => c.status === 'respins').length
  const asteptare = cereri.filter(c => c.status === 'asteptare').length

  doc.text(`Total: ${total}  |  Acceptate: ${acceptate}  |  Respinse: ${respinse}  |  In asteptare: ${asteptare}`, 14, 52)


  autoTable(doc, {
    startY: 58,
    head: [['Nr.', 'Titlu', 'Status', 'Primarie', 'Furnizor', 'Data']],
    body: cereri.map((c, i) => [
      i + 1,
      c.titlu,
      c.status,
      c.primarie?.nume || '—',
      c.furnizor?.nume || 'Nealocata',
      new Date(c.created_at).toLocaleDateString('ro-RO')
    ]),
    headStyles: {
      fillColor: [26, 115, 232],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 244, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { cellWidth: 25 },
      5: { cellWidth: 25 }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const status = data.cell.raw
        if (status === 'acceptat') doc.setTextColor(56, 161, 105)
        else if (status === 'respins') doc.setTextColor(229, 62, 62)
        else doc.setTextColor(214, 158, 46)
      }
    }
  })


  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Pagina ${i} din ${pageCount}`, 14, doc.internal.pageSize.height - 10)
    doc.text('Platforma ERP & Ticketing - Administratia Publica', 196, doc.internal.pageSize.height - 10, { align: 'right' })
  }

  doc.save(`raport-cereri-${new Date().toISOString().slice(0, 10)}.pdf`)
}