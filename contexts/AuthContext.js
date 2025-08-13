import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clientProfile, setClientProfile] = useState(null)

  useEffect(() => {
    // Vérifier la session actuelle
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchClientProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchClientProfile(session.user.id)
        } else {
          setClientProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchClientProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération du profil:', error)
        return
      }

      setClientProfile(data)
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
    }
  }

  const signUp = async (email, password, clientData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Créer le profil client via l'API
        const profileResponse = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: data.user.id,
            company_name: clientData.companyName,
            contact_name: clientData.contactName,
            phone: clientData.phone,
            industry: clientData.industry,
          }),
        })

        if (!profileResponse.ok) {
          const profileError = await profileResponse.json()
          console.error('Erreur lors de la création du profil:', profileError)
          // Ne pas faire échouer l'inscription si le profil échoue
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Vérifier l'état d'activation du client
      if (data?.user) {
        const isAdmin = data.user?.app_metadata?.role === 'admin'
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .select('is_active')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (!isAdmin && (!profile || profileError || profile.is_active !== true)) {
          // Déconnecter immédiatement si inactif
          await supabase.auth.signOut()
          return { data: null, error: new Error("Compte en attente d'activation par l'administrateur.") }
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔐 Début de la déconnexion dans AuthContext...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      console.log('✅ Supabase déconnexion réussie')
      
      // Réinitialiser les états locaux après la déconnexion
      setUser(null)
      setClientProfile(null)
      console.log('✅ États locaux réinitialisés')
      
      // Rediriger vers la page de connexion
      if (typeof window !== 'undefined') {
        console.log('🔄 Redirection vers /login...')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      throw error
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setClientProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    clientProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 