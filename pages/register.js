import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Shield, Eye, EyeOff, Mail, Lock, User, Building, Phone, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    contactName: '',
    phone: '',
    industry: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signUp } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        companyName: formData.companyName,
        contactName: formData.contactName,
        phone: formData.phone,
        industry: formData.industry
      })
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const industries = [
    'Technologie', 'Finance', 'Santé', 'Éducation', 'Commerce',
    'Manufacturing', 'Transport', 'Énergie', 'Télécommunications', 'Autre'
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className={`mt-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Créer un compte
            </h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Rejoignez Cyber Alerts pour sécuriser votre infrastructure
            </p>
          </div>

          <div className={`${isDark ? 'bg-dark-800' : 'bg-white'} shadow-xl rounded-2xl p-8 border ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      isDark 
                        ? 'border-dark-600 bg-dark-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border ${
                      isDark 
                        ? 'border-dark-600 bg-dark-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border ${
                      isDark 
                        ? 'border-dark-600 bg-dark-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Nom de l'entreprise
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      isDark 
                        ? 'border-dark-600 bg-dark-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactName" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Nom du contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      isDark 
                        ? 'border-dark-600 bg-dark-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      isDark 
                        ? 'border-dark-600 bg-dark-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="industry" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Secteur d'activité
                </label>
                <select
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-3 border ${
                    isDark 
                      ? 'border-dark-600 bg-dark-700 text-white focus:border-blue-500 focus:ring-blue-500' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                >
                  <option value="">Sélectionnez un secteur</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                    isDark ? 'focus:ring-offset-dark-800' : 'focus:ring-offset-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création en cours...
                    </div>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Déjà un compte ?{' '}
                  <Link 
                    href="/login"
                    className={`font-medium hover:underline ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              © 2025 Cyber Alerts. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
