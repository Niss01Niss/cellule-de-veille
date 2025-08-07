import { useState, useEffect } from 'react'
import { X, Info, AlertTriangle, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react'

const IOCHelpModal = ({ isOpen, onClose, onShowHelp }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenHelp, setHasSeenHelp] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu l'aide
    const seen = localStorage.getItem('ioc-help-seen')
    if (seen === 'true') {
      setHasSeenHelp(true)
    }
  }, [])

  const steps = [
    {
      title: "Bienvenue dans la gestion des IOCs",
      icon: Info,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Cette page vous permet de configurer vos <strong>Indicateurs de Compromission (IOCs)</strong> 
            pour personnaliser votre dashboard de sécurité.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Conseil :</strong> Plus vos IOCs sont précis, plus le dashboard personnalisé sera pertinent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Adresse IP",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Adresse IP :</strong> Saisissez les adresses IP de vos serveurs critiques, 
            points d'entrée réseau, ou machines sensibles.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Incluez les versions des services (ex: Apache 2.4.41)</li>
                  <li>• Précisez les ports ouverts (ex: 80, 443, 22)</li>
                  <li>• Mentionnez les configurations spéciales</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 font-medium">Exemples :</p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• 192.168.1.1 (Web Server - Apache 2.4.41)</li>
              <li>• 10.0.0.1 (Database Server - MySQL 8.0)</li>
              <li>• 172.16.0.1 (Firewall - Cisco ASA)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Serveur",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Serveur :</strong> Indiquez les noms de domaines, FQDN, ou identifiants 
            de vos serveurs et services.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Bonnes pratiques</h4>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Utilisez les noms complets (FQDN)</li>
                  <li>• Incluez les sous-domaines importants</li>
                  <li>• Précisez les rôles des serveurs</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 font-medium">Exemples :</p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• srv01.example.com (Web Server)</li>
              <li>• db.example.com (Database Server)</li>
              <li>• mail.company.com (Mail Server)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Système d'exploitation",
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Système d'exploitation :</strong> Spécifiez les OS utilisés dans votre infrastructure 
            avec leurs versions exactes.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-purple-800">Versions requises</h4>
                <ul className="mt-2 text-sm text-purple-700 space-y-1">
                  <li>• Windows : 10, 11, Server 2019, 2022</li>
                  <li>• Linux : Ubuntu 20.04, 22.04, CentOS 7, 8</li>
                  <li>• macOS : Monterey, Ventura, Sonoma</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 font-medium">Exemples :</p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• Windows 10 Pro 22H2</li>
              <li>• Ubuntu 20.04 LTS</li>
              <li>• macOS Monterey 12.6</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Solutions de sécurité",
      icon: ExternalLink,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Solutions de sécurité :</strong> Listez vos outils de sécurité, 
            antivirus, firewalls, et solutions de monitoring.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Critique</h4>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  <li>• Incluez les versions des solutions</li>
                  <li>• Précisez les configurations</li>
                  <li>• Mentionnez les intégrations</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 font-medium">Exemples :</p>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• Norton Antivirus 2024</li>
              <li>• Cisco Firewall ASA 9.18</li>
              <li>• CrowdStrike EDR Falcon</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Utilisation du dashboard personnalisé",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Une fois vos IOCs configurés, le <strong>Dashboard Personnalisé</strong> analysera 
            automatiquement les vulnérabilités pertinentes pour votre infrastructure.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Fonctionnalités</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Score de pertinence pour chaque vulnérabilité</li>
                  <li>• Correspondances avec vos IOCs</li>
                  <li>• Alertes prioritaires selon votre infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Prêt à commencer !</h4>
                <p className="mt-1 text-sm text-green-700">
                  Vous pouvez maintenant configurer vos IOCs et accéder au dashboard personnalisé 
                  pour voir les vulnérabilités pertinentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleClose = () => {
    // Marquer comme vu
    localStorage.setItem('ioc-help-seen', 'true')
    setHasSeenHelp(true)
    onClose()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-sm text-gray-500">
                Étape {currentStep + 1} sur {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Précédent
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IOCHelpModal 