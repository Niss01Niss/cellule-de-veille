import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import PersonalizedDashboard from '../components/PersonalizedDashboard'
import OptimizedLoader from '../components/OptimizedLoader'

export default function PersonalizedDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <OptimizedLoader message="Chargement du dashboard personnalisé..." size="large" type="dots" />
  }

  if (!user) {
    return null // Redirection en cours
  }

  return <PersonalizedDashboard />
} 
