const { createClient } = require('@supabase/supabase-js')

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Diagnostic détaillé de l\'authentification...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.log('URL:', supabaseUrl ? '✅ Présente' : '❌ Manquante')
  console.log('KEY:', supabaseKey ? '✅ Présente' : '❌ Manquante')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuth() {
  try {
    console.log('1. Test de connexion Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('cyber_alerts')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message)
      return
    }
    console.log('✅ Connexion réussie\n')

    console.log('2. Vérification des tables...')
    
    // Vérifier client_profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('client_profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Table client_profiles:', profilesError.message)
    } else {
      console.log('✅ Table client_profiles accessible')
      if (profilesData && profilesData.length > 0) {
        console.log('   📋 Colonnes:', Object.keys(profilesData[0]).join(', '))
      }
    }

    // Vérifier iocs
    const { data: iocsData, error: iocsError } = await supabase
      .from('iocs')
      .select('*')
      .limit(1)
    
    if (iocsError) {
      console.error('❌ Table iocs:', iocsError.message)
    } else {
      console.log('✅ Table iocs accessible')
      if (iocsData && iocsData.length > 0) {
        console.log('   📋 Colonnes:', Object.keys(iocsData[0]).join(', '))
      }
    }

    console.log('\n3. Test de création d\'utilisateur...')
    
    // Tenter de créer un utilisateur de test
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    console.log(`   📧 Email de test: ${testEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signUpError) {
      console.error('❌ Erreur lors de l\'inscription:', signUpError.message)
      console.error('   Code:', signUpError.status)
      console.error('   Détails:', signUpError)
    } else {
      console.log('✅ Inscription réussie')
      console.log('   User ID:', signUpData.user?.id)
      
      // Tenter de créer le profil client
      if (signUpData.user) {
        console.log('\n4. Test de création de profil client...')
        
        const { data: profileData, error: profileError } = await supabase
          .from('client_profiles')
          .insert([
            {
              user_id: signUpData.user.id,
              company_name: 'Test Company',
              contact_name: 'Test User',
              phone: '+33123456789',
              industry: 'Technology',
              subscription_plan: 'basic',
              is_active: true
            }
          ])
          .select()

        if (profileError) {
          console.error('❌ Erreur lors de la création du profil:', profileError.message)
          console.error('   Code:', profileError.code)
          console.error('   Détails:', profileError)
        } else {
          console.log('✅ Profil client créé avec succès')
          console.log('   Profil ID:', profileData[0]?.id)
        }
      }
    }

    console.log('\n5. Vérification des politiques RLS...')
    
    // Tenter une insertion directe (devrait être bloquée par RLS)
    const { data: directInsertData, error: directInsertError } = await supabase
      .from('client_profiles')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000',
          company_name: 'Test RLS',
          contact_name: 'Test RLS User'
        }
      ])
      .select()

    if (directInsertError && directInsertError.message.includes('row-level security')) {
      console.log('✅ RLS activé et fonctionnel')
    } else if (directInsertError) {
      console.log('⚠️ Erreur RLS:', directInsertError.message)
    } else {
      console.log('❌ RLS non activé ou non fonctionnel')
    }

    console.log('\n6. Recommandations:')
    
    if (profilesError || iocsError) {
      console.log('📋 Exécutez le script database/complete-schema.sql dans Supabase')
    }
    
    if (signUpError) {
      console.log('🔐 Vérifiez les paramètres d\'authentification dans Supabase')
      console.log('   - Authentication > Settings')
      console.log('   - Enable sign up: ✅')
      console.log('   - Enable email confirmations: ✅')
    }
    
    // Note: profileError n'est défini que si l'inscription réussit
    console.log('🗄️ Vérifiez les politiques RLS sur la table client_profiles')
    console.log('   - Table Editor > client_profiles > Policies')

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    console.error('Stack:', error.stack)
  }
}

debugAuth() 