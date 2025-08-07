import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('iocs')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      res.status(200).json({ message: 'IOC supprimé avec succès' })
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'IOC:', error)
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      const { ip, server, os, security_solutions } = req.body
      const { data, error } = await supabase
        .from('iocs')
        .update({ ip, server, os, security_solutions })
        .eq('id', id)
        .select()
      if (error) throw error
      res.status(200).json(data[0])
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 