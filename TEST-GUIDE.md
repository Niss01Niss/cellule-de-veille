# Guide de Test - Cyber Alerts Dashboard

## 🎯 Test des Fonctionnalités

### 1. **Accès au Dashboard**
- Va sur http://localhost:3000
- Tu devrais voir le dashboard principal avec des statistiques

### 2. **Test du Filtrage par IOCs**
- **Situation actuelle** : Il y a déjà un IOC configuré (IP: 192.168.1.1, Serveur: srv01.com, OS: Windows 10)
- **Résultat attendu** : Le dashboard ne devrait afficher QUE les vulnérabilités liées à ces IOCs
- **Vérification** : Regarde le tableau des vulnérabilités - seules celles contenant "192.168.1.1", "srv01.com", "Windows 10", "antivirus", "firewall" devraient apparaître

### 3. **Test du Bouton "Voir plus"**
- Clique sur "Voir plus" sur n'importe quelle vulnérabilité
- Une popup devrait s'ouvrir avec les détails complets
- Clique sur "Fermer" pour fermer la popup

### 4. **Test de la Page IOCs**
- Va sur http://localhost:3000/iocs
- **Aide automatique** : La popup d'aide devrait s'ouvrir automatiquement
- **Ajout d'IOC** : Essaie d'ajouter un nouvel IOC
- **Modification** : Clique sur "Modifier" sur l'IOC existant
- **Suppression** : Clique sur "X" pour supprimer un IOC

### 5. **Test du Dashboard Personnalisé**
- Va sur http://localhost:3000/personalized
- Tu devrais voir les vulnérabilités pertinentes avec des scores de pertinence

## 🔍 Vérifications Techniques

### API Fonctionne ✅
```bash
curl http://localhost:3000/api/cyber-alerts  # Retourne des vulnérabilités
curl http://localhost:3000/api/iocs          # Retourne les IOCs
```

### Tables Supabase ✅
```bash
node check-tables.js  # Vérifie que les tables existent
```

## 🚨 Problèmes Courants

### Si tu ne vois aucune vulnérabilité :
1. Vérifie que tu as des IOCs configurés
2. Les vulnérabilités doivent contenir des mots-clés correspondant à tes IOCs
3. Essaie d'ajouter des IOCs plus génériques (ex: "Windows", "Apache")

### Si l'aide ne s'ouvre pas :
1. Vérifie que tu es sur la page /iocs
2. Essaie de rafraîchir la page
3. Vérifie la console du navigateur pour les erreurs

### Si les modifications ne s'enregistrent pas :
1. Vérifie que Supabase est bien configuré
2. Regarde les erreurs dans la console du navigateur
3. Vérifie que les tables existent avec `node check-tables.js`

## ✅ Résultat Attendu

Après tous les tests :
- ✅ Dashboard filtré par IOCs
- ✅ Bouton "Voir plus" fonctionnel
- ✅ Aide IOC automatique
- ✅ Modification/suppression d'IOCs
- ✅ Dashboard personnalisé avec scoring

---
**Si tout fonctionne, félicitations ! Le projet est opérationnel ! 🎉** 