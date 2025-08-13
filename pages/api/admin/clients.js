import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Endpoint d'administration pour gérer les clients
// GET    /api/admin/clients        -> liste des clients
// POST   /api/admin/clients        -> créer un nouveau client
// PUT    /api/admin/clients        -> maj is_active (body: { user_id, is_active })
// DELETE /api/admin/clients/[id]   -> supprimer un client

export default async function handler(req, res) {
  // 1) Try to authenticate via Bearer token header (SPA calling with Authorization)
  let user = null
  const authHeader = req.headers.authorization || ''
  if (authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const authKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !authKey) {
      return res.status(500).json({ error: 'Configuration Supabase manquante (URL ou clé). Vérifiez vos variables d\'environnement.' })
    }
    const supabaseForAuth = createClient(supabaseUrl, authKey)
    const { data, error } = await supabaseForAuth.auth.getUser(accessToken)
    if (!error) {
      user = data?.user || null
    }
  }

  // 2) Fallback to cookie-based session (SSR/Route handlers)
  if (!user) {
    const supabaseFromCookies = createPagesServerClient({ req, res })
    const { data } = await supabaseFromCookies.auth.getUser()
    user = data?.user || null
  }

  const isAdmin = user?.app_metadata?.role === 'admin'
  if (!user || !isAdmin) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  // Utiliser la clé service role côté serveur pour bypass RLS en toute sécurité
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    try {
      const { user_id, company_name, contact_name, phone, industry, subscription_plan, is_active } = req.body

      // Validation des données requises
      if (!user_id || !company_name || !contact_name) {
        return res.status(400).json({ 
          error: 'user_id, company_name et contact_name sont requis' 
        })
      }

      // Créer le profil client
      const { data, error } = await supabase
        .from('client_profiles')
        .insert([{
          user_id,
          company_name,
          contact_name,
          phone: phone || null,
          industry: industry || null,
          subscription_plan: subscription_plan || 'basic',
          is_active: is_active !== undefined ? is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la création du profil:', error)
        return res.status(500).json({ 
          error: 'Erreur lors de la création du profil client',
          details: error.message 
        })
      }

      res.status(201).json(data)
    } catch (error) {
      console.error('Erreur serveur:', error)
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error.message 
      })
    }
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

  res.setHeader('Allow', ['GET', 'POST', 'PUT'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}


