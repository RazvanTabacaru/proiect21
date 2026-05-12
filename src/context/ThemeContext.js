import { createContext, useContext } from 'react'
import { useTheme } from '../utils/useTheme'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { tema, toggleTema } = useTheme()

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTema = () => useContext(ThemeContext)