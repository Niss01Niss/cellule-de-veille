import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import IOCInput from '../components/IOCInput'
import IOCHelpModal from '../components/IOCHelpModal'

export default function IOCsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirection en cours
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Gestion des IOCs</h1>
          <p className="text-gray-600 dark:text-gray-300">Indicateurs de compromission</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setIsHelpOpen(true)}
          >
            Voir l'aide
          </button>
        </div>

        {/* Contenu des IOCs */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6">
          <IOCInput />
        </div>

        {/* Modal d'aide */}
        <IOCHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </div>
  )
}