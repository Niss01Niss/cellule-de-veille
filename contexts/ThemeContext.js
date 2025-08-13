import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Charger le thème depuis localStorage au montage (optimisé)
  useEffect(() => {
    // Utiliser une fonction pour éviter les appels répétés
    const loadTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
          setIsDark(savedTheme === 'dark')
        } else {
          // Détecter la préférence système seulement si pas de thème sauvegardé
          if (typeof window !== 'undefined') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDark(prefersDark)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error)
        // Fallback au thème clair
        setIsDark(false)
      }
    }

    loadTheme()
  }, [])

  // Appliquer le thème au document
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <ThemeContext.Provider value={{
      isDark,
      isSidebarOpen,
      toggleTheme,
      toggleSidebar,
      closeSidebar
    }}>
      {children}
    </ThemeContext.Provider>
  )
} 