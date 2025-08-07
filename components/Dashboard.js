import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { Shield, AlertTriangle, TrendingUp, Database, X, ChevronLeft, ChevronRight, Eye, Clock, Zap } from 'lucide-react'

// --- LOGIQUE DE FILTRAGE IOCs ---
function extractKeywords(iocsData) {
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
      const osKeywords = ioc.os.toLowerCase().split(/[\s,]+/)
      keywords.os.push(...osKeywords)
    }
    if (ioc.security_solutions) {
      const securityKeywords = ioc.security_solutions.toLowerCase().split(/[\s,]+/)
      keywords.security.push(...securityKeywords)
    }
  })
  return keywords
}
function calculateRelevanceScore(alert, keywords) {
  let score = 0
  const alertText = `${alert.summary} ${alert.description || ''}`.toLowerCase()
  keywords.ips.forEach(ip => { if (alertText.includes(ip)) score += 10 })
  keywords.servers.forEach(server => { if (alertText.includes(server)) score += 8 })
  keywords.os.forEach(os => { if (alertText.includes(os)) score += 6 })
  keywords.security.forEach(security => { if (alertText.includes(security)) score += 4 })
  if (alert.cvss >= 9) score += 5
  else if (alert.cvss >= 7) score += 3
  else if (alert.cvss >= 4) score += 1
  return score
}
function filterAlertsByIocs(alerts, iocs) {
  if (!iocs.length) return []
  const keywords = extractKeywords(iocs)
  return alerts
    .map(alert => ({ ...alert, relevanceScore: calculateRelevanceScore(alert, keywords) }))
    .filter(alert => alert.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
}
// --- FIN LOGIQUE DE FILTRAGE IOCs ---

const Dashboard = () => {
  const [alerts, setAlerts] = useState([])
  const [iocs, setIocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  })
  const itemsPerPage = 10

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [alertsRes, iocsRes] = await Promise.all([
        fetch('/api/cyber-alerts'),
        fetch('/api/iocs')
      ])
      const alertsData = await alertsRes.json()
      const iocsData = await iocsRes.json()
      setIocs(iocsData || [])
      setAlerts(alertsData || [])
      calculateStats(alertsData || [])
      setLoading(false)
    } catch (error) {
      setAlerts([])
      setIocs([])
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

  const getCvssGradient = (cvss) => {
    if (cvss >= 9) return 'from-red-500 to-red-600'
    if (cvss >= 7) return 'from-orange-500 to-orange-600'
    if (cvss >= 4) return 'from-yellow-500 to-yellow-600'
    return 'from-green-500 to-green-600'
  }

  const cvssData = [
    { name: 'Critique', value: stats.critical, color: '#dc2626' },
    { name: 'Élevé', value: stats.high, color: '#ea580c' },
    { name: 'Moyen', value: stats.medium, color: '#d97706' },
    { name: 'Faible', value: stats.low, color: '#65a30d' }
  ]

  const getTimelineData = () => {
    if (!Array.isArray(alerts) || alerts.length === 0) {
      return []
    }
    const timeline = {}
    alerts.forEach(alert => {
      const date = new Date(alert.published).toLocaleDateString()
      if (!timeline[date]) {
        timeline[date] = { date, count: 0, avgCvss: 0, totalCvss: 0 }
      }
      timeline[date].count++
      timeline[date].totalCvss += alert.cvss
      timeline[date].avgCvss = timeline[date].totalCvss / timeline[date].count
    })
    return Object.values(timeline).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getCvssDistribution = () => {
    if (!Array.isArray(alerts) || alerts.length === 0) {
      return []
    }
    const distribution = {}
    alerts.forEach(alert => {
      const score = Math.floor(alert.cvss)
      if (!distribution[score]) {
        distribution[score] = { score: score.toString(), count: 0 }
      }
      distribution[score].count++
    })
    return Object.values(distribution).sort((a, b) => a.score - b.score)
  }

  // Remplace toutes les utilisations de alerts par filteredAlerts
  const filteredAlerts = filterAlertsByIocs(alerts, iocs)

  // Pagination sur filteredAlerts
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAlerts = filteredAlerts.slice(startIndex, endIndex)

  // Section alertes critiques filtrée
  const getCriticalAlerts = () => {
    return filteredAlerts.filter(alert => alert.cvss >= 9).slice(0, 5)
  }

  // Défilement automatique des alertes critiques
  useEffect(() => {
    const criticalAlerts = getCriticalAlerts()
    if (criticalAlerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex((prevIndex) => 
          prevIndex === criticalAlerts.length - 1 ? 0 : prevIndex + 1
        )
      }, 3000) // Change toutes les 3 secondes

      return () => clearInterval(interval)
    }
  }, [alerts])

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedAlert(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Chargement des données...</p>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
            <Shield className="h-8 w-8 animate-bounce" />
            <h1 className="text-3xl font-bold">Dashboard Cyber Alerts</h1>
          </div>
          <p className="text-gray-600 mt-4 text-lg">Surveillance et analyse des alertes de sécurité en temps réel</p>
        </div>

        {/* Stats Cards avec animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <Database className="h-10 w-10 text-white" />
              <div className="ml-4">
                <p className="text-blue-100 text-sm font-medium">Total Alertes</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <AlertTriangle className="h-10 w-10 text-white" />
              <div className="ml-4">
                <p className="text-red-100 text-sm font-medium">Critique</p>
                <p className="text-3xl font-bold text-white">{stats.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <TrendingUp className="h-10 w-10 text-white" />
              <div className="ml-4">
                <p className="text-orange-100 text-sm font-medium">Élevé</p>
                <p className="text-3xl font-bold text-white">{stats.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">!</span>
              </div>
              <div className="ml-4">
                <p className="text-yellow-100 text-sm font-medium">Moyen</p>
                <p className="text-3xl font-bold text-white">{stats.medium}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-green-100 text-sm font-medium">Faible</p>
                <p className="text-3xl font-bold text-white">{stats.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes critiques défilantes - Section compacte */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-3 bg-red-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
                <h2 className="text-lg font-bold text-white">Alertes Critiques</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-200" />
                <span className="text-red-200 text-sm">Temps réel</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {getCriticalAlerts().length > 0 ? (
              <div className="relative">
                {getCriticalAlerts().map((alert, index) => (
                  <div 
                    key={alert.id} 
                    className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-500 ${
                      index === currentAlertIndex ? 'opacity-100 transform translate-x-0' : 'opacity-0 absolute inset-0 transform translate-x-full'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-white font-bold text-lg">{alert.cvss}</span>
                          <span className="text-red-200 text-xs">CVSS</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">
                            {alert.summary.length > 60 ? alert.summary.substring(0, 60) + '...' : alert.summary}
                          </p>
                          <p className="text-red-200 text-xs mt-1">
                            {new Date(alert.published).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(alert)}
                        className="p-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors flex-shrink-0 ml-3"
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Indicateurs de navigation */}
                {getCriticalAlerts().length > 1 && (
                  <div className="flex justify-center space-x-2 mt-3">
                    {getCriticalAlerts().map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentAlertIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Shield className="h-8 w-8 text-white/50 mx-auto mb-2" />
                <p className="text-white/70 text-sm">Aucune alerte critique</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid avec styles modernes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
              Répartition par Sévérité CVSS
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cvssData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cvssData.map((entry, index) => (
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
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
              Distribution des Scores CVSS
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCvssDistribution()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Chart moderne */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
            Évolution Temporelle des Alertes
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={getTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fill="url(#areaGradient)"
                fillOpacity={0.3}
                name="Nombre d'alertes"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgCvss"
                stroke="#dc2626"
                strokeWidth={3}
                name="CVSS moyen"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tableau avec pagination moderne */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
              Alertes Récentes
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Résumé
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Score CVSS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sévérité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date de Publication
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{alert.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {alert.summary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full text-white bg-gradient-to-r ${getCvssGradient(alert.cvss)}`}
                      >
                        {alert.cvss}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCvssCategory(alert.cvss)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.published).toLocaleDateString('fr-FR')}
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
                ))}
                {currentAlerts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Shield className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Aucune alerte disponible</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination moderne */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAlerts.length)} sur {filteredAlerts.length} résultats
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getCvssGradient(selectedAlert.cvss)}`}>
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Détails de l'Alerte</h2>
                  <p className="text-sm text-gray-500">ID: #{selectedAlert.id}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Score CVSS</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 text-lg font-bold rounded-lg text-white bg-gradient-to-r ${getCvssGradient(selectedAlert.cvss)}`}>
                      {selectedAlert.cvss}
                    </span>
                    <span className="text-gray-600">{getCvssCategory(selectedAlert.cvss)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Date de Publication</h3>
                  <p className="text-gray-600">
                    {new Date(selectedAlert.published).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Résumé</h3>
                <p className="text-gray-700 leading-relaxed">{selectedAlert.summary}</p>
              </div>
              
              {selectedAlert.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedAlert.description}</p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommandations</h3>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Mettre à jour les systèmes affectés vers les dernières versions
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Appliquer les patches de sécurité disponibles
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Surveiller les logs pour détecter toute activité suspecte
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fermer
                </button>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Marquer comme lue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
