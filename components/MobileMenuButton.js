import { Menu, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const MobileMenuButton = () => {
  const { isSidebarOpen, toggleSidebar } = useTheme()

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200 transform hover:scale-105"
      aria-label="Toggle menu"
    >
      <div className="relative">
        <Menu 
          className={`h-6 w-6 transition-all duration-300 ${
            isSidebarOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        <X 
          className={`h-6 w-6 absolute top-0 left-0 transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
    </button>
  )
}

export default MobileMenuButton 