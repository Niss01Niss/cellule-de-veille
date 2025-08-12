import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function AdminDashboard() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchClients()
    }
  }, [user])

  const adminHeaders = async () => {
    return {
      'Content-Type': 'application/json',
      'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_API_SECRET || ''
    }
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <table className="table-auto w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Entreprise</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Secteur</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="border px-4 py-2">{client.company_name}</td>
                  <td className="border px-4 py-2">{client.contact_name}</td>
                  <td className="border px-4 py-2">{client.industry || '-'}</td>
                  <td className="border px-4 py-2">{client.is_active ? 'Oui' : 'Non'}</td>
                  <td className="border px-4 py-2">
                    <button
                      disabled={pending}
                      className="bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded"
                      onClick={() => toggleActive(client.user_id, client.is_active)}
                    >
                      {client.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
