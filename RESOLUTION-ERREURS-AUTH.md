# 🔧 Résolution des Erreurs d'Authentification

## 🚨 **Erreur : "Database error saving new user"**

### **Cause Probable**
Cette erreur se produit généralement quand :
1. **Table `client_profiles`** n'existe pas
2. **Politiques RLS** bloquent l'insertion
3. **Colonne `user_id`** manquante dans `iocs`
4. **Variables d'environnement** incorrectes

---

## 🔍 **Diagnostic**

### **1. Vérifier la Base de Données**

Exécutez le script de diagnostic :

```bash
node scripts/check-database.js
```

Ce script vérifiera :
- ✅ Connexion à Supabase
- ✅ Existence des tables
- ✅ Structure des colonnes
- ✅ Configuration RLS

### **2. Vérifier les Variables d'Environnement**

Assurez-vous que `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🛠️ **Solutions**

### **Solution 1 : Créer les Tables Manquantes**

**Exécuter le script complet :**

1. **Aller** dans Supabase Dashboard
2. **Ouvrir** l'éditeur SQL
3. **Copier-coller** le contenu de `database/complete-schema.sql`
4. **Exécuter** le script

### **Solution 2 : Ajouter la Colonne user_id à iocs**

Si la table `iocs` existe mais sans `user_id` :

```sql
-- Ajouter la colonne user_id
ALTER TABLE iocs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_iocs_user_id ON iocs(user_id);

-- Activer RLS
ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;

-- Créer les politiques
CREATE POLICY "Users can view own IOCs" ON iocs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own IOCs" ON iocs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own IOCs" ON iocs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own IOCs" ON iocs
    FOR DELETE USING (auth.uid() = user_id);
```

### **Solution 3 : Créer la Table client_profiles**

Si la table `client_profiles` n'existe pas :

```sql
-- Créer la table client_profiles
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    industry VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);

-- RLS
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Users can view own profile" ON client_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON client_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON client_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🔄 **Processus de Correction**

### **Étape 1 : Diagnostic**
```bash
node scripts/check-database.js
```

### **Étape 2 : Exécuter le Script Complet**
1. **Copier** le contenu de `database/complete-schema.sql`
2. **Coller** dans l'éditeur SQL Supabase
3. **Exécuter** le script

### **Étape 3 : Redémarrer l'Application**
```bash
npm run dev
```

### **Étape 4 : Tester l'Inscription**
1. **Aller** sur `/register`
2. **Créer** un compte test
3. **Vérifier** qu'aucune erreur n'apparaît

---

## 🎯 **Vérifications Post-Correction**

### **Checklist de Validation**

- [ ] **Script de diagnostic** s'exécute sans erreur
- [ ] **Toutes les tables** sont créées
- [ ] **Colonne user_id** présente dans `iocs`
- [ ] **RLS activé** sur les tables sensibles
- [ ] **Inscription** fonctionne sans erreur
- [ ] **Connexion** fonctionne
- [ ] **Profil client** créé automatiquement

---

## 🚨 **Erreurs Courantes**

### **Erreur 1 : "relation does not exist"**
**Solution :** Table manquante, exécuter le script SQL complet

### **Erreur 2 : "column does not exist"**
**Solution :** Colonne manquante, ajouter avec ALTER TABLE

### **Erreur 3 : "new row violates row-level security policy"**
**Solution :** Politiques RLS manquantes, créer les politiques

### **Erreur 4 : "fetch failed"**
**Solution :** Variables d'environnement incorrectes

---

## 📞 **Support**

Si les erreurs persistent après avoir suivi ces étapes :

1. **Vérifier** les logs de la console navigateur
2. **Exécuter** le script de diagnostic
3. **Vérifier** les logs Supabase
4. **Tester** avec un compte Supabase frais

---

## ✅ **Résultat Attendu**

Après correction :
- ✅ **Inscription** sans erreur
- ✅ **Profil client** créé automatiquement
- ✅ **Connexion** fonctionnelle
- ✅ **Données isolées** par utilisateur
- ✅ **Interface** sans sidebar sur login/register

**Votre système d'authentification sera complètement fonctionnel !** 🎉 