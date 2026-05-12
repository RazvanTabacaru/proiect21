import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import SupportForm from './SupportForm'
import ToggleTema from '../components/ToggleTema'
import AsistentAI from '../components/AsistentAI'

export default function DashboardFurnizor() {
  const { profil, logout } = useAuth()
  const [cereri, setCereri] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('cereri')

  useEffect(() => {
    fetchCereri()

    const canal = supabase
      .channel('cereri-furnizor')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cereri', filter: `furnizor_id=eq.${profil.id}` },
        () => { fetchCereri() }
      )
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [profil.id])

  async function fetchCereri() {
    const { data } = await supabase
      .from('cereri')
      .select('*, primarie:primarie_id(nume)')
      .eq('furnizor_id', profil.id)
      .order('created_at', { ascending: false })
    setCereri(data || [])
    setLoading(false)
  }

  async function schimbaStatus(id, statusNou, titlu) {
    await supabase.from('cereri').update({ status: statusNou, updated_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('activity_log').insert({
      user_id: profil.id,
      actiune: 'modificare status',
      detalii: `Cerere "${titlu}" → ${statusNou}`
    })
    fetchCereri()
  }

  if (loading) return <div style={{ padding: 32, color: 'var(--culoare-text)' }}>Se încarcă...</div>

  const inAsteptare = cereri.filter(c => c.status === 'asteptare')
  const procesate = cereri.filter(c => c.status !== 'asteptare')

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto', background: 'var(--culoare-bg)', minHeight: '100vh' }}>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: 'var(--culoare-text)' }}>Dashboard Furnizor</h1>
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
          {}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total cereri', val: cereri.length, color: 'var(--culoare-primary)' },
              { label: 'În așteptare', val: inAsteptare.length, color: 'var(--culoare-warning)' },
              { label: 'Procesate', val: procesate.length, color: 'var(--culoare-success)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--culoare-bg-card)', border: `1px solid var(--culoare-border)`, borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'var(--culoare-text-secundar)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {}
          <h2 style={{ color: 'var(--culoare-text)' }}>În așteptare ({inAsteptare.length})</h2>
          {inAsteptare.length === 0
            ? <p style={{ color: 'var(--culoare-text-secundar)' }}>Nicio cerere în așteptare.</p>
            : inAsteptare.map(c => (
              <div key={c.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', color: 'var(--culoare-text)' }}>{c.titlu}</h3>
                    <p style={{ margin: '0 0 6px', color: 'var(--culoare-text-secundar)', fontSize: 14 }}>{c.descriere || 'Fără descriere'}</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--culoare-text-secundar)' }}>
                      De la: {c.primarie?.nume} · {new Date(c.created_at).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <button onClick={() => schimbaStatus(c.id, 'acceptat', c.titlu)} style={btnStyle('var(--culoare-success)')}>✓ Acceptă</button>
                    <button onClick={() => schimbaStatus(c.id, 'respins', c.titlu)} style={btnStyle('var(--culoare-danger)')}>✗ Respinge</button>
                  </div>
                </div>
              </div>
            ))
          }

          {}
          <h2 style={{ marginTop: 32, color: 'var(--culoare-text)' }}>Procesate ({procesate.length})</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: 'var(--culoare-table-header)' }}>
                <th style={thStyle}>Titlu</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Primărie</th>
                <th style={thStyle}>Actualizat</th>
              </tr>
            </thead>
            <tbody>
              {procesate.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid var(--culoare-table-border)` }}>
                  <td style={tdStyle}>{c.titlu}</td>
                  <td style={tdStyle}><StatusBadge status={c.status} /></td>
                  <td style={tdStyle}>{c.primarie?.nume || '—'}</td>
                  <td style={tdStyle}>{new Date(c.updated_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              ))}
              {procesate.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: 'var(--culoare-text-secundar)' }}>Nicio cerere procesată încă</td></tr>
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

const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14, background: 'var(--culoare-bg-card)', borderRadius: 10 }
const thStyle = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: `2px solid var(--culoare-border)`, color: 'var(--culoare-text)' }
const tdStyle = { padding: '10px 12px', color: 'var(--culoare-text)' }
const cardStyle = { border: `1px solid var(--culoare-border)`, borderRadius: 10, padding: 18, marginBottom: 12, background: 'var(--culoare-bg-card)' }
const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 })