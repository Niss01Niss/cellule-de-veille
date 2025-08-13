import { useState, useEffect } from 'react'

// Système de cache simple pour optimiser les requêtes
class DataCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes par défaut
  }

  // Générer une clé de cache
  generateKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`
  }

  // Vérifier si les données sont en cache et valides
  get(key) {
    const timestamp = this.timestamps.get(key)
    const data = this.cache.get(key)
    
    if (!data || !timestamp) {
      return null
    }

    // Vérifier si le cache a expiré
    if (Date.now() - timestamp > this.defaultTTL) {
      this.delete(key)
      return null
    }

    return data
  }

  // Stocker des données en cache
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data)
    this.timestamps.set(key, Date.now())
    
    // Nettoyer automatiquement après TTL
    setTimeout(() => {
      this.delete(key)
    }, ttl)
  }

  // Supprimer une entrée du cache
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  // Vider tout le cache
  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  // Obtenir la taille du cache
  size() {
    return this.cache.size
  }
}

// Instance globale du cache
const globalCache = new DataCache()

// Hook pour utiliser le cache
export const useDataCache = (endpoint, params = {}, ttl = null) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cacheKey = globalCache.generateKey(endpoint, params)

  const fetchData = async (forceRefresh = false) => {
    // Vérifier le cache d'abord
    if (!forceRefresh) {
      const cachedData = globalCache.get(cacheKey)
      if (cachedData) {
        setData(cachedData)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...params
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Mettre en cache
      globalCache.set(cacheKey, result, ttl)
      setData(result)
    } catch (err) {
      setError(err.message)
      console.error('Erreur lors de la récupération des données:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => fetchData(true)

  useEffect(() => {
    fetchData()
  }, [endpoint, JSON.stringify(params)])

  return { data, loading, error, refresh }
}

// Hook pour invalider le cache
export const useCacheInvalidation = () => {
  const invalidateCache = (pattern = null) => {
    if (pattern) {
      // Invalider les entrées correspondant au pattern
      for (const key of globalCache.cache.keys()) {
        if (key.includes(pattern)) {
          globalCache.delete(key)
        }
      }
    } else {
      // Vider tout le cache
      globalCache.clear()
    }
  }

  return { invalidateCache, cacheSize: globalCache.size() }
}

export default globalCache
