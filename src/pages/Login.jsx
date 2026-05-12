import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import AnimatedBackground from '../components/AnimatedBackground'
import ToggleTema from '../components/ToggleTema'

export default function Login() {
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [eroare, setEroare] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setEroare('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: parola
    })

    if (error) {
      setEroare('Email sau parolă incorectă.')
      setLoading(false)
      return
    }

    if (!data.user) {
      setEroare('Nu s-a putut autentifica. Încearcă din nou.')
      setLoading(false)
      return
    }

    const { data: profil, error: erProfil } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', data.user.id)
      .single()

    if (erProfil || !profil) {
      setEroare('Profilul nu a fost găsit. Contactează administratorul.')
      setLoading(false)
      return
    }

    if (profil.rol === 'administrator') navigate('/admin')
    else if (profil.rol === 'primarie') navigate('/primarie')
    else navigate('/furnizor')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--culoare-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <AnimatedBackground />

      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}>
        <ToggleTema />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 400,
        padding: 32,
        background: 'var(--culoare-bg-card)',
        border: '1px solid var(--culoare-border)',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
          <h2 style={{ margin: '0 0 6px', color: 'var(--culoare-text)', fontSize: 22, fontWeight: 600 }}>
            Platformă ERP & Ticketing
          </h2>
          <p style={{ margin: 0, color: 'var(--culoare-text-secundar)', fontSize: 14 }}>
            Autentifică-te în contul tău
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="adresa@email.ro"
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Parolă</label>
            <input
              type="password"
              value={parola}
              onChange={e => setParola(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              required
            />
          </div>
          {eroare && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid #fc8181',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 14,
              color: '#c53030',
              fontSize: 14
            }}>
              ⚠️ {eroare}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: loading ? '#a0aec0' : 'var(--culoare-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 0.3
            }}
          >
            {loading ? 'Se verifică...' : 'Intră în cont'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--culoare-text-secundar)', fontSize: 14 }}>
          Nu ai cont?{' '}
          <Link to="/register" style={{ color: 'var(--culoare-primary)', fontWeight: 600 }}>
            Înregistrează-te
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
  fontSize: 14,
  color: 'var(--culoare-text)'
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--culoare-border-input)',
  borderRadius: 8,
  fontSize: 14,
  boxSizing: 'border-box',
  background: 'var(--culoare-bg-input)',
  color: 'var(--culoare-text)',
  outline: 'none'
}