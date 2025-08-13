import { useState } from 'react'
import { Shield, BarChart3, Search, X, Target, Menu, Home, Settings, HelpCircle, Sun, Moon, Users, TrendingUp, AlertTriangle, Database } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

const SidebarContent = ({ onClose, isMobile = false }) => {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()

  const isAdmin = user?.app_metadata?.role === 'admin'

  const clientMenuItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      href: '/',
      active: router.pathname === '/',
      description: 'Vue d\'ensemble des alertes',
      badge: null
    },
    {
      name: 'Dashboard Personnalisé',
      icon: Target,
      href: '/personalized',
      active: router.pathname === '/personalized',
      description: 'Alertes basées sur vos IOCs',
      badge: 'Nouveau'
    },
    {
      name: 'IOCs',
      icon: Search,
      href: '/iocs',
      active: router.pathname === '/iocs',
      description: 'Gestion des indicateurs',
      badge: null
    }
  ]

  const adminMenuItems = [
    {
      name: 'Dashboard Principal',
      icon: BarChart3,
      href: '/',
      active: router.pathname === '/',
      description: 'Alertes et statistiques',
      badge: null
    },
    {
      name: 'Admin Dashboard',
      icon: Home,
      href: { pathname: '/admin-dashboard', query: { view: 'overview' } },
      active: router.pathname === '/admin-dashboard' && (!router.query.view || router.query.view === 'overview'),
      description: 'Vue administrateur',
      badge: null
    },
    {
      name: 'Gestion Clients',
      icon: Users,
      href: { pathname: '/admin-dashboard', query: { view: 'clients' } },
      active: router.pathname === '/admin-dashboard' && router.query.view === 'clients',
      description: 'Activation, profils',
      badge: null
    }
  ]

  const menuItems = isAdmin ? adminMenuItems : clientMenuItems

  return (
    <>
      {/* Header avec logo amélioré */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 transition-all duration-500">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse-gentle"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Cyber Alerts
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {isAdmin ? 'Administration' : 'Dashboard Sécurité'}
            </p>
          </div>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-all duration-200 shadow-soft hover:shadow-md backdrop-blur-sm"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>

      {/* Navigation avec design amélioré */}
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Navigation
          </h3>
        </div>
        
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={`
                    group relative flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300
                    ${item.active 
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:text-blue-600 hover:transform hover:scale-102'
                    }
                  `}>
                    {/* Indicateur actif avec animation */}
                    {item.active && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-white rounded-r-full shadow-glow"></div>
                    )}
                    
                    <div className={`
                      p-2.5 rounded-xl transition-all duration-300
                      ${item.active 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                      }
                    `}>
                      <Icon className={`h-5 w-5 transition-all duration-300 ${
                        item.active ? 'text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold transition-all duration-300 ${
                          item.active ? 'text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600'
                        }`}>
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs transition-all duration-300 ${
                        item.active ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>

                    {/* Effet de brillance au hover */}
                    <div className={`
                      absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
                      ${item.active ? 'bg-gradient-to-r from-white/10 to-transparent' : 'bg-gradient-to-r from-blue-500/5 to-transparent'}
                      group-hover:opacity-100
                    `}></div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Section d'aide avec design amélioré */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="px-3 mb-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Support & Configuration
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="group px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:transform hover:scale-102">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300">
                  <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-all duration-300">
                    Guide d'utilisation
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-all duration-300">
                    Tutoriels et documentation
                  </p>
                </div>
              </div>
            </div>

            <div className="group px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:transform hover:scale-102">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300">
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-all duration-300">
                    Paramètres
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-all duration-300">
                    Configuration du système
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de thème amélioré */}
            <button
              onClick={toggleTheme}
              className="w-full group px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:transform hover:scale-102"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all duration-300">
                  {isDark ? (
                    <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-all duration-300">
                    {isDark ? 'Mode Clair' : 'Mode Sombre'}
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-all duration-300">
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
      {/* Overlay pour mobile avec animation améliorée */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar desktop avec design amélioré */}
      <div className="hidden lg:block fixed top-0 left-0 h-full w-72 bg-white/95 dark:bg-slate-800/95 shadow-2xl z-50 border-r border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl transition-all duration-500">
        <SidebarContent />
      </div>

      {/* Sidebar mobile avec animation améliorée */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/95 dark:bg-slate-800/95 shadow-2xl z-50 transform transition-all duration-500 ease-out backdrop-blur-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden
        w-80 border-r border-slate-200/50 dark:border-slate-700/50
      `}>
        <SidebarContent onClose={onClose} isMobile={true} />
      </div>
    </>
  )
}

export default Sidebar 