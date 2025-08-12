import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Endpoint d'administration pour gérer les clients
// GET    /api/admin/clients        -> liste des clients
// PUT    /api/admin/clients        -> maj is_active (body: { user_id, is_active })

export default async function handler(req, res) {
  const supabaseFromCookies = createPagesServerClient({ req, res })
  const { data: { user } } = await supabaseFromCookies.auth.getUser()

  // Vérification minimale: exiger un header secret admin ou rôle custom
  const adminSecret = req.headers['x-admin-secret']
  const expected = process.env.ADMIN_API_SECRET
  if (!user || !adminSecret || expected !== adminSecret) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    const { user_id, is_active } = req.body || {}
    if (!user_id || typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'user_id et is_active sont requis' })
    }
    const { data, error } = await supabase
      .from('client_profiles')
      .update({ is_active })
      .eq('user_id', user_id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  res.setHeader('Allow', ['GET', 'PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}


