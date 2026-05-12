import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const CULORI_ROL = {
  administrator: '#6b46c1',
  primarie: '#1a73e8',
  furnizor: '#2c7a7b'
}

function construiesteSystem(profil, cereri) {
  const statistici = cereri ? `
- Total cereri: ${cereri.length}
- În așteptare: ${cereri.filter(c => c.status === 'asteptare').length}
- Acceptate: ${cereri.filter(c => c.status === 'acceptat').length}
- Respinse: ${cereri.filter(c => c.status === 'respins').length}
` : ''

  const cereriDetalii = cereri ? cereri.slice(0, 20).map(c =>
    `- "${c.titlu}" | status: ${c.status} | data: ${new Date(c.created_at).toLocaleDateString('ro-RO')}`
  ).join('\n') : ''

  return `Ești un asistent virtual pentru platforma ERP & Ticketing a administrației publice române.

Utilizatorul curent:
- Nume: ${profil?.nume || 'Necunoscut'}
- Rol: ${profil?.rol || 'necunoscut'}
- Email: ${profil?.email || ''}

${cereri ? `Date disponibile pentru acest utilizator:
${statistici}
Cereri recente:
${cereriDetalii}` : ''}

Reguli stricte:
1. Răspunzi DOAR în limba română.
2. Furnizezi informații EXCLUSIV despre datele acestui utilizator.
3. Dacă ești întrebat despre date la care nu ai acces, spui politicos că nu poți furniza acele informații.
4. Ești concis și profesional.
5. Nu inventa date. Dacă nu știi ceva, spune că nu ai informații.
6. Poți ajuta cu: rezumate ale cererilor, statistici, explicații despre platformă și sfaturi de utilizare.`
}

export default function AsistentAI({ cereri = [] }) {
  const { profil } = useAuth()
  const [deschis, setDeschis] = useState(false)
  const [mesaje, setMesaje] = useState([
    {
      rol: 'assistant',
      continut: `Bună ziua, ${profil?.nume?.split(' ')[0] || ''}! Sunt asistentul tău virtual. Te pot ajuta cu informații despre cererile tale sau despre cum să folosești platforma. Cu ce te pot ajuta?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const mesajeRef = useRef(null)

  useEffect(() => {
    if (mesajeRef.current) {
      mesajeRef.current.scrollTop = mesajeRef.current.scrollHeight
    }
  }, [mesaje])

  async function trimitemesaj(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const mesajNou = { rol: 'user', continut: input.trim() }
    const mesajeActualizate = [...mesaje, mesajNou]
    setMesaje(mesajeActualizate)
    setInput('')
    setLoading(true)

    try {
      const sisteminstructiuni = construiesteSystem(profil, cereri)


      const istoricGemini = mesajeActualizate.map(m => ({
        role: m.rol === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.continut }]
      }))

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: sisteminstructiuni }]
            },
            contents: istoricGemini,
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7
            }
          })
        }
      )

      const data = await response.json()
      const raspuns = data.candidates?.[0]?.content?.parts?.[0]?.text
        || 'Nu am putut genera un răspuns. Încearcă din nou.'

      setMesaje(prev => [...prev, { rol: 'assistant', continut: raspuns }])
    } catch (err) {
      setMesaje(prev => [...prev, {
        rol: 'assistant',
        continut: 'A apărut o eroare de conexiune. Verifică cheia API în fișierul .env.'
      }])
    }

    setLoading(false)
  }

  const culoareRol = CULORI_ROL[profil?.rol] || '#1a73e8'

  return (
    <>
      {}
      <button
        onClick={() => setDeschis(!deschis)}
        title="Asistent virtual"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: culoareRol, color: '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
      >
        {deschis ? '✕' : '🤖'}
      </button>

      {}
      {deschis && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 1000,
          width: 360, height: 480,
          background: 'var(--culoare-bg-card)',
          border: '1px solid var(--culoare-border)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>

          {}
          <div style={{
            background: culoareRol, color: '#fff',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Asistent virtual</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Platformă ERP & Ticketing</div>
            </div>
          </div>

          {}
          <div
            ref={mesajeRef}
            style={{
              flex: 1, overflowY: 'auto',
              padding: 12, display: 'flex',
              flexDirection: 'column', gap: 8
            }}
          >
            {mesaje.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.rol === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px',
                  borderRadius: m.rol === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.rol === 'user' ? culoareRol : 'var(--culoare-bg)',
                  color: m.rol === 'user' ? '#fff' : 'var(--culoare-text)',
                  fontSize: 13, lineHeight: 1.5,
                  border: m.rol === 'assistant' ? '1px solid var(--culoare-border)' : 'none'
                }}>
                  {m.continut}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '8px 14px',
                  borderRadius: '12px 12px 12px 2px',
                  background: 'var(--culoare-bg)',
                  border: '1px solid var(--culoare-border)',
                  fontSize: 18, color: 'var(--culoare-text-secundar)'
                }}>
                  ···
                </div>
              </div>
            )}
          </div>

          {}
          <form onSubmit={trimitemesaj} style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--culoare-border)',
            display: 'flex', gap: 8
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Scrie un mesaj..."
              disabled={loading}
              style={{
                flex: 1, padding: '8px 12px',
                border: '1px solid var(--culoare-border-input)',
                borderRadius: 20, fontSize: 13,
                background: 'var(--culoare-bg-input)',
                color: 'var(--culoare-text)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: culoareRol, color: '#fff',
                border: 'none', borderRadius: '50%',
                width: 36, height: 36, cursor: 'pointer',
                fontSize: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.5 : 1,
                flexShrink: 0
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}