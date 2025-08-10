import { useState } from 'react'
import { Shield, BarChart3, Search, X, Target, Menu, Home, Settings, HelpCircle, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../contexts/ThemeContext'

const SidebarContent = ({ onClose, isMobile = false }) => {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const menuItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      href: '/',
      active: router.pathname === '/',
      description: 'Vue d\'ensemble des alertes'
    },
    {
      name: 'Dashboard Personnalisé',
      icon: Target,
      href: '/personalized',
      active: router.pathname === '/personalized',
      description: 'Alertes basées sur vos IOCs'
    },
    {
      name: 'IOCs',
      icon: Search,
      href: '/iocs',
      active: router.pathname === '/iocs',
      description: 'Gestion des indicateurs'
    }
  ]

  return (
    <>
      {/* Header avec logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-800 dark:to-dark-700 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-dark-800 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Cyber Alerts
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dashboard Sécurité</p>
          </div>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/50 dark:bg-dark-700/50 hover:bg-white/80 dark:hover:bg-dark-600/80 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
            Navigation
          </h3>
        </div>
        
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={`
                    group relative flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                    ${item.active 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-dark-700 dark:hover:to-dark-600 hover:text-blue-600'
                    }
                  `}>
                    {/* Indicateur actif */}
                    {item.active && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}
                    
                    <div className={`
                      p-2 rounded-lg transition-all duration-200
                      ${item.active 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 dark:bg-dark-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                      }
                    `}>
                      <Icon className={`h-5 w-5 transition-all duration-200 ${
                        item.active ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <span className={`font-medium transition-all duration-200 ${
                        item.active ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600'
                      }`}>
                        {item.name}
                      </span>
                      <p className={`text-xs transition-all duration-200 ${
                        item.active ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>

                    {/* Effet de brillance au hover */}
                    <div className={`
                      absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200
                      ${item.active ? 'bg-gradient-to-r from-white/10 to-transparent' : 'bg-gradient-to-r from-blue-500/5 to-transparent'}
                      group-hover:opacity-100
                    `}></div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Section d'aide */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-700">
          <div className="px-3 mb-3">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Aide
            </h3>
          </div>
          
          <div className="space-y-1">
            <div className="group px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-dark-700 dark:hover:to-dark-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-all duration-200">
                  <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-all duration-200">
                    Guide d'utilisation
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-all duration-200">
                    Tutoriels et documentation
                  </p>
                </div>
              </div>
            </div>

            <div className="group px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-dark-700 dark:hover:to-dark-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-all duration-200">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-all duration-200">
                    Paramètres
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-all duration-200">
                    Configuration du système
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de thème */}
            <button
              onClick={toggleTheme}
              className="w-full group px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-dark-700 dark:hover:to-dark-600"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-all duration-200">
                  {isDark ? (
                    <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-all duration-200">
                    {isDark ? 'Mode Clair' : 'Mode Sombre'}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-all duration-200">
                    Changer le thème
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay pour mobile avec animation */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar desktop */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-800 shadow-2xl z-50 border-r border-gray-200/50 dark:border-dark-700/50 backdrop-blur-sm transition-colors duration-300">
        <SidebarContent />
      </div>

      {/* Sidebar mobile avec animation */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-dark-800 shadow-2xl z-50 transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden
        w-80 border-r border-gray-200/50 dark:border-dark-700/50 backdrop-blur-sm
      `}>
        <SidebarContent onClose={onClose} isMobile={true} />
      </div>
    </>
  )
}

export default Sidebar 