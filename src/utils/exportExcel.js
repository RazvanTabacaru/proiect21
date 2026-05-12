import * as XLSX from 'xlsx'

export function exportCereriExcel(cereri, numeUtilizator) {

  const date = cereri.map((c, i) => ({
    'Nr.': i + 1,
    'Titlu': c.titlu,
    'Descriere': c.descriere || '',
    'Status': c.status,
    'Primarie': c.primarie?.nume || '—',
    'Furnizor': c.furnizor?.nume || 'Nealocata',
    'Data creare': new Date(c.created_at).toLocaleDateString('ro-RO'),
    'Data actualizare': new Date(c.updated_at).toLocaleDateString('ro-RO')
  }))


  const ws = XLSX.utils.json_to_sheet(date)


  ws['!cols'] = [
    { wch: 5 },  
    { wch: 30 },  
    { wch: 40 },  
    { wch: 12 },  
    { wch: 25 },  
    { wch: 25 }, 
    { wch: 14 },  
    { wch: 14 },  
  ]


  const stats = [
    { 'Indicator': 'Total cereri', 'Valoare': cereri.length },
    { 'Indicator': 'Acceptate', 'Valoare': cereri.filter(c => c.status === 'acceptat').length },
    { 'Indicator': 'Respinse', 'Valoare': cereri.filter(c => c.status === 'respins').length },
    { 'Indicator': 'In asteptare', 'Valoare': cereri.filter(c => c.status === 'asteptare').length },
    { 'Indicator': 'Generat de', 'Valoare': numeUtilizator },
    { 'Indicator': 'Data export', 'Valoare': new Date().toLocaleString('ro-RO') },
  ]
  const wsStats = XLSX.utils.json_to_sheet(stats)
  wsStats['!cols'] = [{ wch: 20 }, { wch: 30 }]


  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cereri')
  XLSX.utils.book_append_sheet(wb, wsStats, 'Statistici')

  XLSX.writeFile(wb, `raport-cereri-${new Date().toISOString().slice(0, 10)}.xlsx`)
}