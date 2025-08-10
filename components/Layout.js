import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import Sidebar from './Sidebar'
import MobileMenuButton from './MobileMenuButton'
import { LogOut, User, Settings } from 'lucide-react'

const Layout = ({ children }) => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useTheme()
  const { user, signOut, clientProfile } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content */}
      <div className="lg:ml-72">
        {/* Header avec authentification */}
        <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700 px-4 py-3 transition-colors duration-300">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <MobileMenuButton />
            </div>
            
            {/* Spacer pour centrer le titre */}
            <div className="flex-1 lg:hidden"></div>
            
            {/* Titre de l'application */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cyber Alerts
              </h1>
            </div>
            
            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {clientProfile?.contact_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {clientProfile?.company_name || 'Client'}
                    </p>
                  </div>
                </button>
                
                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {clientProfile?.contact_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {clientProfile?.company_name || 'Client'}
                      </p>
                    </div>
                    
                    <Link href="/profile">
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profil</span>
                      </button>
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        
        {/* Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
      
      {/* Overlay pour fermer le menu utilisateur */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}

export default Layout 