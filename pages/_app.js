import '../styles/globals.css'
import Layout from '../components/Layout'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import NavigationOptimizer from '../components/NavigationOptimizer'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  
  // Pages d'authentification qui ne doivent pas avoir la sidebar
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.includes(router.pathname)

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationOptimizer>
          {isAuthPage ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </NavigationOptimizer>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default MyApp
