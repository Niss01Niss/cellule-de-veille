import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

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

  const view = router.query.view || 'overview'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        {loading ? (
          <div className="p-6 bg-white rounded-xl border border-gray-200">Chargement...</div>
        ) : view === 'clients' ? (
          <table className="min-w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Secteur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 font-medium">{client.company_name}</td>
                  <td className="px-6 py-3 text-gray-700">{client.contact_name}</td>
                  <td className="px-6 py-3 text-gray-700">{client.industry || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full text-white ${client.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                      {client.is_active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      disabled={pending}
                      className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      onClick={() => toggleActive(client.user_id, client.is_active)}
                    >
                      {client.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-600">Bienvenue sur l’interface admin. Utilisez le menu “Gestion Clients” pour activer/désactiver des comptes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
