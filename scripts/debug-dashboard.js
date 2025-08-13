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

async function debugDashboard() {
  console.log('🔍 Debug du Dashboard - Vérification des alertes...\n')

  try {
    // 1. Compter le nombre total d'alertes
    console.log('1️⃣ Nombre total d\'alertes dans la base...')
    const { count: totalCount, error: countError } = await supabase
      .from('cyber_alerts')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError.message)
      return
    }

    console.log(`✅ Total des alertes en base: ${totalCount}`)

    // 2. Récupérer toutes les alertes pour analyse
    console.log('\n2️⃣ Récupération de toutes les alertes...')
    const { data: allAlerts, error: alertsError } = await supabase
      .from('cyber_alerts')
      .select('*')
      .order('published', { ascending: false })

    if (alertsError) {
      console.error('❌ Erreur lors de la récupération des alertes:', alertsError.message)
      return
    }

    console.log(`✅ ${allAlerts.length} alertes récupérées`)

    // 3. Analyser les dates et CVSS
    console.log('\n3️⃣ Analyse des alertes...')
    if (allAlerts.length > 0) {
      console.log('📅 Dates des alertes:')
      allAlerts.forEach((alert, index) => {
        const date = new Date(alert.published)
        const now = new Date()
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
        
        console.log(`  ${index + 1}. ${alert.summary?.substring(0, 50)}...`)
        console.log(`     Date: ${alert.published} (il y a ${daysDiff} jours)`)
        console.log(`     CVSS: ${alert.cvss}`)
        console.log('')
      })
    }

    // 4. Tester le filtrage par date (7 jours)
    console.log('4️⃣ Test du filtrage par date (7 jours)...')
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weekAlerts = allAlerts.filter(alert => {
      const alertDate = new Date(alert.published)
      return alertDate >= weekAgo
    })

    console.log(`✅ Alertes des 7 derniers jours: ${weekAlerts.length}`)
    
    if (weekAlerts.length > 0) {
      console.log('📅 Alertes récentes (7 jours):')
      weekAlerts.forEach((alert, index) => {
        const date = new Date(alert.published)
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
        console.log(`  ${index + 1}. ${alert.summary?.substring(0, 50)}...`)
        console.log(`     Date: ${alert.published} (il y a ${daysDiff} jours)`)
        console.log(`     CVSS: ${alert.cvss}`)
      })
    }

    // 5. Vérifier la structure des données
    console.log('\n5️⃣ Structure des données...')
    if (allAlerts.length > 0) {
      const sample = allAlerts[0]
      console.log('Colonnes disponibles:', Object.keys(sample))
      console.log('Exemple de données:', JSON.stringify(sample, null, 2))
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le debug
debugDashboard()
  .then(() => {
    console.log('\n✅ Debug terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error.message)
    process.exit(1)
  })
