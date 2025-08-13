import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import OptimizedLoader from './OptimizedLoader'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Afficher un loader optimisé pendant la vérification de l'authentification
  if (loading) {
    return <OptimizedLoader message="Vérification de l'authentification..." size="large" showShield={true} />
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  // Si l'utilisateur est connecté, afficher le contenu protégé
  return children
} 