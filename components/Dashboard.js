import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, TrendingUp, X, ChevronLeft, ChevronRight, Eye, Activity, Target, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Dashboard = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0)
  const [dateFilter, setDateFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  })
  const itemsPerPage = 10
  const [isAdmin, setIsAdmin] = useState(false)
  const [isFiltered, setIsFiltered] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  // Reset la pagination quand le filtre de date change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer la session pour vérifier le rôle
      const { data: { session } } = await supabase.auth.getSession()
      const isAdmin = session?.user?.app_metadata?.role === 'admin'
      setIsAdmin(isAdmin)
      
      // Le dashboard général affiche TOUTES les alertes sans filtrage
      const alertsUrl = '/api/cyber-alerts'
      setIsFiltered(false)

      console.log('🔍 Fetching all alerts for general dashboard')

      const alertsRes = await fetch(alertsUrl)
      const alertsData = await alertsRes.json()

      if (!alertsRes.ok) {
        throw new Error(alertsData.error || 'Erreur lors du chargement des alertes')
      }

      const sortedAlerts = (Array.isArray(alertsData) ? alertsData : []).sort((a, b) =>
        new Date(b.published) - new Date(a.published)
      )

      console.log('📊 Alertes récupérées:', { count: sortedAlerts.length, isAdmin })
      setAlerts(sortedAlerts)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    if (!Array.isArray(data)) {
      setStats({
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      })
      return
    }

    const stats = {
      total: data.length,
      critical: data.filter(alert => alert.cvss >= 9).length,
      high: data.filter(alert => alert.cvss >= 7 && alert.cvss < 9).length,
      medium: data.filter(alert => alert.cvss >= 4 && alert.cvss < 7).length,
      low: data.filter(alert => alert.cvss < 4).length
    }
    setStats(stats)
  }

  // Fonction pour filtrer les alertes par date
  const filterAlertsByDate = (alerts, filter) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'all':
        return alerts
      case 'today':
        return alerts.filter(alert => {
          const alertDate = new Date(alert.published)
          return alertDate >= today
        })
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return alerts.filter(alert => {
          const alertDate = new Date(alert.published)
          return alertDate >= weekAgo
        })
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return alerts.filter(alert => {
          const alertDate = new Date(alert.published)
          return alertDate >= monthAgo
        })
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
        return alerts.filter(alert => {
          const alertDate = new Date(alert.published)
          return alertDate >= yearAgo
        })
      default:
        return alerts
    }
  }

  // Appliquer le filtre de date à TOUTES les alertes
  const allAlertsFilteredByDate = filterAlertsByDate(alerts, dateFilter)

  // Pagination pour le tableau principal
  const totalPages = Math.ceil(allAlertsFilteredByDate.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAlerts = allAlertsFilteredByDate.slice(startIndex, endIndex)

  // Section des alertes critiques
  const getCriticalAlerts = () => {
    return allAlertsFilteredByDate.filter(alert => alert.cvss >= 7).slice(0, 5)
  }

  // Défilement automatique des alertes critiques
  useEffect(() => {
    const criticalAlerts = getCriticalAlerts()
    if (criticalAlerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex((prevIndex) => 
          prevIndex === criticalAlerts.length - 1 ? 0 : prevIndex + 1
        )
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [alerts, dateFilter])

  // Mettre à jour les statistiques quand les alertes ou le filtre de date changent
  useEffect(() => {
    calculateStats(allAlertsFilteredByDate)
  }, [alerts, dateFilter])

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedAlert(null)
  }

  const getCvssCategory = (cvss) => {
    if (cvss >= 9) return 'Critique'
    if (cvss >= 7) return 'Élevé'
    if (cvss >= 4) return 'Moyen'
    return 'Faible'
  }

  const getCvssGradient = (cvss) => {
    if (cvss >= 9) return 'from-red-500 to-red-600'
    if (cvss >= 7) return 'from-orange-500 to-orange-600'
    if (cvss >= 4) return 'from-yellow-500 to-yellow-600'
    return 'from-green-500 to-green-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Header avec titre et filtres */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Dashboard Cybersécurité
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Surveillance en temps réel des menaces et vulnérabilités
            </p>
            
            {/* Indicateur de statut */}
            <div className="flex items-center space-x-4 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isAdmin 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
              }`}>
                {isAdmin ? '👑 Administrateur' : '👤 Client'}
              </span>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                📊 Dashboard Général - Toutes les alertes
              </span>
            </div>
          </div>
          
          {/* Filtres de date */}
          <div className="flex space-x-2">
            {['all', 'today', 'week', 'month', 'year'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  dateFilter === filter
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter === 'all' && 'Toutes les périodes'}
                {filter === 'today' && 'Aujourd\'hui'}
                {filter === 'week' && '7 jours'}
                {filter === 'month' && '30 jours'}
                {filter === 'year' && '1 an'}
              </button>
            ))}
          </div>
        </div>
        </div>

      {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Alertes</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Critiques</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Élevées</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.high}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Moyennes</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.medium}</p>
              </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Faibles</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.low}</p>
              </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

      {/* Section des alertes critiques avec carrousel */}
      {getCriticalAlerts().length > 0 && (
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8" />
              <span>Alertes Critiques</span>
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentAlertIndex(Math.max(0, currentAlertIndex - 1))}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentAlertIndex(Math.min(getCriticalAlerts().length - 1, currentAlertIndex + 1))}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              </div>
            </div>
          
          <div className="relative overflow-hidden">
                {getCriticalAlerts().map((alert, index) => (
                  <div 
                    key={alert.id} 
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all duration-500 ${
                      index === currentAlertIndex ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute inset-0 transform translate-x-full'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className="text-white font-bold text-2xl">{alert.cvss}</span>
                      <span className="text-red-100 text-sm">CVSS</span>
                        </div>
                        <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-lg">
                        {alert.summary.length > 80 ? alert.summary.substring(0, 80) + '...' : alert.summary}
                      </p>
                      <p className="text-red-100 text-sm mt-2">
                        {new Date(alert.published).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(alert)}
                    className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex-shrink-0 ml-4"
                      >
                    <Eye className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Indicateurs de navigation */}
            <div className="flex justify-center space-x-2 mt-4">
                    {getCriticalAlerts().map((_, index) => (
                <button
                        key={index}
                  onClick={() => setCurrentAlertIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentAlertIndex ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
              </div>
              </div>
            )}

      {/* Tableau des alertes avec design amélioré */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            <span>Toutes les Alertes</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Vue d'ensemble de toutes les alertes de cybersécurité
          </p>
          </div>
          
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <thead className="bg-slate-50/80 dark:bg-slate-700/80">
                <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Source
                  </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Résumé
                  </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  CVSS
                  </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Sévérité
                  </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                  </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white/50 dark:bg-slate-800/50 divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {currentAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/80 transition-all duration-200">
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                    {alert.source ? (
                      <a 
                        href={alert.source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-colors"
                        title={alert.source}
                      >
                        🔗 Voir la source
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Aucune source</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-900 dark:text-white max-w-xs truncate">
                      {alert.summary}
                    </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                      <span
                      className={`px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r ${getCvssGradient(alert.cvss)} shadow-soft`}
                      >
                        {alert.cvss}
                      </span>
                    </td>
                  <td className="px-6 py-6 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {getCvssCategory(alert.cvss)}
                    </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(alert.published).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(alert)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-soft hover:shadow-md"
                      >
                      <Eye className="h-4 w-4 mr-2" />
                        Voir plus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Pagination améliorée */}
          {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700 dark:text-slate-300">
                Page {currentPage} sur {totalPages} ({allAlertsFilteredByDate.length} alertes)
                </div>
              <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Modal de détails amélioré */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Détails de l'Alerte
                </h2>
              <button
                onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                  <X className="h-6 w-6" />
              </button>
            </div>
            
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Résumé</h3>
                  <p className="text-slate-700 dark:text-slate-300">{selectedAlert.summary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Score CVSS</h3>
                    <span className={`px-3 py-2 text-lg font-bold rounded-xl text-white bg-gradient-to-r ${getCvssGradient(selectedAlert.cvss)}`}>
                      {selectedAlert.cvss}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sévérité</h3>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {getCvssCategory(selectedAlert.cvss)}
                    </p>
                  </div>
                </div>
                
                                 <div>
                   <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date de Publication</h3>
                   <p className="text-slate-700 dark:text-slate-300">
                     {new Date(selectedAlert.published).toLocaleDateString('fr-FR', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
                   </p>
                 </div>
                 
                 {selectedAlert.source && (
                   <div>
                     <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Source</h3>
                     <a 
                       href={selectedAlert.source} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-colors"
                     >
                       {selectedAlert.source}
                     </a>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard



