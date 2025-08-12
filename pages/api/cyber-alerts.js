import { supabase } from '../../lib/supabase'

// Mappage des industries vers leurs mots-clés pertinents
const INDUSTRY_KEYWORDS = {
  'healthcare': ['healthcare', 'medical', 'hospital', 'pharmaceutical', 'patient', 'clinical', 'HIPAA', 'FDA'],
  'finance': ['finance', 'banking', 'financial', 'payment', 'credit', 'investment', 'PCI-DSS', 'SOX'],
  'technology': ['technology', 'software', 'IT', 'cloud', 'cybersecurity', 'digital', 'AI', 'machine learning'],
  'retail': ['retail', 'e-commerce', 'POS', 'payment', 'inventory', 'customer', 'PCI-DSS'],
  'manufacturing': ['manufacturing', 'industrial', 'SCADA', 'OT', 'production', 'factory', 'IoT'],
  'government': ['government', 'public sector', 'federal', 'state', 'municipal', 'defense', 'classified'],
  'education': ['education', 'university', 'school', 'student', 'academic', 'research', 'FERPA'],
  'energy': ['energy', 'utilities', 'power', 'grid', 'SCADA', 'nuclear', 'renewable'],
  'transportation': ['transportation', 'logistics', 'aviation', 'railway', 'maritime', 'fleet', 'GPS'],
  'telecommunications': ['telecom', 'network', 'ISP', 'mobile', '5G', 'fiber', 'routing']
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
        const industryLower = industry.toLowerCase()
        const keywords = INDUSTRY_KEYWORDS[industryLower] || [industryLower]
        
        // Construire la requête de filtrage par industrie
        const industryFilters = keywords.map(keyword => 
          `description.ilike.%${keyword}%,summary.ilike.%${keyword}%`
        ).join(',')
        
        query = query.or(industryFilters)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      res.status(200).json(data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { summary, cvss, published, industry } = req.body

      const { data, error } = await supabase
        .from('cyber_alerts')
        .insert([{ summary, cvss, published, industry }])
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
