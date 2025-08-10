import { useState, useEffect } from 'react'
import { X, Plus, Save, HelpCircle, Edit } from 'lucide-react'
import IOCHelpModal from './IOCHelpModal'

const IOCEditModal = ({ ioc, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...ioc })
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSave(formData)
    setLoading(false)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Modifier IOC</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse IP
              </label>
              <input
                name="ip"
                value={formData.ip || ''}
                onChange={handleChange}
                placeholder="192.168.1.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serveur
              </label>
              <input
                name="server"
                value={formData.server || ''}
                onChange={handleChange}
                placeholder="srv01.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Système d'exploitation
              </label>
              <input
                name="os"
                value={formData.os || ''}
                onChange={handleChange}
                placeholder="Windows 10, Ubuntu 20.04"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solutions de sécurité
              </label>
              <input
                name="security_solutions"
                value={formData.security_solutions || ''}
                onChange={handleChange}
                placeholder="Norton, Cisco Firewall"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const IOCInput = () => {
  const [iocs, setIocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [hasSeenHelp, setHasSeenHelp] = useState(false)
  const [formData, setFormData] = useState({
    ip: '',
    server: '',
    os: '',
    security_solutions: ''
  })
  const [editModal, setEditModal] = useState(null)

  // Charger les IOCs existants au montage du composant
  useEffect(() => {
    fetchIOCs()
    
    // Vérifier si l'utilisateur a déjà vu l'aide
    const seen = localStorage.getItem('ioc-help-seen')
    if (seen !== 'true') {
      setShowHelpModal(true)
    } else {
      setHasSeenHelp(true)
    }
  }, [])

  const fetchIOCs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/iocs')
      if (response.ok) {
        const data = await response.json()
        setIocs(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des IOCs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier qu'au moins un champ est rempli
    const hasData = Object.values(formData).some(value => value.trim() !== '')
    if (!hasData) {
      alert('Veuillez remplir au moins un champ')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/iocs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        const newIOC = await response.json()
        setIocs(prev => [newIOC, ...prev])
        setFormData({
          ip: '',
          server: '',
          os: '',
          security_solutions: ''
        })
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde des données')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/iocs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIocs(prev => prev.filter(ioc => ioc.id !== id))
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  // Ouvre l'aide à chaque ajout ou modification
  const handleAddClick = () => setShowHelpModal(true)
  const handleEditClick = (ioc) => { setEditModal(ioc) }

  const handleSaveEdit = async (updatedIOC) => {
    try {
      const response = await fetch(`/api/iocs/${updatedIOC.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIOC)
      })

      if (response.ok) {
        setIocs(prev => prev.map(ioc => ioc.id === updatedIOC.id ? updatedIOC : ioc))
        setEditModal(null)
      } else {
        throw new Error('Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      alert('Erreur lors de la modification')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des IOCs</h1>
            <p className="text-gray-600 dark:text-gray-300">Saisissez et gérez vos indicateurs de compromission</p>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Aide</span>
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ajouter un nouvel IOC</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse IP
              </label>
              <input
                type="text"
                id="ip"
                name="ip"
                value={formData.ip}
                onChange={handleInputChange}
                placeholder="192.168.1.1 (Web Server - Apache 2.4.41)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="server" className="block text-sm font-medium text-gray-700 mb-2">
                Serveur
              </label>
              <input
                type="text"
                id="server"
                name="server"
                value={formData.server}
                onChange={handleInputChange}
                placeholder="srv01.example.com (Web Server)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="os" className="block text-sm font-medium text-gray-700 mb-2">
                Système d'exploitation
              </label>
              <input
                type="text"
                id="os"
                name="os"
                value={formData.os}
                onChange={handleInputChange}
                placeholder="Windows 10 Pro 22H2, Ubuntu 20.04 LTS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="security_solutions" className="block text-sm font-medium text-gray-700 mb-2">
                Solutions de sécurité
              </label>
              <input
                type="text"
                id="security_solutions"
                name="security_solutions"
                value={formData.security_solutions}
                onChange={handleInputChange}
                placeholder="Norton Antivirus 2024, Cisco Firewall ASA 9.18"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Affichage des IOCs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">IOCs enregistrés</h2>
        </div>
        
        <div className="p-6">
          {loading && iocs.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : iocs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun IOC enregistré</p>
            </div>
          ) : (
            <div className="space-y-4">
              {iocs.map((ioc) => (
                <div key={ioc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {ioc.ip && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">IP:</span>
                            <p className="text-gray-900">{ioc.ip}</p>
                          </div>
                        )}
                        {ioc.server && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Serveur:</span>
                            <p className="text-gray-900">{ioc.server}</p>
                          </div>
                        )}
                        {ioc.os && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">OS:</span>
                            <p className="text-gray-900">{ioc.os}</p>
                          </div>
                        )}
                        {ioc.security_solutions && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Sécurité:</span>
                            <p className="text-gray-900">{ioc.security_solutions}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-400">
                          Créé le {new Date(ioc.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditClick(ioc)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ioc.id)}
                      className="ml-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'aide */}
      <IOCHelpModal 
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      {editModal && <IOCEditModal ioc={editModal} onClose={() => setEditModal(null)} onSave={handleSaveEdit} />}
    </div>
  )
}

export default IOCInput 