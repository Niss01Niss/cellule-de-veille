import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { User, Building, Phone, Briefcase, Save, Edit, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading, clientProfile, updateProfile } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    industry: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (clientProfile) {
      setFormData({
        company_name: clientProfile.company_name || '',
        contact_name: clientProfile.contact_name || '',
        phone: clientProfile.phone || '',
        industry: clientProfile.industry || ''
      })
    }
  }, [clientProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setSaveLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { data, error } = await updateProfile(formData)
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' })
        setIsEditing(false)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour' })
    } finally {
      setSaveLoading(false)
    }
  }

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
    return null
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Profil Utilisateur</h1>
          <p className="text-gray-600 dark:text-gray-300">Gérez vos informations personnelles</p>
        </div>
        
        {/* Contenu du profil */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-300">Fonctionnalité en cours de développement...</p>
        </div>
      </div>
    </div>
  )
} 