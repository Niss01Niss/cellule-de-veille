import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, company_name, contact_name, phone, industry } = req.body

    // Validation des données requises
    if (!user_id || !company_name || !contact_name) {
      return res.status(400).json({ 
        error: 'user_id, company_name et contact_name sont requis' 
      })
    }

    // Créer le profil client avec RLS désactivé temporairement
    const { data, error } = await supabase
      .from('client_profiles')
      .insert([
        {
          user_id,
          company_name,
          contact_name,
          phone: phone || null,
          industry: industry || null,
          subscription_plan: 'basic',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
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