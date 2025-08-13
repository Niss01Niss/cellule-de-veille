import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import Dashboard from '../components/Dashboard'
import OptimizedLoader from '../components/OptimizedLoader'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <OptimizedLoader message="Chargement du dashboard..." size="large" showShield={true} />
  }

  if (!user) {
    return null // Redirection en cours
  }

  return <Dashboard />
}
