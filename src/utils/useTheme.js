import { useState, useEffect } from 'react'

export function useTheme() {
  const [tema, setTema] = useState(() => {
    const salvata = localStorage.getItem('tema')
    if (salvata) return salvata
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
    localStorage.setItem('tema', tema)
  }, [tema])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange(e) {
      const salvata = localStorage.getItem('tema')
      if (!salvata) {
        setTema(e.matches ? 'dark' : 'light')
      }
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  function toggleTema() {
    setTema(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return { tema, toggleTema }
}