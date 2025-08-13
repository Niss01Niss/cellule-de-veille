import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, BarChart3, Shield, Settings, Activity, Plus, Trash2, Edit, Eye, X, Check, AlertTriangle } from 'lucide-react'

// Mapping des industries pour l'affichage et les valeurs
const INDUSTRY_OPTIONS = [
  { value: 'healthcare', label: 'Santé' },
  { value: 'finance', label: 'Finance' },
  { value: 'technology', label: 'Technologie' },
  { value: 'retail', label: 'Commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'government', label: 'Gouvernement' },
  { value: 'education', label: 'Éducation' },
  { value: 'energy', label: 'Énergie' },
  { value: 'transportation', label: 'Transport' },
  { value: 'telecommunications', label: 'Télécommunications' }
]

// Fonction pour obtenir le label français d'une valeur d'industrie
const getIndustryLabel = (value) => {
  const option = INDUSTRY_OPTIONS.find(opt => opt.value === value)
  return option ? option.label : value || '-'
}

export default function AdminDashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [editingClient, setEditingClient] = useState(null)
  const { user } = useAuth()
  const router = useRouter()

  // État du formulaire d'ajout/édition
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    contact_name: '',
    phone: '',
    industry: '',
    subscription_plan: 'basic'
  })

  // Synchroniser la vue active avec l'URL au chargement
  useEffect(() => {
    const view = router.query.view || 'overview'
    setActiveView(view)
  }, [router.query.view])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (user?.app_metadata?.role !== 'admin') {
      router.push('/')
    } else {
      fetchClients()
    }
  }, [user])

  const adminHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
    return headers
  }

  const fetchClients = async () => {
    try {
      setLoading(true)
      const headers = await adminHeaders()
      const res = await fetch('/api/admin/clients', { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur chargement clients')
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (userId, isActive) => {
    try {
      setPending(true)
      const headers = await adminHeaders()
      const res = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ user_id: userId, is_active: !isActive })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur mise à jour')
      await fetchClients()
    } catch (error) {
      console.error('Error updating is_active:', error)
    } finally {
      setPending(false)
    }
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    try {
      setPending(true)
      
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          role: 'client'
        }
      })

      if (authError) throw authError

      // Créer le profil client
      const headers = await adminHeaders()
      const profileRes = await fetch('/api/admin/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: authData.user.id,
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          phone: formData.phone,
          industry: formData.industry,
          subscription_plan: formData.subscription_plan,
          is_active: true
        })
      })

      if (!profileRes.ok) {
        const profileError = await profileRes.json()
        throw new Error(profileError.error || 'Erreur création profil')
      }

      // Réinitialiser le formulaire et fermer le modal
      setFormData({
        email: '',
        password: '',
        company_name: '',
        contact_name: '',
        phone: '',
        industry: '',
        subscription_plan: 'basic'
      })
      setShowAddClientModal(false)
      
      // Rafraîchir la liste des clients
      await fetchClients()
      
      alert('Client ajouté avec succès !')
    } catch (error) {
      console.error('Error adding client:', error)
      alert(`Erreur lors de l'ajout du client: ${error.message}`)
    } finally {
      setPending(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return
    
    try {
      setPending(true)
      const headers = await adminHeaders()
      
      // Supprimer le profil client
      const res = await fetch(`/api/admin/clients/${clientToDelete.id}`, {
        method: 'DELETE',
        headers
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur suppression profil')
      }

      // Supprimer l'utilisateur de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(clientToDelete.user_id)
      if (authError) {
        console.warn('Erreur suppression utilisateur auth:', authError)
      }

      // Fermer le modal et rafraîchir
      setShowDeleteConfirm(false)
      setClientToDelete(null)
      await fetchClients()
      
      alert('Client supprimé avec succès !')
    } catch (error) {
      console.error('Error deleting client:', error)
      alert(`Erreur lors de la suppression: ${error.message}`)
    } finally {
      setPending(false)
    }
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setFormData({
      email: client.email || '',
      password: '',
      company_name: client.company_name || '',
      contact_name: client.contact_name || '',
      phone: client.phone || '',
      industry: client.industry || '',
      subscription_plan: client.subscription_plan || 'basic'
    })
    setShowAddClientModal(true)
  }

  const handleUpdateClient = async (e) => {
    e.preventDefault()
    if (!editingClient) return
    
    try {
      setPending(true)
      const headers = await adminHeaders()
      
      const res = await fetch(`/api/admin/clients/${editingClient.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          phone: formData.phone,
          industry: formData.industry,
          subscription_plan: formData.subscription_plan
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur mise à jour')
      }

      // Réinitialiser et fermer
      setEditingClient(null)
      setFormData({
        email: '',
        password: '',
        company_name: '',
        contact_name: '',
        phone: '',
        industry: '',
        subscription_plan: 'basic'
      })
      setShowAddClientModal(false)
      
      await fetchClients()
      alert('Client mis à jour avec succès !')
    } catch (error) {
      console.error('Error updating client:', error)
      alert(`Erreur lors de la mise à jour: ${error.message}`)
    } finally {
      setPending(false)
    }
  }

  const handleViewChange = (view) => {
    setActiveView(view)
    // Mettre à jour l'URL sans recharger la page
    router.push({
      pathname: '/admin-dashboard',
      query: { view }
    }, undefined, { shallow: true })
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      company_name: '',
      contact_name: '',
      phone: '',
      industry: '',
      subscription_plan: 'basic'
    })
    setEditingClient(null)
    setShowAddClientModal(false)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{clients.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clients Actifs</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {clients.filter(c => c.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clients Inactifs</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {clients.filter(c => !c.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Taux d'Activation</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {clients.length > 0 ? Math.round((clients.filter(c => c.is_active).length / clients.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Bienvenue sur l'interface administrateur</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Utilisez le menu de navigation pour gérer les différents aspects de la plateforme :
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span><strong>Gestion Clients :</strong> Ajouter, modifier, supprimer et activer/désactiver des comptes</span>
          </li>
          <li className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span><strong>Sécurité :</strong> Surveiller les accès et les activités</span>
          </li>
          <li className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-purple-600" />
            <span><strong>Configuration :</strong> Paramètres système et personnalisation</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Clients</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {clients.length} client{clients.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => setShowAddClientModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-soft hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Client
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <thead className="bg-slate-50/80 dark:bg-slate-700/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 dark:bg-slate-800/50 divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/80 transition-all duration-200">
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    {client.company_name}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {client.contact_name}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                    {getIndustryLabel(client.industry)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${
                      client.is_active 
                        ? 'bg-green-500 shadow-soft' 
                        : 'bg-slate-400'
                    }`}>
                      {client.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                    <button
                        onClick={() => toggleActive(client.user_id, client.is_active)}
                      disabled={pending}
                        className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${
                          client.is_active
                            ? 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                        }`}
                        title={client.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {client.is_active ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setClientToDelete(client)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen space-y-8">
      {/* Header avec navigation */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Administration
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Gestion de la plateforme Cyber Alerts
            </p>
          </div>
          
          {/* Navigation des vues */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewChange('overview')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => handleViewChange('clients')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeView === 'clients'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Gestion Clients
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <>
            {activeView === 'overview' && renderOverview()}
            {activeView === 'clients' && renderClients()}
          </>
        )}
      </div>

      {/* Modal d'ajout/édition de client */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingClient ? 'Modifier le Client' : 'Ajouter un Client'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={editingClient ? handleUpdateClient : handleAddClient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={editingClient}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                    />
                  </div>
                  
                  {!editingClient && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nom du contact *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Secteur d'activité
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Sélectionner un secteur</option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-soft hover:shadow-md disabled:opacity-50"
                  >
                    {pending ? 'Traitement...' : (editingClient ? 'Mettre à jour' : 'Ajouter')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && clientToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Confirmer la suppression
                </h2>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete.company_name}</strong> ? 
                Cette action est irréversible et supprimera également le compte utilisateur associé.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setClientToDelete(null)
                  }}
                  className="px-6 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteClient}
                  disabled={pending}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 shadow-soft hover:shadow-md disabled:opacity-50"
                >
                  {pending ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
