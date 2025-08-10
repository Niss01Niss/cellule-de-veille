# 🔐 Configuration Supabase pour l'Authentification

## 🎯 **Objectif**

Configurer complètement Supabase pour que le système d'authentification fonctionne avec l'application Cyber Alerts.

---

## 📋 **Étapes de Configuration**

### **1. Configuration de l'Authentification Supabase**

#### **A. Activer l'Authentification Email/Password**

1. **Aller** dans votre projet Supabase
2. **Navigation** : Authentication > Settings
3. **Activer** les options suivantes :
   - ✅ **Enable sign up**
   - ✅ **Enable email confirmations**
   - ✅ **Enable secure email change**
   - ✅ **Enable password reset**

#### **B. Configurer les Templates d'Email**

1. **Aller** dans Authentication > Email Templates
2. **Personnaliser** les templates :

**Template de Confirmation :**
```
Sujet : Confirmez votre compte Cyber Alerts

Bonjour,

Merci de vous être inscrit à Cyber Alerts. Veuillez confirmer votre compte en cliquant sur le lien ci-dessous :

{{ .ConfirmationURL }}

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe Cyber Alerts
```

**Template de Réinitialisation :**
```
Sujet : Réinitialisation de votre mot de passe Cyber Alerts

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :

{{ .ConfirmationURL }}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe Cyber Alerts
```

---

### **2. Exécution des Scripts SQL**

#### **A. Schéma d'Authentification**

**Exécuter** le contenu de `database/auth-schema.sql` dans l'éditeur SQL :

```sql
-- Schéma d'authentification et profils clients pour Cyber Alerts

-- Table des profils clients
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_company_name ON client_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_client_profiles_industry ON client_profiles(industry);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_profiles_updated_at 
    BEFORE UPDATE ON client_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leur propre profil
CREATE POLICY "Users can view own profile" ON client_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON client_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leur propre profil
CREATE POLICY "Users can insert own profile" ON client_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### **B. Mise à Jour de la Table IOCs**

**Ajouter** la colonne `user_id` à la table `iocs` :

```sql
-- Ajouter la colonne user_id à la table iocs
ALTER TABLE iocs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_iocs_user_id ON iocs(user_id);

-- Activer RLS sur la table iocs
ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour la table iocs
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

### **3. Configuration des Variables d'Environnement**

#### **A. Créer le fichier `.env.local`**

```bash
# Dans le répertoire racine du projet
touch .env.local
```

#### **B. Ajouter les Variables Supabase**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### **C. Récupérer les Clés Supabase**

1. **Aller** dans Settings > API
2. **Copier** :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### **4. Test de l'Authentification**

#### **A. Redémarrer l'Application**

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

#### **B. Tester l'Inscription**

1. **Aller** sur `http://localhost:3000/register`
2. **Remplir** le formulaire d'inscription
3. **Vérifier** l'email de confirmation
4. **Confirmer** le compte

#### **C. Tester la Connexion**

1. **Aller** sur `http://localhost:3000/login`
2. **Se connecter** avec les identifiants
3. **Vérifier** la redirection vers le dashboard

---

## 🔧 **Résolution des Problèmes**

### **Problème 1 : Erreur de Connexion Supabase**

**Symptômes :**
- Erreur "fetch failed" dans la console
- Impossible de se connecter

**Solutions :**
1. **Vérifier** les variables d'environnement
2. **Redémarrer** l'application après modification
3. **Vérifier** que les clés Supabase sont correctes

### **Problème 2 : Politiques RLS Bloquantes**

**Symptômes :**
- Erreur "new row violates row-level security policy"
- Impossible d'insérer des données

**Solutions :**
1. **Vérifier** que les politiques RLS sont correctement créées
2. **S'assurer** que `auth.uid()` fonctionne
3. **Tester** avec un utilisateur authentifié

### **Problème 3 : Email de Confirmation Non Reçu**

**Symptômes :**
- Inscription réussie mais pas d'email
- Impossible de confirmer le compte

**Solutions :**
1. **Vérifier** les paramètres SMTP dans Supabase
2. **Configurer** un service SMTP externe si nécessaire
3. **Vérifier** les templates d'email

---

## 🎯 **Configuration Avancée**

### **1. Configuration SMTP Externe (Optionnel)**

Si les emails ne sont pas reçus, configurer un service SMTP :

1. **Aller** dans Authentication > Settings
2. **Section** : SMTP Settings
3. **Configurer** avec un service comme :
   - SendGrid
   - Mailgun
   - Amazon SES

### **2. Personnalisation des URLs de Redirection**

**Dans Authentication > Settings :**

```
Site URL: http://localhost:3000
Redirect URLs: 
- http://localhost:3000/login
- http://localhost:3000/reset-password
```

### **3. Configuration des Sessions**

**Dans Authentication > Settings :**

```
Session Timeout: 3600 (1 heure)
Refresh Token Rotation: Enabled
```

---

## ✅ **Validation de la Configuration**

### **Checklist de Validation**

- [ ] **Authentification activée** dans Supabase
- [ ] **Templates d'email** configurés
- [ ] **Scripts SQL** exécutés sans erreur
- [ ] **Variables d'environnement** configurées
- [ ] **Application redémarrée**
- [ ] **Inscription** fonctionne
- [ ] **Connexion** fonctionne
- [ ] **Déconnexion** fonctionne
- [ ] **Réinitialisation de mot de passe** fonctionne
- [ ] **Protection des routes** active

### **Test Complet**

1. **Créer** un compte test
2. **Se connecter** et naviguer dans l'application
3. **Configurer** des IOCs
4. **Vérifier** l'isolation des données
5. **Tester** la déconnexion
6. **Tester** la réinitialisation de mot de passe

---

## 🚀 **Déploiement en Production**

### **1. Variables d'Environnement de Production**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### **2. URLs de Redirection de Production**

```
Site URL: https://your-domain.com
Redirect URLs:
- https://your-domain.com/login
- https://your-domain.com/reset-password
```

### **3. Configuration SMTP de Production**

Utiliser un service SMTP professionnel pour les emails de confirmation.

---

**Après avoir suivi ces étapes, le système d'authentification sera complètement fonctionnel avec un style moderne et cohérent !** 🎉 