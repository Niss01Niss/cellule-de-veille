# 🗄️ Configuration de la Base de Données Supabase

## 🚨 **Erreur : "Database error saving new user"**

Cette erreur se produit car les tables nécessaires n'existent pas encore dans votre base de données Supabase.

---

## 🔧 **Solution : Créer les Tables**

### **Étape 1 : Aller dans Supabase Dashboard**

1. **Ouvrir** votre navigateur
2. **Aller** sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
3. **Se connecter** à votre compte
4. **Sélectionner** votre projet : `inyhyarcyzfuesadggqa`

### **Étape 2 : Ouvrir l'Éditeur SQL**

1. **Dans le menu de gauche**, cliquer sur **"SQL Editor"**
2. **Cliquer** sur **"New query"**

### **Étape 3 : Exécuter le Script**

1. **Copier** tout le contenu du fichier `database/complete-schema.sql`
2. **Coller** dans l'éditeur SQL
3. **Cliquer** sur **"Run"** (bouton play)

### **Étape 4 : Vérifier la Création**

Après exécution, vous devriez voir :
- ✅ **3 tables créées** : `client_profiles`, `iocs`, `cyber_alerts`
- ✅ **Index créés** pour les performances
- ✅ **RLS activé** pour la sécurité
- ✅ **Politiques de sécurité** configurées

---

## 📋 **Tables Créées**

### **1. `client_profiles`**
- Stocke les informations des clients
- Liée à `auth.users` via `user_id`
- RLS activé pour l'isolation des données

### **2. `iocs`**
- Stocke les indicateurs de compromission
- Colonne `user_id` ajoutée pour l'isolation
- RLS activé pour la sécurité

### **3. `cyber_alerts`**
- Stocke les alertes de sécurité
- Données partagées entre tous les utilisateurs
- Pas de RLS (données publiques)

---

## ✅ **Test Après Configuration**

1. **Retourner** sur votre application : `http://localhost:3001`
2. **Aller** sur `/register`
3. **Créer** un compte test
4. **Vérifier** qu'aucune erreur n'apparaît

---

## 🚨 **Si l'Erreur Persiste**

### **Vérifier les Logs Supabase**

1. **Aller** dans **"Logs"** dans le menu Supabase
2. **Vérifier** les erreurs récentes
3. **S'assurer** que les tables sont créées

### **Vérifier l'Authentification**

1. **Aller** dans **"Authentication"** > **"Settings"**
2. **Activer** :
   - ✅ Enable sign up
   - ✅ Enable email confirmations
   - ✅ Enable password reset

---

## 🎯 **Résultat Attendu**

Après configuration :
- ✅ **Inscription** sans erreur
- ✅ **Profil client** créé automatiquement
- ✅ **Connexion** fonctionnelle
- ✅ **Données isolées** par utilisateur

**Votre système d'authentification sera complètement fonctionnel !** 🎉 