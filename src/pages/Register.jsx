import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import AnimatedBackground from '../components/AnimatedBackground'
import ToggleTema from '../components/ToggleTema'

export default function Register() {
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [nume, setNume] = useState('')
  const [rol, setRol] = useState('primarie')
  const [eroare, setEroare] = useState('')
  const navigate = useNavigate()

  async function handleRegister(e) {
    e.preventDefault()
    setEroare('')
    const { error } = await supabase.auth.signUp({
      email,
      password: parola,
      options: { data: { rol, nume } }
    })
    if (error) { setEroare(error.message); return }
    navigate('/login')
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
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 400, padding: 32,
        background: 'var(--culoare-bg-card)',
        border: '1px solid var(--culoare-border)',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', color: 'var(--culoare-text)', fontSize: 24 }}>
            Platformă ERP & Ticketing
          </h2>
          <p style={{ margin: 0, color: 'var(--culoare-text-secundar)', fontSize: 14 }}>
            Creează un cont nou
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nume</label>
            <input value={nume} onChange={e => setNume(e.target.value)}
              style={inputStyle} placeholder="Numele tău" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} placeholder="adresa@email.ro" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Parolă</label>
            <input type="password" value={parola} onChange={e => setParola(e.target.value)}
              style={inputStyle} placeholder="••••••••" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value)} style={inputStyle}>
              <option value="primarie">Primărie</option>
              <option value="furnizor">Furnizor</option>
            </select>
          </div>
          {eroare && (
            <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#c53030', fontSize: 14 }}>
              {eroare}
            </div>
          )}
          <button type="submit" style={{
            width: '100%', padding: 10, marginTop: 4,
            background: 'var(--culoare-primary)',
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 15, fontWeight: 500
          }}>
            Creează cont
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--culoare-text-secundar)', fontSize: 14 }}>
          Ai deja cont? <Link to="/login" style={{ color: 'var(--culoare-primary)', fontWeight: 500 }}>Autentifică-te</Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14, color: 'var(--culoare-text)' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--culoare-border-input)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }