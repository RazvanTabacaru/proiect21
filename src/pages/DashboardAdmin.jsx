import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { exportCereriPDF } from '../utils/exportPDF'
import { exportCereriExcel } from '../utils/exportExcel'
import ToggleTema from '../components/ToggleTema'
import AsistentAI from '../components/AsistentAI'

export default function DashboardAdmin() {
  const { profil, logout } = useAuth()
  const [cereri, setCereri] = useState([])
  const [utilizatori, setUtilizatori] = useState([])
  const [loguri, setLoguri] = useState([])
  const [tab, setTab] = useState('cereri')
  const [loading, setLoading] = useState(true)
  const [notificare, setNotificare] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDate()

    const canalCereri = supabase
      .channel('cereri-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cereri' }, () => {
        setNotificare('Cerere actualizată în timp real!')
        setTimeout(() => setNotificare(''), 3000)
        fetchDate()
      })
      .subscribe()

    const canalLog = supabase
      .channel('log-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, () => {
        fetchLoguri()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canalCereri)
      supabase.removeChannel(canalLog)
    }
  }, [])

  async function fetchDate() {
    const [{ data: c }, { data: u }] = await Promise.all([
      supabase.from('cereri').select('*, primarie:primarie_id(nume), furnizor:furnizor_id(nume)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ])
    setCereri(c || [])
    setUtilizatori(u || [])
    setLoading(false)
    fetchLoguri()
  }

  async function fetchLoguri() {
    const { data } = await supabase
      .from('activity_log')
      .select('*, user:user_id(nume)')
      .order('created_at', { ascending: false })
      .limit(50)
    setLoguri(data || [])
  }

  async function stergeCerere(id, titlu) {
    if (!window.confirm('Ștergi această cerere?')) return
    await supabase.from('cereri').delete().eq('id', id)
    await supabase.from('activity_log').insert({
      user_id: profil.id, actiune: 'stergere', detalii: `Cerere ștearsă: ${titlu}`
    })
    fetchDate()
  }

  async function stergeUtilizator(id, nume) {
    if (!window.confirm('Ștergi acest utilizator?')) return
    await supabase.from('profiles').delete().eq('id', id)
    await supabase.from('activity_log').insert({
      user_id: profil.id, actiune: 'stergere', detalii: `Utilizator șters: ${nume}`
    })
    fetchDate()
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--culoare-text)' }}>Se încarcă...</div>

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto', background: 'var(--culoare-bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--culoare-text)' }}>Dashboard Administrator</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--culoare-text-secundar)' }}>👤 {profil?.nume}</span>
          <ToggleTema />
          <button onClick={logout} style={btnStyle('var(--culoare-danger)')}>Delogare</button>
        </div>
      </div>

      {/* Notificare realtime */}
      {notificare && (
        <div style={{ background: 'var(--culoare-notificare-bg)', border: `1px solid var(--culoare-notificare-border)`, borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--culoare-notificare-text)', fontWeight: 500 }}>
          🔴 Live: {notificare}
        </div>
      )}

      {/* Statistici */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total cereri', val: cereri.length, color: 'var(--culoare-primary)' },
          { label: 'În așteptare', val: cereri.filter(c => c.status === 'asteptare').length, color: 'var(--culoare-warning)' },
          { label: 'Acceptate', val: cereri.filter(c => c.status === 'acceptat').length, color: 'var(--culoare-success)' },
          { label: 'Utilizatori', val: utilizatori.length, color: '#9b72cf' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--culoare-bg-card)', border: `1px solid var(--culoare-border)`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 13, color: 'var(--culoare-text-secundar)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Butoane export */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
        <button onClick={() => exportCereriPDF(cereri, profil?.nume)} style={{ ...btnStyle('var(--culoare-danger)'), padding: '8px 18px', fontSize: 14 }}>
          📄 Export PDF
        </button>
        <button onClick={() => exportCereriExcel(cereri, profil?.nume)} style={{ ...btnStyle('var(--culoare-success)'), padding: '8px 18px', fontSize: 14 }}>
          📊 Export Excel
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: `2px solid var(--culoare-border)` }}>
        {['cereri', 'utilizatori', 'loguri'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', border: 'none',
            borderBottom: tab === t ? `2px solid var(--culoare-primary)` : '2px solid transparent',
            background: 'none', cursor: 'pointer',
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? 'var(--culoare-primary)' : 'var(--culoare-text-secundar)',
            marginBottom: -2, textTransform: 'capitalize'
          }}>
            {t === 'cereri' ? `Cereri (${cereri.length})` : t === 'utilizatori' ? `Utilizatori (${utilizatori.length})` : `Activity Log (${loguri.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Cereri */}
      {tab === 'cereri' && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: 'var(--culoare-table-header)' }}>
              {['Titlu', 'Status', 'Primărie', 'Furnizor', 'Data', 'Acțiuni'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {cereri.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid var(--culoare-table-border)` }}>
                <td style={tdStyle}>{c.titlu}</td>
                <td style={tdStyle}><StatusBadge status={c.status} /></td>
                <td style={tdStyle}>{c.primarie?.nume || '—'}</td>
                <td style={tdStyle}>{c.furnizor?.nume || 'Nealocată'}</td>
                <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString('ro-RO')}</td>
                <td style={tdStyle}>
                  <button onClick={() => stergeCerere(c.id, c.titlu)} style={btnStyle('var(--culoare-danger)')}>Șterge</button>
                </td>
              </tr>
            ))}
            {cereri.length === 0 && <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: 'var(--culoare-text-secundar)' }}>Nicio cerere</td></tr>}
          </tbody>
        </table>
      )}

      {/* Tab: Utilizatori */}
      {tab === 'utilizatori' && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: 'var(--culoare-table-header)' }}>
              {['Nume', 'Email', 'Rol', 'Data înregistrării', 'Acțiuni'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {utilizatori.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid var(--culoare-table-border)` }}>
                <td style={tdStyle}>{u.nume}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}><RolBadge rol={u.rol} /></td>
                <td style={tdStyle}>{new Date(u.created_at).toLocaleDateString('ro-RO')}</td>
                <td style={tdStyle}>
                  {u.id !== profil.id && (
                    <button onClick={() => stergeUtilizator(u.id, u.nume)} style={btnStyle('var(--culoare-danger)')}>Șterge</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Tab: Activity Log */}
      {tab === 'loguri' && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: 'var(--culoare-table-header)' }}>
              {['Utilizator', 'Acțiune', 'Detalii', 'Data & Ora'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loguri.map(l => (
              <tr key={l.id} style={{ borderBottom: `1px solid var(--culoare-table-border)` }}>
                <td style={tdStyle}>{l.user?.nume || '—'}</td>
                <td style={tdStyle}><ActiuneBadge actiune={l.actiune} /></td>
                <td style={tdStyle}>{l.detalii}</td>
                <td style={tdStyle}>{new Date(l.created_at).toLocaleString('ro-RO')}</td>
              </tr>
            ))}
            {loguri.length === 0 && <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: 'var(--culoare-text-secundar)' }}>Nicio activitate înregistrată</td></tr>}
          </tbody>
        </table>
      )}

      {/* Asistent AI */}
      <AsistentAI cereri={cereri} />
    </div>
  )
}

function StatusBadge({ status }) {
  const culori = { asteptare: '#d69e2e', acceptat: '#38a169', respins: '#e53e3e' }
  return <span style={{ background: culori[status] + '22', color: culori[status], padding: '2px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 }}>{status}</span>
}

function RolBadge({ rol }) {
  const culori = { administrator: '#6b46c1', primarie: '#2b6cb0', furnizor: '#2c7a7b' }
  return <span style={{ background: culori[rol] + '22', color: culori[rol], padding: '2px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 }}>{rol}</span>
}

function ActiuneBadge({ actiune }) {
  const culori = { adaugare: '#38a169', stergere: '#e53e3e', 'modificare status': '#d69e2e' }
  const c = culori[actiune] || '#718096'
  return <span style={{ background: c + '22', color: c, padding: '2px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 }}>{actiune}</span>
}

const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14, background: 'var(--culoare-bg-card)', borderRadius: 10 }
const thStyle = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: `2px solid var(--culoare-border)`, color: 'var(--culoare-text)' }
const tdStyle = { padding: '10px 12px', color: 'var(--culoare-text)' }
const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 })