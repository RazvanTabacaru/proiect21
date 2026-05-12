import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useAuth } from '../context/AuthContext'

export default function SupportForm() {
  const { profil } = useAuth()
  const [form, setForm] = useState({ titlu: '', mesaj: '' })
  const [status, setStatus] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          titlu: form.titlu,
          mesaj: form.mesaj,
          nume: profil?.nume || 'Necunoscut',
          email_expeditor: profil?.email || '',
          rol: profil?.rol || '',
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setForm({ titlu: '', mesaj: '' })
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div style={{
      background: 'var(--culoare-bg-card)',
      border: `1px solid var(--culoare-border)`,
      borderRadius: 12, padding: 24, maxWidth: 600
    }}>
      <h2 style={{ marginTop: 0, color: 'var(--culoare-text)' }}>🛠 Suport tehnic</h2>
      <p style={{ color: 'var(--culoare-text-secundar)', fontSize: 14, marginTop: 0 }}>
        Trimite un mesaj echipei de suport. Vei primi un răspuns pe email.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Titlu problemă *</label>
          <input
            value={form.titlu}
            onChange={e => setForm({ ...form, titlu: e.target.value })}
            style={inputStyle}
            placeholder="ex: Nu pot adăuga o cerere nouă"
            required
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Descriere *</label>
          <textarea
            value={form.mesaj}
            onChange={e => setForm({ ...form, mesaj: e.target.value })}
            style={{ ...inputStyle, height: 120, resize: 'vertical' }}
            placeholder="Descrie problema în detaliu..."
            required
          />
        </div>

        <div style={{
          background: 'var(--culoare-bg)',
          border: `1px solid var(--culoare-border)`,
          borderRadius: 8, padding: '10px 14px',
          fontSize: 13, color: 'var(--culoare-text-secundar)', marginBottom: 14
        }}>
          <strong style={{ color: 'var(--culoare-text)' }}>Trimis ca:</strong> {profil?.nume} ({profil?.rol})
        </div>

        {status === 'success' && (
          <div style={{ background: 'var(--culoare-notificare-bg)', border: `1px solid var(--culoare-notificare-border)`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--culoare-notificare-text)', fontSize: 14 }}>
            ✅ Tichetul a fost trimis cu succes!
          </div>
        )}
        {status === 'error' && (
          <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#c53030', fontSize: 14 }}>
            ❌ Eroare la trimitere. Încearcă din nou.
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: status === 'loading' ? 'var(--culoare-text-secundar)' : 'var(--culoare-primary)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 24px', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 500
          }}
        >
          {status === 'loading' ? 'Se trimite...' : '📨 Trimite tichet'}
        </button>
      </form>
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14, color: 'var(--culoare-text)' }
const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: `1px solid var(--culoare-border-input)`,
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
  background: 'var(--culoare-bg-input)',
  color: 'var(--culoare-text)'
}