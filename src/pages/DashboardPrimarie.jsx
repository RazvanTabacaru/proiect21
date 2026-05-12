import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { exportCereriPDF } from '../utils/exportPDF'
import { exportCereriExcel } from '../utils/exportExcel'
import SupportForm from './SupportForm'
import ToggleTema from '../components/ToggleTema'
import AsistentAI from '../components/AsistentAI'

export default function DashboardPrimarie() {
  const { profil, logout } = useAuth()
  const [cereri, setCereri] = useState([])
  const [furnizori, setFurnizori] = useState([])
  const [form, setForm] = useState({ titlu: '', descriere: '', furnizor_id: '' })
  const [loading, setLoading] = useState(true)
  const [trimitere, setTrimitere] = useState(false)
  const [tab, setTab] = useState('cereri')

  useEffect(() => {
    fetchDate()
  }, [])

  async function fetchDate() {
    const [{ data: c }, { data: f }] = await Promise.all([
      supabase.from('cereri').select('*, furnizor:furnizor_id(nume)').eq('primarie_id', profil.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, nume').eq('rol', 'furnizor')
    ])
    setCereri(c || [])
    setFurnizori(f || [])
    setLoading(false)
  }

  async function adaugaCerere(e) {
    e.preventDefault()
    setTrimitere(true)
    const { error } = await supabase.from('cereri').insert({
      titlu: form.titlu,
      descriere: form.descriere,
      furnizor_id: form.furnizor_id || null,
      primarie_id: profil.id,
      status: 'asteptare'
    })
    if (!error) {
      await supabase.from('activity_log').insert({
        user_id: profil.id,
        actiune: 'adaugare',
        detalii: `Cerere nouă: ${form.titlu}`
      })
      setForm({ titlu: '', descriere: '', furnizor_id: '' })
      fetchDate()
    }
    setTrimitere(false)
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--culoare-text)' }}>Se încarcă...</div>

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', background: 'var(--culoare-bg)', minHeight: '100vh' }}>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: 'var(--culoare-text)' }}>Dashboard Primărie</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--culoare-text-secundar)' }}>👤 {profil?.nume}</span>
          <ToggleTema />
          <button onClick={logout} style={btnStyle('var(--culoare-danger)')}>Delogare</button>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: `2px solid var(--culoare-border)` }}>
        {['cereri', 'suport'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', border: 'none',
            borderBottom: tab === t ? `2px solid var(--culoare-primary)` : '2px solid transparent',
            background: 'none', cursor: 'pointer',
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? 'var(--culoare-primary)' : 'var(--culoare-text-secundar)',
            marginBottom: -2
          }}>
            {t === 'cereri' ? `Cereri (${cereri.length})` : '🛠 Suport tehnic'}
          </button>
        ))}
      </div>

      {}
      {tab === 'cereri' && (
        <>
          <div style={{
            background: 'var(--culoare-bg-card)',
            border: `1px solid var(--culoare-border)`,
            borderRadius: 12, padding: 24, marginBottom: 32
          }}>
            <h2 style={{ marginTop: 0, color: 'var(--culoare-text)' }}>Cerere nouă</h2>
            <form onSubmit={adaugaCerere}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Titlu *</label>
                <input value={form.titlu} onChange={e => setForm({ ...form, titlu: e.target.value })}
                  style={inputStyle} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Descriere</label>
                <textarea value={form.descriere} onChange={e => setForm({ ...form, descriere: e.target.value })}
                  style={{ ...inputStyle, height: 80, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Alocă furnizor (opțional)</label>
                <select value={form.furnizor_id} onChange={e => setForm({ ...form, furnizor_id: e.target.value })}
                  style={inputStyle}>
                  <option value="">— fără furnizor —</option>
                  {furnizori.map(f => <option key={f.id} value={f.id}>{f.nume}</option>)}
                </select>
              </div>
              <button type="submit" disabled={trimitere} style={btnStyle('var(--culoare-primary)')}>
                {trimitere ? 'Se trimite...' : 'Adaugă cerere'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, color: 'var(--culoare-text)' }}>Cererile mele ({cereri.length})</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => exportCereriPDF(cereri, profil?.nume)} style={{ ...btnStyle('var(--culoare-danger)'), padding: '8px 18px', fontSize: 14 }}>
                📄 PDF
              </button>
              <button onClick={() => exportCereriExcel(cereri, profil?.nume)} style={{ ...btnStyle('var(--culoare-success)'), padding: '8px 18px', fontSize: 14 }}>
                📊 Excel
              </button>
            </div>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr style={{ background: 'var(--culoare-table-header)' }}>
                <th style={thStyle}>Titlu</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Furnizor alocat</th>
                <th style={thStyle}>Data</th>
              </tr>
            </thead>
            <tbody>
              {cereri.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid var(--culoare-table-border)` }}>
                  <td style={tdStyle}>{c.titlu}</td>
                  <td style={tdStyle}><StatusBadge status={c.status} /></td>
                  <td style={tdStyle}>{c.furnizor?.nume || 'Nealocată'}</td>
                  <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              ))}
              {cereri.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: 'var(--culoare-text-secundar)' }}>Nicio cerere încă</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {}
      {tab === 'suport' && <SupportForm />}

      {}
      <AsistentAI cereri={cereri} />
    </div>
  )
}

function StatusBadge({ status }) {
  const culori = { asteptare: '#d69e2e', acceptat: '#38a169', respins: '#e53e3e' }
  return (
    <span style={{ background: culori[status] + '22', color: culori[status], padding: '2px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 }}>
      {status}
    </span>
  )
}

const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14, background: 'var(--culoare-bg-card)', borderRadius: 10, overflow: 'hidden' }
const thStyle = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: `2px solid var(--culoare-border)`, color: 'var(--culoare-text)' }
const tdStyle = { padding: '10px 12px', color: 'var(--culoare-text)' }
const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14, color: 'var(--culoare-text)' }
const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: `1px solid var(--culoare-border-input)`,
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
  background: 'var(--culoare-bg-input)',
  color: 'var(--culoare-text)'
}
const btnStyle = (bg) => ({
  background: bg, color: '#fff', border: 'none',
  borderRadius: 6, padding: '8px 20px',
  cursor: 'pointer', fontSize: 14
})