import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { supabase } from '../lib/supabase'
import { Shield, AlertTriangle, TrendingUp, Database, Target, CheckCircle, XCircle, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'

const PersonalizedDashboard = () => {
  const [iocs, setIocs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [personalizedAlerts, setPersonalizedAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState('today') // 'today', 'week', 'month', 'year'
  const [stats, setStats] = useState({
    totalIOCs: 0,
    totalAlerts: 0,
    relevantAlerts: 0,
    industryRelevant: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    criticalHigh: 0,
    relevanceRate: 0
  })
  
  const itemsPerPage = 5
  const [userIndustry, setUserIndustry] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Reset la pagination quand le filtre de date change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateFilter])

  // Fonction utilitaire pour créer les headers d'authentification
  const getAuthHeaders = async () => {
    const headers = {
      'Content-Type': 'application/json',
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    return headers
  }

  // Récupérer l'industrie de l'utilisateur depuis son profil
  const fetchUserIndustry = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('client_profiles')
          .select('industry')
          .eq('user_id', session.user.id)
          .maybeSingle()
        
        if (!error && profile) {
          setUserIndustry(profile.industry)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'industrie:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer d'abord l'industrie de l'utilisateur
      await fetchUserIndustry()
      
      const authHeaders = await getAuthHeaders()
      
      // Récupérer TOUTES les alertes pour le filtrage côté client
      // Le filtrage par IOCs et industrie se fait dans analyzeRelevantAlerts
      const alertsUrl = '/api/cyber-alerts'
      
      console.log('🔍 Personalized Dashboard - Fetching data...')
      
      const [iocsResponse, alertsResponse] = await Promise.all([
        fetch('/api/iocs', { headers: authHeaders, credentials: 'same-origin' }),
        fetch(alertsUrl)
      ])

      const iocsData = await iocsResponse.json()
      const alertsData = await alertsResponse.json()

      console.log('📊 Data fetched:', { 
        iocsCount: iocsData?.length || 0, 
        alertsCount: alertsData?.length || 0,
        userIndustry 
      })

      // Trier les alertes par date de publication décroissante (plus récentes en premier)
      const sortedAlerts = (alertsData || []).sort((a, b) => 
        new Date(b.published) - new Date(a.published)
      )

      setIocs(iocsData || [])
      setAlerts(sortedAlerts)

      // Analyser les alertes pertinentes avec filtrage IOCs + Industrie
      const relevant = analyzeRelevantAlerts(iocsData || [], sortedAlerts)
      setPersonalizedAlerts(relevant)
      
      console.log('🎯 Relevant alerts found:', relevant.length)
      
      calculateStats(iocsData || [], sortedAlerts, relevant)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour les données quand l'industrie change
  useEffect(() => {
    if (userIndustry !== null) {
      fetchData()
    }
  }, [userIndustry])

  const analyzeRelevantAlerts = (iocsData, alertsData) => {
    if (!iocsData.length || !alertsData.length) return []

    const relevantAlerts = []
    const keywords = extractKeywords(iocsData)

    // Mappage des industries vers leurs mots-clés pertinents
    const industryKeywords = {
      'healthcare': ['healthcare', 'medical', 'hospital', 'pharmaceutical', 'patient', 'clinical', 'HIPAA', 'FDA', 'santé', 'médical', 'hôpital', 'patient', 'médecin', 'soins'],
      'finance': ['finance', 'banking', 'financial', 'payment', 'credit', 'investment', 'PCI-DSS', 'SOX', 'banque', 'paiement', 'crédit', 'investissement', 'bancaire'],
      'technology': ['technology', 'software', 'IT', 'cloud', 'cybersecurity', 'digital', 'AI', 'machine learning', 'technologie', 'logiciel', 'informatique', 'cybersécurité'],
      'retail': ['retail', 'e-commerce', 'POS', 'payment', 'inventory', 'customer', 'PCI-DSS', 'commerce', 'e-commerce', 'point de vente', 'client', 'magasin'],
      'manufacturing': ['manufacturing', 'industrial', 'SCADA', 'OT', 'production', 'factory', 'IoT', 'manufacturing', 'industriel', 'production', 'usine'],
      'government': ['government', 'public sector', 'federal', 'state', 'municipal', 'defense', 'classified', 'gouvernement', 'secteur public', 'fédéral', 'défense'],
      'education': ['education', 'university', 'school', 'student', 'academic', 'research', 'FERPA', 'éducation', 'université', 'école', 'étudiant', 'académique'],
      'energy': ['energy', 'utilities', 'power', 'grid', 'SCADA', 'nuclear', 'renewable', 'énergie', 'électricité', 'réseau', 'nucléaire', 'renouvelable'],
      'transportation': ['transportation', 'logistics', 'aviation', 'railway', 'maritime', 'fleet', 'GPS', 'transport', 'logistique', 'aviation', 'ferroviaire', 'maritime'],
      'telecommunications': ['telecom', 'network', 'ISP', 'mobile', '5G', 'fiber', 'routing', 'télécommunications', 'réseau', 'mobile', 'fibre', 'routage']
    }

    alertsData.forEach(alert => {
      const { score, matchedKeywords } = calculateRelevanceScore(alert, keywords, iocsData)
      
      // Bonus pour la correspondance d'industrie
      let industryBonus = 0
      let industryMatched = false
      
      if (userIndustry && alert.summary) {
        const alertText = alert.summary.toLowerCase()
        const industryKey = userIndustry.toLowerCase()
        
        // Vérifier si l'industrie de l'utilisateur a des mots-clés spécifiques
        if (industryKeywords[industryKey]) {
          const keywords = industryKeywords[industryKey]
          const matchedIndustryKeywords = keywords.filter(keyword => 
            alertText.includes(keyword.toLowerCase())
          )
          
          if (matchedIndustryKeywords.length > 0) {
            industryBonus = 5 // Bonus de 5 points pour la pertinence d'industrie
            industryMatched = true
            console.log('🏭 Industry match:', { industry: userIndustry, keywords: matchedIndustryKeywords })
          }
        }
        
        // Vérification directe du nom de l'industrie
        if (!industryMatched && alertText.includes(industryKey)) {
          industryBonus = 3
          industryMatched = true
        }
      }
      
      const finalScore = score + industryBonus
      
      // Seuil plus flexible : au moins une correspondance avec un score minimum
      if (finalScore >= 5 && (matchedKeywords.length > 0 || industryMatched)) {
        relevantAlerts.push({
          ...alert,
          relevanceScore: finalScore,
          matchedKeywords: matchedKeywords,
          industryRelevant: industryMatched,
          industryBonus: industryBonus
        })
      }
    })

    // Trier d'abord par score de pertinence, puis par date de publication (plus récentes en premier)
    return relevantAlerts.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return new Date(b.published) - new Date(a.published)
    })
  }

  const extractKeywords = (iocsData) => {
    const keywords = {
      ips: [],
      servers: [],
      os: [],
      security: []
    }

    iocsData.forEach(ioc => {
      if (ioc.ip) keywords.ips.push(ioc.ip.toLowerCase())
      if (ioc.server) keywords.servers.push(ioc.server.toLowerCase())
      if (ioc.os) {
        const osKeywords = ioc.os.toLowerCase().split(/[,\s]+/)
        keywords.os.push(...osKeywords)
      }
      if (ioc.security_solutions) {
        const securityKeywords = ioc.security_solutions.toLowerCase().split(/[,\s]+/)
        keywords.security.push(...securityKeywords)
      }
    })

    return keywords
  }

  const calculateRelevanceScore = (alert, keywords, iocsData) => {
    let score = 0
    const matchedKeywords = []
    const alertText = `${alert.summary} ${alert.description || ''}`.toLowerCase()

    // Correspondance IP (score élevé car très spécifique)
    keywords.ips.forEach(ip => {
      if (alertText.includes(ip.toLowerCase())) {
        score += 15
        matchedKeywords.push({ category: 'IP', word: ip })
      }
    })

    // Correspondance Serveur (score élevé)
    keywords.servers.forEach(server => {
      if (alertText.includes(server.toLowerCase())) {
        score += 12
        matchedKeywords.push({ category: 'Server', word: server })
      }
    })

    // Correspondance OS (score moyen)
    keywords.os.forEach(os => {
      if (os.length > 2 && alertText.includes(os.toLowerCase())) {
        score += 8
        matchedKeywords.push({ category: 'OS', word: os })
      }
    })

    // Correspondance Solutions de sécurité (score moyen)
    keywords.security.forEach(security => {
      if (security.length > 2 && alertText.includes(security.toLowerCase())) {
        score += 6
        matchedKeywords.push({ category: 'Security', word: security })
      }
    })

    // Bonus pour la sévérité CVSS
    if (alert.cvss >= 9) score += 5
    else if (alert.cvss >= 7) score += 3
    else if (alert.cvss >= 4) score += 1

    return { score, matchedKeywords }
  }



  const calculateStats = (iocsData, alertsData, relevantAlerts) => {
    const critical = relevantAlerts.filter(alert => alert.cvss >= 9).length
    const high = relevantAlerts.filter(alert => alert.cvss >= 7 && alert.cvss < 9).length
    const medium = relevantAlerts.filter(alert => alert.cvss >= 4 && alert.cvss < 7).length
    const low = relevantAlerts.filter(alert => alert.cvss < 4).length
    
    // Calculer le taux de pertinence (pourcentage d'alertes pertinentes par rapport au total)
    const relevanceRate = alertsData.length > 0 ? Math.round((relevantAlerts.length / alertsData.length) * 100) : 0
    
    const stats = {
      totalIOCs: iocsData.length,
      totalAlerts: alertsData.length,
      relevantAlerts: relevantAlerts.length,
      industryRelevant: relevantAlerts.filter(alert => alert.industryRelevant).length,
      critical: critical,
      high: high,
      medium: medium,
      low: low,
      criticalHigh: critical + high, // Critiques + Élevées combinées
      relevanceRate: relevanceRate
    }
    setStats(stats)
  }

  const getCvssCategory = (cvss) => {
    if (cvss >= 9) return 'Critique'
    if (cvss >= 7) return 'Élevé'
    if (cvss >= 4) return 'Moyen'
    return 'Faible'
  }

  const getCvssColor = (cvss) => {
    if (cvss >= 9) return '#dc2626'
    if (cvss >= 7) return '#ea580c'
    if (cvss >= 4) return '#d97706'
    return '#65a30d'
  }

  const getRelevanceColor = (score) => {
    if (score >= 15) return '#dc2626'
    if (score >= 10) return '#ea580c'
    if (score >= 5) return '#d97706'
    return '#65a30d'
  }

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedAlert(null)
  }

  // Fonction pour filtrer les alertes par date
  const filterAlertsByDate = (alerts, filter) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
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

  // Appliquer le filtre de date aux alertes personnalisées
  const dateFilteredPersonalizedAlerts = filterAlertsByDate(personalizedAlerts, dateFilter)

  // Pagination
  const totalPages = Math.ceil(dateFilteredPersonalizedAlerts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAlerts = dateFilteredPersonalizedAlerts.slice(startIndex, endIndex)

  const relevanceData = [
    ...(stats.critical > 0 ? [{ name: 'Critique', value: stats.critical, color: '#dc2626' }] : []),
    ...(stats.high > 0 ? [{ name: 'Élevé', value: stats.high, color: '#ea580c' }] : []),
    ...(stats.medium > 0 ? [{ name: 'Moyen', value: stats.medium, color: '#d97706' }] : []),
    ...(stats.low > 0 ? [{ name: 'Faible', value: stats.low, color: '#65a30d' }] : [])
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Analyse de vos vulnérabilités personnalisées...</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
        </div>
      </div>

      {/* Modal de détails */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getCvssColor(selectedAlert.cvss) }}></div>
                <h2 className="text-xl font-bold text-gray-900">Détails de la Vulnérabilité</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">Score CVSS:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white`} style={{ backgroundColor: getCvssColor(selectedAlert.cvss) }}>
                    {selectedAlert.cvss}
                  </span>
                  <span className="text-sm text-gray-600">({getCvssCategory(selectedAlert.cvss)})</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de publication:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {new Date(selectedAlert.published).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Résumé:</span>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedAlert.summary}</p>
                </div>
                
                {selectedAlert.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedAlert.description}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Correspondances trouvées:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAlert.matchedKeywords.map((match, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {match.word} ({match.category})
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Score de pertinence:</span>
                  <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full text-white`} style={{ backgroundColor: getRelevanceColor(selectedAlert.relevanceScore) }}>
                    {selectedAlert.relevanceScore}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-dark-700">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
            <Target className="h-8 w-8 animate-bounce" />
            <h1 className="text-3xl font-bold">Dashboard Personnalisé</h1>
          </div>
          
          {/* Indicateurs de filtrage */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              🎯 Filtrage par IOCs ({iocs.length} IOCs configurés)
            </span>
            
            {userIndustry && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                🏭 Filtrage par industrie: {userIndustry}
              </span>
            )}
            
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
              📊 {personalizedAlerts.length} alertes pertinentes trouvées
            </span>
          </div>
          
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
            Alertes filtrées selon vos IOCs et votre secteur d'activité
          </p>
        </div>

        {/* Stats Cards avec animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IOCs Configurés</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalIOCs}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vulnérabilités Pertinentes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.relevantAlerts}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pertinentes à l'Industrie</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.industryRelevant}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critiques/Élevées</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.criticalHigh}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid avec styles modernes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
              Vulnérabilités Pertinentes par Sévérité
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relevanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {relevanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
              Top Vulnérabilités par Pertinence
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={personalizedAlerts.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="relevanceScore" fill="url(#personalizedGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="personalizedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau avec styles modernes */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full mr-3"></div>
                Vulnérabilités Pertinentes ({dateFilteredPersonalizedAlerts.length})
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  (Triées par pertinence puis date)
                </span>
              </h3>
              
              {/* Sélecteur de période */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Période :
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="year">12 derniers mois</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pertinence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Résumé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score CVSS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sévérité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correspondances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {currentAlerts.length > 0 ? (
                  currentAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ backgroundColor: getRelevanceColor(alert.relevanceScore) }}
                        >
                          {alert.relevanceScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {alert.summary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ backgroundColor: getCvssColor(alert.cvss) }}
                        >
                          {alert.cvss}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {getCvssCategory(alert.cvss)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {alert.matchedKeywords.slice(0, 3).map((match, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {match.word}
                            </span>
                          ))}
                          {alert.matchedKeywords.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{alert.matchedKeywords.length - 3}
                            </span>
                          )}
                          {alert.industryRelevant && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                              🏭 Industrie
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(alert.published).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(alert)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir plus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {stats.totalIOCs === 0 ? (
                        <div className="flex flex-col items-center py-8">
                          <XCircle className="h-12 w-12 text-gray-400 mb-4" />
                          <p>Aucun IOC configuré</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Configurez vos IOCs pour voir les vulnérabilités pertinentes
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                          <p>Aucune vulnérabilité pertinente trouvée</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Vos IOCs ne correspondent à aucune vulnérabilité récente
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Affichage {startIndex + 1}-{Math.min(endIndex, dateFilteredPersonalizedAlerts.length)} sur {dateFilteredPersonalizedAlerts.length} résultats
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getCvssColor(selectedAlert.cvss) }}></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails de la Vulnérabilité</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">Score CVSS:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full text-white`} style={{ backgroundColor: getCvssColor(selectedAlert.cvss) }}>
                    {selectedAlert.cvss}
                  </span>
                  <span className="text-sm text-gray-600">({getCvssCategory(selectedAlert.cvss)})</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Date de publication:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedAlert.published).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Résumé:</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedAlert.summary}</p>
                </div>
                
                {selectedAlert.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedAlert.description}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Correspondances trouvées:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAlert.matchedKeywords.map((match, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {match.word} ({match.category})
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Score de pertinence:</span>
                  <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full text-white`} style={{ backgroundColor: getRelevanceColor(selectedAlert.relevanceScore) }}>
                    {selectedAlert.relevanceScore}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonalizedDashboard 