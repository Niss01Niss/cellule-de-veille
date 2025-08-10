# 📊 Tables Requises pour Cyber Alerts Dashboard

## 🎯 **Résumé des Tables**

Voici toutes les tables que vous devez créer dans votre base de données Supabase pour que l'application fonctionne correctement.

---

## 📋 **Tables Principales**

### **1. `client_profiles` - Profils des Clients**
```sql
CREATE TABLE client_profiles (
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
```

**Objectif :** Stocker les informations professionnelles des clients

---

### **2. `iocs` - Indicateurs de Compromission**
```sql
CREATE TABLE iocs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip TEXT,
    server TEXT,
    os TEXT,
    security_solutions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Objectif :** Stocker les IOCs spécifiques à chaque utilisateur

---

### **3. `cyber_alerts` - Alertes de Sécurité**
```sql
CREATE TABLE cyber_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    cvss_score DECIMAL(3,1),
    severity VARCHAR(20),
    published TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT,
    cve_id TEXT,
    affected_products TEXT[],
    remediation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Objectif :** Stocker les alertes de vulnérabilités (données partagées)

---

## 🔧 **Configuration Requise**

### **A. Exécuter le Script Complet**

**Utilisez le fichier :** `database/complete-schema.sql`

Ce script contient :
- ✅ Création de toutes les tables
- ✅ Index pour les performances
- ✅ Triggers pour mise à jour automatique
- ✅ RLS (Row Level Security) activé
- ✅ Politiques de sécurité
- ✅ Fonctions utilitaires
- ✅ Données de test

### **B. Commandes SQL à Exécuter**

1. **Ouvrir** l'éditeur SQL dans Supabase
2. **Copier-coller** le contenu de `database/complete-schema.sql`
3. **Exécuter** le script
4. **Vérifier** que toutes les tables sont créées

---

## 🔐 **Sécurité (RLS)**

### **Tables avec RLS Activé :**
- ✅ `client_profiles`
- ✅ `iocs`

### **Politiques de Sécurité :**
- **Lecture :** Utilisateurs ne voient que leurs propres données
- **Écriture :** Utilisateurs ne peuvent modifier que leurs propres données
- **Suppression :** Utilisateurs ne peuvent supprimer que leurs propres données

---

## 📊 **Index et Performance**

### **Index Créés Automatiquement :**
- `idx_client_profiles_user_id`
- `idx_client_profiles_company_name`
- `idx_iocs_user_id`
- `idx_iocs_created_at`
- `idx_cyber_alerts_published`
- `idx_cyber_alerts_severity`

---

## 🎯 **Fonctions Utilitaires**

### **Fonctions Créées :**
- `update_updated_at_column()` - Mise à jour automatique des timestamps
- `get_client_stats(user_uuid)` - Statistiques client
- `check_user_access(user_uuid)` - Vérification d'accès

---

## ✅ **Checklist de Validation**

Après exécution du script, vérifiez :

- [ ] **Table `client_profiles`** créée avec RLS
- [ ] **Table `iocs`** créée avec RLS et colonne `user_id`
- [ ] **Table `cyber_alerts`** créée
- [ ] **Index** créés pour toutes les tables
- [ ] **Triggers** configurés
- [ ] **Politiques RLS** actives
- [ ] **Données de test** insérées (optionnel)

---

## 🚨 **Points Importants**

### **1. Colonne `user_id` dans `iocs`**
- **Nouvelle colonne** ajoutée à la table existante
- **RLS activé** pour isoler les données par utilisateur
- **API mise à jour** pour inclure `user_id` automatiquement

### **2. Authentification Requise**
- **Toutes les API** vérifient l'authentification
- **Redirection automatique** vers `/login` si non connecté
- **Protection des routes** active

### **3. Isolation des Données**
- **Chaque utilisateur** ne voit que ses propres IOCs
- **Profils séparés** par utilisateur
- **Sécurité garantie** par RLS

---

## 🔄 **Migration des Données Existantes**

Si vous avez déjà des données dans la table `iocs` :

```sql
-- Ajouter la colonne user_id (si pas déjà fait)
ALTER TABLE iocs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

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

---

## 🎉 **Résultat Final**

Après avoir exécuté le script complet :

1. **Système d'authentification** fonctionnel
2. **Isolation des données** par utilisateur
3. **Performance optimisée** avec index
4. **Sécurité renforcée** avec RLS
5. **Interface utilisateur** complète avec profil

**Votre application Cyber Alerts sera prête avec un système d'authentification complet et sécurisé !** 🚀 