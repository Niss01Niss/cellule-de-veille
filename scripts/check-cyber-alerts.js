const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCyberAlertsTable() {
  console.log('🔍 Vérification de la table cyber_alerts...\n')

  try {
    // 1. Vérifier si la table existe
    console.log('1️⃣ Vérification de l\'existence de la table...')
    const { data: tableExists, error: tableError } = await supabase
      .from('cyber_alerts')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Erreur lors de l\'accès à la table:', tableError.message)
      console.error('Code d\'erreur:', tableError.code)
      return
    }

    console.log('✅ Table cyber_alerts accessible')

    // 2. Vérifier la structure en récupérant une ligne
    console.log('\n2️⃣ Vérification de la structure...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('cyber_alerts')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('❌ Erreur lors de la récupération d\'un échantillon:', sampleError.message)
      return
    }

    if (sampleData && sampleData.length > 0) {
      const sample = sampleData[0]
      console.log('✅ Données échantillon récupérées:')
      console.log('Colonnes disponibles:', Object.keys(sample))
      console.log('Exemple de données:', JSON.stringify(sample, null, 2))
    } else {
      console.log('⚠️ Table vide - pas de données pour analyser la structure')
    }

    // 3. Compter le nombre total d'alertes
    console.log('\n3️⃣ Comptage des alertes...')
    const { count, error: countError } = await supabase
      .from('cyber_alerts')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError.message)
    } else {
      console.log(`✅ Nombre total d'alertes: ${count}`)
    }

    // 4. Tester une requête avec filtrage par industrie
    console.log('\n4️⃣ Test de filtrage par industrie...')
    const { data: filteredData, error: filterError } = await supabase
      .from('cyber_alerts')
      .select('*')
      .or('summary.ilike.%energy%')
      .limit(3)

    if (filterError) {
      console.error('❌ Erreur lors du filtrage:', filterError.message)
    } else {
      console.log(`✅ Filtrage réussi: ${filteredData.length} alertes trouvées`)
      if (filteredData.length > 0) {
        console.log('Première alerte filtrée:', filteredData[0].summary)
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la vérification
checkCyberAlertsTable()
  .then(() => {
    console.log('\n✅ Diagnostic terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error.message)
    process.exit(1)
  })
