import { useTema } from '../context/ThemeContext'

export default function ToggleTema() {
  const { tema, toggleTema } = useTema()

  return (
    <button
      onClick={toggleTema}
      title={tema === 'dark' ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
      style={{
        background: 'none',
        border: '1px solid var(--culoare-border)',
        borderRadius: 20,
        padding: '4px 12px',
        cursor: 'pointer',
        fontSize: 16,
        color: 'var(--culoare-text)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s'
      }}
    >
      {tema === 'dark' ? '☀️' : '🌙'}
      <span style={{ fontSize: 13 }}>
        {tema === 'dark' ? 'Luminos' : 'Întunecat'}
      </span>
    </button>
  )
}