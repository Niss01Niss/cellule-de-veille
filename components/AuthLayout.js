import { useTheme } from '../contexts/ThemeContext'

const AuthLayout = ({ children }) => {
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {children}
    </div>
  )
}

export default AuthLayout 