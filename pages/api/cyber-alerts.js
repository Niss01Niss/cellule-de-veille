import { supabase } from '../../lib/supabase'

// Mappage bidirectionnel des industries (français ↔ anglais)
const INDUSTRY_MAPPING = {
  // Français vers anglais
  'santé': 'healthcare',
  'finance': 'finance', 
  'technologie': 'technology',
  'commerce': 'retail',
  'manufacturing': 'manufacturing',
  'gouvernement': 'government',
  'éducation': 'education',
  'énergie': 'energy',
  'transport': 'transportation',
  'télécommunications': 'telecommunications',
  
  // Anglais vers français (pour compatibilité)
  'healthcare': 'healthcare',
  'technology': 'technology',
  'retail': 'retail',
  'government': 'government',
  'education': 'education',
  'energy': 'energy',
  'transportation': 'transportation',
  'telecommunications': 'telecommunications'
}

// Mappage des industries vers leurs mots-clés pertinents
const INDUSTRY_KEYWORDS = {
  'healthcare': ['healthcare', 'medical', 'hospital', 'pharmaceutical', 'patient', 'clinical', 'HIPAA', 'FDA', 'santé', 'médical', 'hôpital', 'patient'],
  'finance': ['finance', 'banking', 'financial', 'payment', 'credit', 'investment', 'PCI-DSS', 'SOX', 'banque', 'paiement', 'crédit', 'investissement'],
  'technology': ['technology', 'software', 'IT', 'cloud', 'cybersecurity', 'digital', 'AI', 'machine learning', 'technologie', 'logiciel', 'informatique', 'cybersécurité'],
  'retail': ['retail', 'e-commerce', 'POS', 'payment', 'inventory', 'customer', 'PCI-DSS', 'commerce', 'e-commerce', 'point de vente', 'client'],
  'manufacturing': ['manufacturing', 'industrial', 'SCADA', 'OT', 'production', 'factory', 'IoT', 'manufacturing', 'industriel', 'production', 'usine'],
  'government': ['government', 'public sector', 'federal', 'state', 'municipal', 'defense', 'classified', 'gouvernement', 'secteur public', 'fédéral', 'défense'],
  'education': ['education', 'university', 'school', 'student', 'academic', 'research', 'FERPA', 'éducation', 'université', 'école', 'étudiant', 'académique'],
  'energy': ['energy', 'utilities', 'power', 'grid', 'SCADA', 'nuclear', 'renewable', 'énergie', 'électricité', 'réseau', 'nucléaire', 'renouvelable'],
  'transportation': ['transportation', 'logistics', 'aviation', 'railway', 'maritime', 'fleet', 'GPS', 'transport', 'logistique', 'aviation', 'ferroviaire', 'maritime'],
  'telecommunications': ['telecom', 'network', 'ISP', 'mobile', '5G', 'fiber', 'routing', 'télécommunications', 'réseau', 'mobile', 'fibre', 'routage']
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { industry } = req.query
      
      let query = supabase
        .from('cyber_alerts')
        .select('*')
        .order('published', { ascending: false })

      // Si une industrie est spécifiée, filtrer les alertes par industrie
      if (industry && industry !== 'all') {
        try {
          // Décoder l'URL et normaliser l'industrie
          const decodedIndustry = decodeURIComponent(industry).toLowerCase()
          
          // Trouver la clé anglaise correspondante
          const englishKey = INDUSTRY_MAPPING[decodedIndustry]
          
          if (englishKey && INDUSTRY_KEYWORDS[englishKey]) {
            const keywords = INDUSTRY_KEYWORDS[englishKey]
            
            // Construire la requête de filtrage par industrie
            // Note: On utilise seulement 'summary' car c'est la colonne qui existe dans cyber_alerts
            const industryFilters = keywords.map(keyword => 
              `summary.ilike.%${keyword}%`
            ).join(',')
            
            query = query.or(industryFilters)
          } else {
            // Si l'industrie n'est pas reconnue, utiliser le terme tel quel
            query = query.or(`summary.ilike.%${decodedIndustry}%`)
          }
        } catch (filterError) {
          console.warn('Erreur lors du filtrage par industrie:', filterError)
          // Continuer sans filtrage en cas d'erreur
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Erreur Supabase:', error)
        throw error
      }

      res.status(200).json(data)
    } catch (error) {
      console.error('Erreur API cyber-alerts:', error)
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des alertes',
        details: error.message 
      })
    }
  } else if (req.method === 'POST') {
    try {
      // Note: La table cyber_alerts n'a pas de colonne 'industry'
      // L'industrie est stockée dans client_profiles
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
      console.error('Erreur POST cyber-alerts:', error)
      res.status(500).json({ error: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
