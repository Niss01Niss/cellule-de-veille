# 🔐 Système d'Authentification par Client - Guide Complet

## 🎯 **Vue d'ensemble**

Le système d'authentification par client permet à chaque entreprise d'avoir son propre espace sécurisé dans l'application Cyber Alerts. Chaque client peut gérer ses IOCs, consulter ses vulnérabilités personnalisées et accéder à ses statistiques exclusives.

---

## 🏗️ **Architecture du Système**

### **1. Authentification Supabase**
- **Provider** : Supabase Auth
- **Méthodes** : Email/Password
- **Sécurité** : JWT tokens, Row Level Security (RLS)
- **Sessions** : Gestion automatique des sessions

### **2. Profils Clients**
- **Table** : `client_profiles`
- **Données** : Informations d'entreprise, contact, secteur d'activité
- **Plan d'abonnement** : Système de niveaux (basic, premium, enterprise)

### **3. Isolation des Données**
- **RLS** : Chaque client ne voit que ses propres données
- **IOCs** : Liés à l'utilisateur connecté
- **Statistiques** : Calculées uniquement sur les données du client

---

## 📊 **Structure de Base de Données**

### **Table `client_profiles`**
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

### **Table `user_sessions`** (Optionnel)
```sql
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

---

## 🔧 **Composants Principaux**

### **1. AuthContext (`contexts/AuthContext.js`)**
```javascript
const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [clientProfile, setClientProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fonctions d'authentification
  const signUp = async (email, password, clientData) => { ... }
  const signIn = async (email, password) => { ... }
  const signOut = async () => { ... }
  const updateProfile = async (updates) => { ... }
  const resetPassword = async (email) => { ... }
}
```

### **2. ProtectedRoute (`components/ProtectedRoute.js`)**
```javascript
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Affichage conditionnel
  if (loading) return <LoadingSpinner />
  if (!user) return null
  return children
}
```

### **3. Pages d'Authentification**
- **`/login`** : Connexion utilisateur
- **`/register`** : Inscription nouveau client
- **`/forgot-password`** : Réinitialisation mot de passe
- **`/reset-password`** : Nouveau mot de passe

---

## 🎨 **Interface Utilisateur**

### **Page de Connexion (`/login`)**
- **Design** : Moderne avec support mode sombre
- **Validation** : Email et mot de passe requis
- **Fonctionnalités** :
  - Affichage/masquage du mot de passe
  - Messages d'erreur/succès
  - Lien vers inscription et mot de passe oublié
  - Redirection automatique après connexion

### **Page d'Inscription (`/register`)**
- **Formulaire complet** :
  - Email et mot de passe
  - Nom de l'entreprise
  - Contact principal
  - Téléphone
  - Secteur d'activité
- **Validation** :
  - Confirmation du mot de passe
  - Longueur minimale (6 caractères)
  - Email valide
- **Création automatique** du profil client

---

## 🔒 **Sécurité et Permissions**

### **Row Level Security (RLS)**
```sql
-- Politique pour les profils clients
CREATE POLICY "Users can view own profile" ON client_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON client_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON client_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### **Fonctions de Sécurité**
```sql
-- Vérification d'accès
CREATE FUNCTION check_user_access(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Statistiques client sécurisées
CREATE FUNCTION get_client_stats(client_user_id UUID)
RETURNS TABLE (...) AS $$
BEGIN
    -- Logique sécurisée pour récupérer les stats
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📈 **Intégration avec les Dashboards**

### **Dashboard Principal**
- **Accès** : Tous les clients connectés
- **Données** : Alertes générales + filtrage par IOCs du client
- **Personnalisation** : Basée sur les IOCs configurés

### **Dashboard Personnalisé**
- **Accès** : Client spécifique uniquement
- **Données** : Vulnérabilités pertinentes pour les IOCs du client
- **Statistiques** : Calculées uniquement sur les données du client

### **Page IOCs**
- **Isolation** : Chaque client ne voit que ses propres IOCs
- **CRUD** : Création, lecture, mise à jour, suppression
- **Validation** : Données spécifiques au client

---

## 🔄 **Flux d'Utilisation**

### **1. Inscription Nouveau Client**
```
1. Accès à /register
2. Remplissage du formulaire
3. Validation des données
4. Création du compte Supabase
5. Création automatique du profil client
6. Email de confirmation
7. Redirection vers /login
```

### **2. Connexion Client**
```
1. Accès à /login
2. Saisie email/mot de passe
3. Validation Supabase
4. Récupération du profil client
5. Redirection vers le dashboard
6. Chargement des données personnalisées
```

### **3. Utilisation de l'Application**
```
1. Navigation dans les dashboards
2. Configuration des IOCs
3. Consultation des vulnérabilités pertinentes
4. Mise à jour du profil si nécessaire
5. Déconnexion sécurisée
```

---

## 🛠️ **Configuration et Déploiement**

### **Variables d'Environnement**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Scripts SQL à Exécuter**
1. **`database/auth-schema.sql`** : Tables et politiques RLS
2. **`database/schema.sql`** : Table IOCs avec user_id
3. **`database/sample-data.sql`** : Données de test

### **Configuration Supabase**
1. **Authentication** : Activer Email/Password
2. **Database** : Exécuter les scripts SQL
3. **RLS** : Vérifier les politiques
4. **Email Templates** : Personnaliser les emails

---

## 📱 **Fonctionnalités Avancées**

### **1. Gestion des Sessions**
- **Suivi** : IP, User-Agent, durée de session
- **Nettoyage** : Suppression automatique des sessions expirées
- **Sécurité** : Détection de sessions suspectes

### **2. Plans d'Abonnement**
- **Basic** : Fonctionnalités de base
- **Premium** : Fonctionnalités avancées
- **Enterprise** : Support personnalisé

### **3. Notifications**
- **Email** : Alertes critiques, rapports
- **In-App** : Notifications en temps réel
- **SMS** : Alertes urgentes (optionnel)

### **4. Audit Trail**
- **Connexions** : Historique des connexions
- **Actions** : Log des modifications
- **Sécurité** : Détection d'anomalies

---

## 🎯 **Avantages du Système**

### **1. Sécurité**
- **Isolation** : Chaque client dans son propre espace
- **Authentification** : Supabase Auth sécurisé
- **RLS** : Protection au niveau base de données
- **Sessions** : Gestion sécurisée des sessions

### **2. Personnalisation**
- **Profil client** : Informations d'entreprise
- **IOCs spécifiques** : Configuration personnalisée
- **Statistiques** : Données adaptées à l'infrastructure
- **Interface** : Expérience utilisateur optimisée

### **3. Scalabilité**
- **Multi-tenancy** : Support de nombreux clients
- **Performance** : Requêtes optimisées
- **Évolutivité** : Ajout facile de fonctionnalités
- **Maintenance** : Gestion centralisée

### **4. Expérience Utilisateur**
- **Interface moderne** : Design responsive
- **Mode sombre** : Support complet
- **Navigation intuitive** : Parcours utilisateur optimisé
- **Feedback** : Messages d'erreur/succès clairs

---

## 🔮 **Évolutions Futures**

### **1. Authentification Multi-Facteurs**
- **SMS** : Code de vérification
- **Email** : Lien de confirmation
- **Authenticator** : Applications TOTP

### **2. Intégration SSO**
- **SAML** : Intégration avec Active Directory
- **OAuth** : Connexion via Google, Microsoft
- **LDAP** : Synchronisation avec annuaire

### **3. Gestion des Rôles**
- **Admin** : Gestion complète
- **Manager** : Gestion équipe
- **Analyst** : Consultation uniquement
- **Viewer** : Lecture seule

### **4. API REST**
- **Endpoints** : CRUD pour IOCs, alertes
- **Documentation** : Swagger/OpenAPI
- **Rate Limiting** : Protection contre l'abus
- **Webhooks** : Notifications en temps réel

---

## 📋 **Checklist de Déploiement**

### **Prérequis**
- [ ] Compte Supabase configuré
- [ ] Variables d'environnement définies
- [ ] Scripts SQL prêts

### **Base de Données**
- [ ] Exécution du schéma d'authentification
- [ ] Configuration des politiques RLS
- [ ] Test des fonctions de sécurité
- [ ] Insertion des données de test

### **Application**
- [ ] Configuration des providers
- [ ] Test des pages d'authentification
- [ ] Vérification de la protection des routes
- [ ] Test de l'isolation des données

### **Sécurité**
- [ ] Test des politiques RLS
- [ ] Vérification des sessions
- [ ] Test de la déconnexion
- [ ] Audit des permissions

---

**Le système d'authentification par client offre une solution complète, sécurisée et évolutive pour la gestion multi-utilisateurs de l'application Cyber Alerts.** 🚀 