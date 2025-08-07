# Guide de Configuration - Cyber Alerts Dashboard

## 🚨 Erreur "TypeError: fetch failed" - Solution

Si tu vois cette erreur dans le terminal, c'est que les tables Supabase n'existent pas encore.

### Étape 1 : Créer les tables dans Supabase

1. **Va sur https://supabase.com** et connecte-toi
2. **Ouvre ton projet** (inyhyarcyzfuesadggqa)
3. **Va dans "SQL Editor"** (dans le menu de gauche)
4. **Copie et colle le contenu de `database/schema.sql`** puis clique "Run"
5. **Copie et colle le contenu de `database/sample-data.sql`** puis clique "Run"

### Étape 2 : Vérifier la configuration

Ton fichier `.env.local` est déjà configuré avec :
```
NEXT_PUBLIC_SUPABASE_URL=https://inyhyarcyzfuesadggqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 3 : Redémarrer le serveur

```bash
# Arrête le serveur (Ctrl+C)
# Puis relance :
npm run dev
```

## ✅ Résultat attendu

Après ces étapes :
- ✅ Plus d'erreur "fetch failed"
- ✅ Les IOCs peuvent être ajoutés/modifiés
- ✅ Le dashboard filtre les vulnérabilités selon tes IOCs
- ✅ La popup d'aide s'ouvre automatiquement
- ✅ Le bouton "Voir plus" fonctionne

## 🔧 Autres erreurs courantes

### Erreur BUILD_ID
```bash
npm run build
npm start
```

### Erreur de compilation
```bash
npm install
npm run dev
```

## 📞 Support

Si le problème persiste après avoir créé les tables, vérifie :
1. Que les scripts SQL se sont bien exécutés (pas d'erreur rouge)
2. Que tu as bien redémarré le serveur
3. Que tu accèdes à http://localhost:3000

---
**Note :** Les tables `iocs` et `cyber_alerts` doivent exister pour que l'application fonctionne ! 