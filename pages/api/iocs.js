
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {

  const supabase = createPagesServerClient({ req, res })
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  // Si la session cookie échoue, tenter via le header Authorization (jeton JWT)
  if (!user) {
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      const { data: { user: userFromToken } } = await supabase.auth.getUser(token)
      user = userFromToken
    }
  }
  if (authError || !user) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

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