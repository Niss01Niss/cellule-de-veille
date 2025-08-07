import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('iocs')
        .select('*')
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
      console.error('Erreur lors de la création de l\'IOC:', error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 