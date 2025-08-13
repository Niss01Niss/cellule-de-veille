import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Endpoint pour les opérations sur un client spécifique
// GET    /api/admin/clients/[id] -> obtenir un client
// PUT    /api/admin/clients/[id] -> mettre à jour un client
// DELETE /api/admin/clients/[id] -> supprimer un client

export default async function handler(req, res) {
  const { id } = req.query

  // 1) Try to authenticate via Bearer token header
  let user = null
  const authHeader = req.headers.authorization || ''
  if (authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const authKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !authKey) {
      return res.status(500).json({ error: 'Configuration Supabase manquante' })
    }
    const supabaseForAuth = createClient(supabaseUrl, authKey)
    const { data, error } = await supabaseForAuth.auth.getUser(accessToken)
    if (!error) {
      user = data?.user || null
    }
  }

  // 2) Fallback to cookie-based session
  if (!user) {
    const supabaseFromCookies = createPagesServerClient({ req, res })
    const { data } = await supabaseFromCookies.auth.getUser()
    user = data?.user || null
  }

  const isAdmin = user?.app_metadata?.role === 'admin'
  if (!user || !isAdmin) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  // Utiliser la clé service role côté serveur
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Client non trouvé' })
        }
        return res.status(500).json({ error: error.message })
      }

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { company_name, contact_name, phone, industry, subscription_plan } = req.body

      // Validation des données requises
      if (!company_name || !contact_name) {
        return res.status(400).json({ 
          error: 'company_name et contact_name sont requis' 
        })
      }

      // Mettre à jour le profil client
      const { data, error } = await supabase
        .from('client_profiles')
        .update({
          company_name,
          contact_name,
          phone: phone || null,
          industry: industry || null,
          subscription_plan: subscription_plan || 'basic',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Client non trouvé' })
        }
        return res.status(500).json({ error: error.message })
      }

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Récupérer d'abord le client pour obtenir user_id
      const { data: client, error: fetchError } = await supabase
        .from('client_profiles')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Client non trouvé' })
        }
        return res.status(500).json({ error: fetchError.message })
      }

      // Supprimer le profil client
      const { error: deleteError } = await supabase
        .from('client_profiles')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message })
      }

      // Note: La suppression de l'utilisateur Supabase Auth se fait côté client
      // car nous avons besoin de la clé service role pour cela

      res.status(200).json({ message: 'Client supprimé avec succès', user_id: client.user_id })
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
