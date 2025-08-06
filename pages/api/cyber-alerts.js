import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('cyber_alerts')
        .select('*')
        .order('published', { ascending: false })

      if (error) {
        throw error
      }

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { summary, cvss, published } = req.body

      const { data, error } = await supabase
        .from('cyber_alerts')
        .insert([{ summary, cvss, published }])
        .select()

      if (error) {
        throw error
      }

      res.status(201).json(data[0])
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
