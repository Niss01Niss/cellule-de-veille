# 🔄 Mise à Jour des Données de Test

## 🎯 **Objectif**

Mettre à jour les données d'exemple dans Supabase pour tester correctement le système d'authentification et les correspondances IOCs/Vulnérabilités.

---

## 📋 **Étapes à Suivre**

### **1. Accéder à Supabase**

1. **Ouvrir** votre projet Supabase
2. **Aller** dans l'onglet "SQL Editor"
3. **Créer** une nouvelle requête

### **2. Exécuter le Script de Mise à Jour**

**Copier et coller** le contenu du fichier `database/sample-data-updated.sql` dans l'éditeur SQL :

```sql
-- Données d'exemple mises à jour pour tester le système d'authentification et les correspondances IOCs
-- Ces données correspondent aux IOCs typiques que les clients pourraient configurer

-- Supprimer les anciennes données
DELETE FROM cyber_alerts;

-- Insérer des vulnérabilités qui correspondent aux IOCs courants
INSERT INTO cyber_alerts (id, summary, description, cvss, published) VALUES
-- Vulnérabilités Ubuntu 22.04
('1', 'Critical vulnerability in Ubuntu 22.04 affecting system security', 'A critical vulnerability has been discovered in Ubuntu 22.04 systems that could allow remote code execution through a buffer overflow in the kernel module.', 9.5, '2025-01-15 10:00:00'),
('2', 'Ubuntu 22.04 package manager vulnerability', 'Security flaw in Ubuntu 22.04 package manager allows privilege escalation when installing packages from untrusted sources.', 8.2, '2025-01-14 15:30:00'),

-- Vulnérabilités Bitdefender
('3', 'Bitdefender 2025 security bypass vulnerability', 'Researchers found a way to bypass Bitdefender 2025 security measures on Windows systems through a kernel-level exploit.', 8.8, '2025-01-14 12:15:00'),
('4', 'Bitdefender 2025 false positive issue', 'Bitdefender 2025 is incorrectly flagging legitimate system files as malware, causing system instability.', 6.5, '2025-01-13 09:45:00'),

-- Vulnérabilités Palo Alto
('5', 'Palo Alto firewall configuration vulnerability', 'Critical configuration vulnerability in Palo Alto firewalls that could allow unauthorized access to internal networks.', 9.1, '2025-01-12 14:20:00'),
('6', 'Palo Alto GlobalProtect VPN security issue', 'Security flaw in Palo Alto GlobalProtect VPN allows attackers to bypass authentication and access corporate networks.', 8.5, '2025-01-11 16:30:00'),

-- Vulnérabilités Linux générales
('7', 'Linux kernel privilege escalation vulnerability', 'New vulnerability in Linux kernel allows local users to escalate privileges and gain root access.', 7.8, '2025-01-10 11:20:00'),
('8', 'Linux systemd service vulnerability', 'Security issue in Linux systemd allows attackers to execute arbitrary code through service manipulation.', 7.2, '2025-01-09 13:45:00'),

-- Vulnérabilités Windows (non pertinentes pour les IOCs Linux)
('9', 'Windows 11 security bypass vulnerability', 'Critical vulnerability in Windows 11 allows attackers to bypass security measures and gain system access.', 8.9, '2025-01-08 10:15:00'),
('10', 'Windows Defender false positive issue', 'Windows Defender is incorrectly identifying legitimate software as malicious, causing system issues.', 5.5, '2025-01-07 14:30:00'),

-- Vulnérabilités macOS (non pertinentes)
('11', 'macOS Sonoma security vulnerability', 'Security flaw in macOS Sonoma allows attackers to bypass Gatekeeper and execute malicious code.', 7.5, '2025-01-06 09:20:00'),
('12', 'macOS Safari browser vulnerability', 'Critical vulnerability in macOS Safari allows remote code execution through malicious websites.', 8.1, '2025-01-05 15:45:00'),

-- Vulnérabilités réseau générales
('13', 'Network protocol vulnerability affecting multiple systems', 'Security flaw in common network protocols affects various operating systems and network devices.', 6.8, '2025-01-04 12:10:00'),
('14', 'DNS amplification attack vulnerability', 'Vulnerability in DNS servers allows attackers to perform amplification attacks against target networks.', 7.3, '2025-01-03 16:25:00'),

-- Vulnérabilités cloud (non pertinentes pour IOCs locaux)
('15', 'AWS EC2 instance security vulnerability', 'Critical vulnerability in AWS EC2 instances allows unauthorized access to customer data.', 8.7, '2025-01-02 11:35:00'),
('16', 'Azure Active Directory security issue', 'Security flaw in Azure Active Directory allows attackers to bypass authentication mechanisms.', 8.4, '2025-01-01 13:50:00');
```

### **3. Vérifier les Données**

**Exécuter** cette requête pour vérifier que les données ont été insérées correctement :

```sql
SELECT 
    id,
    summary,
    cvss,
    published,
    CASE 
        WHEN summary ILIKE '%ubuntu%' OR summary ILIKE '%linux%' THEN 'Linux/Ubuntu'
        WHEN summary ILIKE '%bitdefender%' THEN 'Bitdefender'
        WHEN summary ILIKE '%palo%' OR summary ILIKE '%alto%' THEN 'Palo Alto'
        WHEN summary ILIKE '%windows%' THEN 'Windows'
        WHEN summary ILIKE '%macos%' OR summary ILIKE '%safari%' THEN 'macOS'
        ELSE 'Autre'
    END as category
FROM cyber_alerts 
ORDER BY published DESC;
```

---

## 🧪 **Test des Correspondances**

### **IOCs de Test Recommandés**

Pour tester le système, configurez ces IOCs dans l'application :

```json
{
  "ip": "192.168.1.100",
  "server": "Ubuntu 22.04",
  "os": "Linux",
  "security_solutions": "Bitdefender 2025, Palo Alto"
}
```

### **Résultats Attendus**

Avec ces IOCs, le dashboard personnalisé devrait afficher :

#### **Vulnérabilités Pertinentes (8 vulnérabilités) :**
1. **Ubuntu 22.04** (2 vulnérabilités)
2. **Bitdefender 2025** (2 vulnérabilités)
3. **Palo Alto** (2 vulnérabilités)
4. **Linux général** (2 vulnérabilités)

#### **Vulnérabilités Non Pertinentes (8 vulnérabilités) :**
- Windows (2 vulnérabilités)
- macOS (2 vulnérabilités)
- Réseau général (2 vulnérabilités)
- Cloud (2 vulnérabilités)

---

## 📊 **Statistiques Attendues**

### **Avec les IOCs de Test :**
- **IOCs Configurés** : 1
- **Total Alertes** : 16
- **Vulnérabilités Pertinentes** : 8
- **Critiques/Élevées** : 6
- **Taux de Pertinence** : 50%

### **Répartition par Sévérité :**
- **Critique** (CVSS ≥ 9) : 3 vulnérabilités
- **Élevé** (CVSS 7-8.9) : 3 vulnérabilités
- **Moyen** (CVSS 4-6.9) : 2 vulnérabilités
- **Faible** (CVSS < 4) : 0 vulnérabilités

---

## 🔧 **Configuration du Système d'Authentification**

### **1. Exécuter le Schéma d'Authentification**

**Exécuter** le contenu du fichier `database/auth-schema.sql` dans Supabase :

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

-- ... (reste du script)
```

### **2. Configurer l'Authentification Supabase**

1. **Aller** dans "Authentication" > "Settings"
2. **Activer** "Enable email confirmations"
3. **Configurer** les templates d'email
4. **Vérifier** que "Enable sign up" est activé

---

## 🎯 **Test Complet**

### **1. Test de l'Authentification**
1. **Accéder** à `/register`
2. **Créer** un compte test
3. **Vérifier** l'email de confirmation
4. **Se connecter** à `/login`
5. **Vérifier** la redirection vers le dashboard

### **2. Test du Dashboard Personnalisé**
1. **Configurer** les IOCs de test
2. **Vérifier** que seules les vulnérabilités pertinentes s'affichent
3. **Vérifier** les statistiques
4. **Tester** la pagination
5. **Tester** le filtre par date

### **3. Test de l'Isolation des Données**
1. **Créer** un second compte test
2. **Configurer** des IOCs différents
3. **Vérifier** que les données sont isolées
4. **Tester** la déconnexion

---

## 🚨 **Résolution des Problèmes**

### **Si les correspondances ne fonctionnent pas :**
1. **Vérifier** que les données ont été insérées correctement
2. **Vérifier** que les IOCs sont configurés exactement comme indiqué
3. **Vérifier** la console du navigateur pour les erreurs
4. **Redémarrer** le serveur de développement

### **Si l'authentification ne fonctionne pas :**
1. **Vérifier** les variables d'environnement Supabase
2. **Vérifier** que le schéma d'authentification a été exécuté
3. **Vérifier** les politiques RLS
4. **Vérifier** les logs Supabase

---

**Après avoir suivi ces étapes, le système devrait fonctionner correctement avec des correspondances précises et un système d'authentification complet !** ✅ 