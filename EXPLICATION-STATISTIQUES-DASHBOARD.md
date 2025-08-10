# 📊 Explication des Statistiques du Dashboard Personnalisé

## 🎯 **Vue d'ensemble**

Le dashboard personnalisé affiche des statistiques spécifiques basées sur les IOCs (Indicators of Compromise) configurés par chaque client. Ces statistiques sont calculées en temps réel et reflètent la pertinence des vulnérabilités par rapport à l'infrastructure du client.

---

## 📈 **Cartes de Statistiques**

### **1. IOCs Configurés** 🔵
- **Description** : Nombre total d'IOCs configurés par le client
- **Calcul** : `COUNT(*) FROM iocs WHERE user_id = client_id`
- **Signification** : Indique l'étendue de la surveillance de l'infrastructure
- **Exemple** : Si le client a configuré 3 IOCs (IP, serveur, OS), cette carte affichera "3"

### **2. Vulnérabilités Pertinentes** 🟠
- **Description** : Nombre de vulnérabilités qui correspondent aux IOCs du client
- **Calcul** : Algorithm de correspondance basé sur les mots-clés extraits des IOCs
- **Signification** : Vulnérabilités qui affectent directement l'infrastructure du client
- **Exemple** : Si 15 vulnérabilités correspondent aux IOCs, cette carte affichera "15"

### **3. Critiques/Élevées** 🔴
- **Description** : Nombre de vulnérabilités critiques et élevées parmi les vulnérabilités pertinentes
- **Calcul** : `COUNT(*) FROM relevant_alerts WHERE cvss >= 7`
- **Signification** : Vulnérabilités à haute priorité nécessitant une attention immédiate
- **Exemple** : Si 8 vulnérabilités pertinentes ont un CVSS ≥ 7, cette carte affichera "8"

### **4. Taux de Pertinence** 🟢
- **Description** : Pourcentage de vulnérabilités pertinentes par rapport au total des alertes
- **Calcul** : `(relevant_alerts / total_alerts) * 100`
- **Signification** : Efficacité du filtrage basé sur les IOCs
- **Exemple** : Si 15 vulnérabilités sur 100 sont pertinentes, le taux sera "15%"

---

## 🔍 **Algorithme de Correspondance**

### **Extraction des Mots-clés**
```javascript
const extractKeywords = (iocsData) => {
  const keywords = []
  
  iocsData.forEach(ioc => {
    // IP Address
    if (ioc.ip) keywords.push({ word: ioc.ip, category: 'IP' })
    
    // Server
    if (ioc.server) keywords.push({ word: ioc.server, category: 'Server' })
    
    // Operating System
    if (ioc.os) keywords.push({ word: ioc.os, category: 'OS' })
    
    // Security Solutions
    if (ioc.security_solutions) {
      const solutions = ioc.security_solutions.split(',').map(s => s.trim())
      solutions.forEach(solution => {
        keywords.push({ word: solution, category: 'Security' })
      })
    }
  })
  
  return keywords
}
```

### **Calcul du Score de Pertinence**
```javascript
const calculateRelevanceScore = (alert, keywords, iocsData) => {
  let score = 0
  const matchedKeywords = []
  
  keywords.forEach(keyword => {
    const alertText = `${alert.summary} ${alert.description || ''}`.toLowerCase()
    const keywordText = keyword.word.toLowerCase()
    
    if (alertText.includes(keywordText)) {
      score += 5 // Score de base pour chaque correspondance
      matchedKeywords.push(keyword)
      
      // Bonus pour les correspondances exactes
      if (alertText.includes(` ${keywordText} `)) {
        score += 3
      }
      
      // Bonus pour les catégories critiques
      if (keyword.category === 'Security') {
        score += 2
      }
    }
  })
  
  return { score, matchedKeywords }
}
```

---

## 📊 **Graphiques et Visualisations**

### **1. Graphique Circulaire - Vulnérabilités par Sévérité**
- **Données** : Répartition des vulnérabilités pertinentes par niveau CVSS
- **Catégories** :
  - **Critique** (CVSS ≥ 9) : Rouge
  - **Élevé** (CVSS 7-8.9) : Orange
  - **Moyen** (CVSS 4-6.9) : Jaune
  - **Faible** (CVSS < 4) : Vert
- **Fonctionnalité** : Les catégories vides ne sont pas affichées

### **2. Graphique en Barres - Top Vulnérabilités par Pertinence**
- **Données** : Les 10 vulnérabilités les plus pertinentes
- **Axe Y** : Score de pertinence (0-20+)
- **Axe X** : Identifiants des vulnérabilités
- **Tri** : Par score de pertinence décroissant, puis par date de publication

---

## 🔄 **Mise à Jour en Temps Réel**

### **Déclencheurs de Mise à Jour**
1. **Modification des IOCs** : Ajout, suppression ou modification d'un IOC
2. **Nouvelles Vulnérabilités** : Arrivée de nouvelles alertes dans la base de données
3. **Changement de Filtre** : Modification du filtre de date
4. **Rechargement de Page** : Actualisation manuelle

### **Calculs Automatiques**
```javascript
useEffect(() => {
  if (iocs.length > 0 && alerts.length > 0) {
    const relevantAlerts = analyzeRelevantAlerts(iocs, alerts)
    setPersonalizedAlerts(relevantAlerts)
    calculateStats(iocs, alerts, relevantAlerts)
  }
}, [iocs, alerts])
```

---

## 🎯 **Exemple Concret**

### **Scénario Client**
- **IOCs Configurés** : 3
  - IP : `192.168.1.100`
  - Serveur : `Ubuntu 22.04`
  - Sécurité : `Bitdefender 2025`

### **Calcul des Statistiques**
1. **Total Alertes** : 150 vulnérabilités dans la base
2. **Vulnérabilités Pertinentes** : 12 vulnérabilités correspondent aux IOCs
3. **Critiques/Élevées** : 8 vulnérabilités pertinentes ont CVSS ≥ 7
4. **Taux de Pertinence** : (12/150) × 100 = 8%

### **Affichage**
- 🔵 **IOCs Configurés** : 3
- 🟠 **Vulnérabilités Pertinentes** : 12
- 🔴 **Critiques/Élevées** : 8
- 🟢 **Taux de Pertinence** : 8%

---

## 🔧 **Pagination et Filtrage**

### **Pagination**
- **Éléments par page** : 5 vulnérabilités
- **Navigation** : Boutons précédent/suivant + numéros de page
- **Compteur** : "Affichage X-Y sur Z résultats"

### **Filtrage par Date**
- **Aujourd'hui** (par défaut) : Vulnérabilités publiées aujourd'hui
- **7 derniers jours** : Vulnérabilités de la semaine
- **30 derniers jours** : Vulnérabilités du mois
- **12 derniers mois** : Vulnérabilités de l'année

---

## 🎨 **Interface Utilisateur**

### **Design Responsive**
- **Desktop** : 4 cartes en ligne, graphiques côte à côte
- **Tablet** : 2 cartes par ligne, graphiques empilés
- **Mobile** : 1 carte par ligne, graphiques empilés

### **Animations**
- **Hover Effects** : Échelle et ombre sur les cartes
- **Loading States** : Spinners pendant les calculs
- **Transitions** : Animations fluides entre les états

### **Mode Sombre**
- **Couleurs adaptées** : Palette sombre pour tous les éléments
- **Contraste optimisé** : Lisibilité garantie
- **Cohérence visuelle** : Même design en mode clair et sombre

---

## 📋 **Fonctionnalités Avancées**

### **Modal de Détails**
- **Accès** : Bouton "Voir plus" sur chaque vulnérabilité
- **Informations** : Score CVSS, date, résumé, description complète
- **Correspondances** : Mots-clés trouvés dans la vulnérabilité
- **Score de Pertinence** : Détail du calcul

### **Tri et Filtrage**
- **Tri Principal** : Par score de pertinence décroissant
- **Tri Secondaire** : Par date de publication décroissante
- **Filtrage** : Par période de temps

### **Export et Partage**
- **Fonctionnalités futures** : Export PDF, partage par email
- **Rapports** : Génération de rapports personnalisés
- **Alertes** : Notifications pour nouvelles vulnérabilités critiques

---

## 🎯 **Avantages pour le Client**

### **1. Focus sur la Pertinence**
- **Réduction du bruit** : Seules les vulnérabilités pertinentes sont affichées
- **Priorisation** : Les vulnérabilités critiques sont mises en évidence
- **Efficacité** : Gain de temps dans l'analyse des menaces

### **2. Personnalisation**
- **Infrastructure spécifique** : Alertes adaptées à l'environnement
- **Évolution** : Statistiques qui évoluent avec les IOCs
- **Flexibilité** : Possibilité d'ajuster les IOCs selon les besoins

### **3. Actionnabilité**
- **Décisions rapides** : Informations claires pour la prise de décision
- **Suivi** : Évolution des menaces dans le temps
- **Reporting** : Données structurées pour les rapports

---

**Le dashboard personnalisé offre ainsi une vue ciblée et actionnable des vulnérabilités pertinentes pour chaque client, optimisant leur capacité de réponse aux menaces de sécurité.** 🛡️ 