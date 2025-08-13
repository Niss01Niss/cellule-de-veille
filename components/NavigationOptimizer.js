import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

// Composant pour optimiser la navigation
const NavigationOptimizer = ({ children }) => {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationStart, setNavigationStart] = useState(null)

  // Optimiser les transitions de page
  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true)
      setNavigationStart(Date.now())
    }

    const handleComplete = () => {
      const navigationTime = Date.now() - navigationStart
      console.log(`🚀 Navigation terminée en ${navigationTime}ms`)
      setIsNavigating(false)
      setNavigationStart(null)
    }

    const handleError = () => {
      console.error('❌ Erreur de navigation')
      setIsNavigating(false)
      setNavigationStart(null)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
    }
  }, [router, navigationStart])

  // Précharger les pages fréquemment visitées
  useEffect(() => {
    if (user && !loading) {
      // Précharger les pages principales
      const preloadPages = ['/iocs', '/personalized', '/profile']
      preloadPages.forEach(page => {
        router.prefetch(page)
      })
    }
  }, [user, loading, router])

  return (
    <>
      {isNavigating && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 z-50">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
        </div>
      )}
      {children}
    </>
  )
}

export default NavigationOptimizer
