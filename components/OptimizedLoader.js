import { Shield, Loader } from 'lucide-react'

// Composant de chargement optimisé
const OptimizedLoader = ({ 
  message = "Chargement...", 
  size = "default",
  type = "spinner",
  showShield = false 
}) => {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-16 w-16", 
    large: "h-32 w-32"
  }

  const containerClasses = {
    small: "min-h-[200px]",
    default: "min-h-screen",
    large: "min-h-screen"
  }

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} bg-gray-50 dark:bg-dark-900`}>
      <div className="text-center">
        {type === "spinner" && (
          <div className="relative">
            <div className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto ${sizeClasses[size]}`}></div>
            {size === "large" && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
            )}
          </div>
        )}
        
        {type === "dots" && (
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {showShield && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Vérification de l'authentification...
            </p>
          </div>
        )}

        <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
}

export default OptimizedLoader
