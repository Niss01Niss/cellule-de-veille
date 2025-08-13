import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import Sidebar from './Sidebar'
import MobileMenuButton from './MobileMenuButton'
import { LogOut, User, Settings, Shield, Bell, Search } from 'lucide-react'

const Layout = ({ children }) => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useTheme()
  const { user, signOut, clientProfile } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      console.log('🔄 Tentative de déconnexion...')
      await signOut()
      setShowUserMenu(false) // Fermer le menu utilisateur après déconnexion
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content */}
      <div className="lg:ml-72">
        {/* Header avec authentification */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-soft border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 transition-all duration-300 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <MobileMenuButton />
            </div>
            
            {/* Spacer pour centrer le titre */}
            <div className="flex-1 lg:hidden"></div>
            
            {/* Titre de l'application avec logo amélioré */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse-gentle"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Cyber Alerts
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Cellule de Veille Cybersécurité
                </p>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher des alertes, IOCs..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Bouton de déconnexion à côté de la recherche */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 group"
                title="Se déconnecter"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
            
            {/* User menu avec notifications */}
            {user && (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce-gentle"></span>
                </button>
                
                {/* Bouton de déconnexion mobile */}
                <button
                  onClick={handleSignOut}
                  className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 group"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
                
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-200">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {clientProfile?.contact_name || user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.app_metadata?.role === 'admin' ? 'Administrateur' : (clientProfile?.company_name || 'Client')}
                      </p>
                    </div>
                  </button>
                  
                  {/* Dropdown menu amélioré */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {clientProfile?.contact_name || user.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.app_metadata?.role === 'admin' ? 'Administrateur' : (clientProfile?.company_name || 'Client')}
                        </p>
                        {clientProfile?.industry && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-lg">
                            {clientProfile.industry}
                          </span>
                        )}
                      </div>
                      
                      <Link href="/profile">
                        <button
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Gérer le profil</span>
                        </button>
                      </Link>
                      
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Content avec padding amélioré */}
        <main className="min-h-screen p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 