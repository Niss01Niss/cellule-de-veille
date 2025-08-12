
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res })
  const { id } = req.query

  // Vérifier l'authentification (cookie ou header Authorization)
  let { data: { user }, error: authError } = await supabase.auth.getUser()
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

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('iocs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // S'assurer que l'utilisateur ne peut supprimer que ses propres IOCs

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
        .eq('user_id', user.id) // S'assurer que l'utilisateur ne peut modifier que ses propres IOCs
        .select()
      
      if (error) throw error
      
      if (data.length === 0) {
        return res.status(404).json({ error: 'IOC non trouvé ou non autorisé' })
      }
      
      res.status(200).json(data[0])
    } catch (error) {
  console.error("Erreur lors de la modification de l'IOC:", error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 