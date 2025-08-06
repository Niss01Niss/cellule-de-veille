import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { Shield, AlertTriangle, TrendingUp, Database } from 'lucide-react'

const Dashboard = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/cyber-alerts')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Vérifier que data est un tableau
      if (Array.isArray(data)) {
        setAlerts(data)
        calculateStats(data)
      } else {
        console.error('Les données reçues ne sont pas un tableau:', data)
        setAlerts([]) // Initialiser avec un tableau vide
        calculateStats([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
      setAlerts([]) // Initialiser avec un tableau vide en cas d'erreur
      calculateStats([])
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    // Vérifier que data est un tableau
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

  // Données pour le graphique CVSS par catégorie
  const cvssData = [
    { name: 'Critique', value: stats.critical, color: '#dc2626' },
    { name: 'Élevé', value: stats.high, color: '#ea580c' },
    { name: 'Moyen', value: stats.medium, color: '#d97706' },
    { name: 'Faible', value: stats.low, color: '#65a30d' }
  ]

  // Données pour le graphique temporel
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

  // Données pour le graphique en barres des scores CVSS
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500" />
            Dashboard Cyber Alerts
          </h1>
          <p className="text-gray-600 mt-2">Surveillance et analyse des alertes de sécurité</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alertes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critique</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Élevé</p>
                <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-full" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Moyen</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Faible</p>
                <p className="text-2xl font-bold text-green-600">{stats.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart - Répartition CVSS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Sévérité CVSS</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cvssData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cvssData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Distribution CVSS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des Scores CVSS</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCvssDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution Temporelle des Alertes</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={getTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Nombre d'alertes"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgCvss"
                stroke="#dc2626"
                strokeWidth={2}
                name="CVSS moyen"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Alertes Récentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
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
                    Date de Publication
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(alerts) && alerts.slice(0, 10).map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCvssCategory(alert.cvss)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.published).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
                {(!Array.isArray(alerts) || alerts.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Aucune alerte disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
