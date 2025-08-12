
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {

  // 1) Tenter l'auth via cookie (helpers)
  const supabaseFromCookies = createPagesServerClient({ req, res })
  const { data: { user: cookieUser } } = await supabaseFromCookies.auth.getUser()

  let user = cookieUser
  let accessToken = null

  // 2) Sinon, tenter via le header Authorization: Bearer <token>
  if (!user) {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      accessToken = token
      const tmp = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data: { user: userFromToken } } = await tmp.auth.getUser(token)
      user = userFromToken
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  // 3) Sélectionner le client Supabase pour les requêtes BDD avec le bon contexte d'auth
  const supabase = accessToken
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      )
    : supabaseFromCookies

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('iocs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      res.status(200).json(data || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des IOCs:', error)
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { ip, server, os, security_solutions, created_at } = req.body

      const { data, error } = await supabase
        .from('iocs')
        .insert([{ 
          user_id: user.id,
          ip: ip || null, 
          server: server || null, 
          os: os || null, 
          security_solutions: security_solutions || null,
          created_at: created_at || new Date().toISOString()
        }])
        .select()

      if (error) {
        throw error
      }

      res.status(201).json(data[0])
    } catch (error) {
  console.error("Erreur lors de la création de l'IOC:", error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 