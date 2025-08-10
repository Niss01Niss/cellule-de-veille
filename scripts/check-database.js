const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!')
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données...\n')

  try {
    // 1. Vérifier la connexion
    console.log('1. Test de connexion...')
    const { data: testData, error: testError } = await supabase
      .from('cyber_alerts')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message)
      return
    }
    console.log('✅ Connexion réussie\n')

    // 2. Vérifier les tables
    console.log('2. Vérification des tables...')
    
    // Vérifier client_profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('client_profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Table client_profiles manquante ou inaccessible:', profilesError.message)
    } else {
      console.log('✅ Table client_profiles accessible')
    }

    // Vérifier iocs
    const { data: iocsData, error: iocsError } = await supabase
      .from('iocs')
      .select('count')
      .limit(1)
    
    if (iocsError) {
      console.error('❌ Table iocs manquante ou inaccessible:', iocsError.message)
    } else {
      console.log('✅ Table iocs accessible')
    }

    // Vérifier cyber_alerts
    const { data: alertsData, error: alertsError } = await supabase
      .from('cyber_alerts')
      .select('count')
      .limit(1)
    
    if (alertsError) {
      console.error('❌ Table cyber_alerts manquante ou inaccessible:', alertsError.message)
    } else {
      console.log('✅ Table cyber_alerts accessible')
    }

    console.log('')

    // 3. Vérifier la structure de la table iocs
    console.log('3. Vérification de la structure de la table iocs...')
    const { data: iocsStructure, error: structureError } = await supabase
      .from('iocs')
      .select('*')
      .limit(1)
    
    if (structureError) {
      console.error('❌ Erreur lors de la vérification de la structure:', structureError.message)
    } else if (iocsStructure && iocsStructure.length > 0) {
      const columns = Object.keys(iocsStructure[0])
      console.log('📋 Colonnes trouvées:', columns.join(', '))
      
      if (columns.includes('user_id')) {
        console.log('✅ Colonne user_id présente')
      } else {
        console.log('❌ Colonne user_id manquante!')
      }
    } else {
      console.log('ℹ️ Table iocs vide ou inaccessible')
    }

    console.log('')

    // 4. Vérifier les politiques RLS
    console.log('4. Vérification des politiques RLS...')
    
    // Tenter une insertion de test (sera bloquée par RLS si configuré)
    const { data: testInsert, error: insertError } = await supabase
      .from('client_profiles')
      .insert([{
        user_id: '00000000-0000-0000-0000-000000000000',
        company_name: 'Test Company',
        contact_name: 'Test User'
      }])
      .select()

    if (insertError && insertError.message.includes('row-level security')) {
      console.log('✅ RLS activé sur client_profiles')
    } else if (insertError) {
      console.log('⚠️ Erreur lors du test RLS:', insertError.message)
    } else {
      console.log('❌ RLS non activé sur client_profiles')
    }

    console.log('')

    // 5. Recommandations
    console.log('5. Recommandations:')
    console.log('📋 Si des tables sont manquantes, exécutez le script database/complete-schema.sql')
    console.log('🔐 Si RLS n\'est pas activé, vérifiez les politiques de sécurité')
    console.log('🔧 Si la colonne user_id manque, ajoutez-la avec: ALTER TABLE iocs ADD COLUMN user_id UUID REFERENCES auth.users(id)')

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le diagnostic
checkDatabase() 