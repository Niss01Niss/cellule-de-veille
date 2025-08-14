-- Script pour créer la table 'profiles' manquante
-- Cette table est attendue par Supabase pour l'authentification

-- Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


COMMENT ON TABLE public.profiles IS 'Profils utilisateur par défaut pour Supabase Auth';
COMMENT ON COLUMN public.profiles.id IS 'ID utilisateur (référence auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'Email de utilisateur';
COMMENT ON COLUMN public.profiles.full_name IS 'Nom complet de utilisateur';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de avatar';
COMMENT ON COLUMN public.profiles.updated_at IS 'Date de dernière modification';
COMMENT ON COLUMN public.profiles.created_at IS 'Date de création';


CREATE TABLE IF NOT EXISTS public.cyber_alerts (
    id SERIAL PRIMARY KEY,
    summary TEXT,
    published TIMESTAMP,
    cvss DECIMAL,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activez RLS (Row Level Security)
ALTER TABLE public.cyber_alerts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (développement)
CREATE POLICY "Allow all operations" ON public.cyber_alerts 
FOR ALL USING (true);

-- =====================================================
-- SCHÉMA DE BASE DE DONNÉES POUR LA SÉCURITÉ
-- Cyber Alerts - Plateforme de Veille Cybersécurité
-- =====================================================

-- Table des logs de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('CRITICAL', 'WARNING', 'INFO', 'DEBUG')),
    event VARCHAR(100) NOT NULL,
    details TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_level ON security_logs(level);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_risk_score ON security_logs(risk_score);

-- Table pour l'authentification multi-facteurs (MFA)
CREATE TABLE IF NOT EXISTS user_mfa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    totp_secret VARCHAR(100) NOT NULL,
    backup_codes JSONB NOT NULL DEFAULT '[]',
    enabled BOOLEAN DEFAULT false NOT NULL,
    enabled_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour MFA
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON user_mfa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON user_mfa(enabled);

-- Table des politiques de sécurité
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('password', 'session', 'mfa', 'ip_whitelist', 'ip_blacklist')),
    config JSONB NOT NULL DEFAULT '{}',
    enabled BOOLEAN DEFAULT true NOT NULL,
    priority INTEGER DEFAULT 0 CHECK (priority >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des sessions de sécurité
CREATE TABLE IF NOT EXISTS security_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Index pour les sessions
CREATE INDEX IF NOT EXISTS idx_security_sessions_user_id ON security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_token ON security_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_security_sessions_expires_at ON security_sessions(expires_at);

-- Table des tentatives d'authentification
CREATE TABLE IF NOT EXISTS auth_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_type VARCHAR(50) NOT NULL CHECK (attempt_type IN ('login', 'register', 'password_reset', 'mfa')),
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les tentatives d'auth
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_address ON auth_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created_at ON auth_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_success ON auth_attempts(success);

-- Table des IPs bloquées
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL UNIQUE,
    reason VARCHAR(255) NOT NULL,
    blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Index pour les IPs bloquées
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_is_active ON blocked_ips(is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires_at ON blocked_ips(expires_at);

-- Table des alertes de sécurité
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100),
    source_id UUID,
    metadata JSONB DEFAULT '{}',
    acknowledged BOOLEAN DEFAULT false NOT NULL,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les alertes
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON security_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);

-- Table des audits de sécurité
CREATE TABLE IF NOT EXISTS security_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('user', 'role', 'permission', 'data', 'system')),
    target_id UUID,
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les audits
CREATE INDEX IF NOT EXISTS idx_security_audits_type ON security_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_security_audits_target ON security_audits(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_security_audits_performed_by ON security_audits(performed_by);
CREATE INDEX IF NOT EXISTS idx_security_audits_created_at ON security_audits(created_at);

-- Table des vulnérabilités connues
CREATE TABLE IF NOT EXISTS known_vulnerabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cve_id VARCHAR(20) UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    cvss_score DECIMAL(3,1) CHECK (cvss_score >= 0.0 AND cvss_score <= 10.0),
    affected_components TEXT[],
    remediation TEXT,
    external_references JSONB DEFAULT '[]',
    published_date DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Index pour les vulnérabilités
CREATE INDEX IF NOT EXISTS idx_known_vulnerabilities_cve_id ON known_vulnerabilities(cve_id);
CREATE INDEX IF NOT EXISTS idx_known_vulnerabilities_severity ON known_vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_known_vulnerabilities_cvss_score ON known_vulnerabilities(cvss_score);

-- Table des incidents de sécurité
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    incident_type VARCHAR(100),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    affected_users INTEGER DEFAULT 0,
    affected_systems TEXT[],
    root_cause TEXT,
    resolution TEXT,
    lessons_learned TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les incidents
CREATE INDEX IF NOT EXISTS idx_security_incidents_number ON security_incidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assigned_to ON security_incidents(assigned_to);

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON security_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_alerts_updated_at BEFORE UPDATE ON security_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un numéro d'incident
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.incident_number := 'INC-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(CAST(nextval('incident_seq') AS TEXT), 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Séquence pour les numéros d'incident
CREATE SEQUENCE IF NOT EXISTS incident_seq START 1;

-- Trigger pour générer le numéro d'incident
CREATE TRIGGER generate_incident_number_trigger BEFORE INSERT ON security_incidents FOR EACH ROW EXECUTE FUNCTION generate_incident_number();

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Politiques pour les admins (accès complet)
CREATE POLICY "Admins have full access to security data" ON security_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to MFA data" ON user_mfa
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to security policies" ON security_policies
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques pour les utilisateurs (accès limité)
CREATE POLICY "Users can view their own security logs" ON security_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own MFA data" ON user_mfa
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA data" ON user_mfa
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insérer des politiques de sécurité par défaut
INSERT INTO security_policies (name, description, policy_type, config, priority) VALUES
('Password Policy', 'Politique de mots de passe par défaut', 'password', '{"minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumbers": true, "requireSpecialChars": true, "maxAge": 90}', 1),
('Session Policy', 'Politique de sessions par défaut', 'session', '{"maxDuration": 24, "inactivityTimeout": 30, "maxConcurrentSessions": 3}', 2),
('MFA Policy', 'Politique MFA par défaut', 'mfa', '{"enabled": true, "requiredForAdmins": true, "backupCodesCount": 10}', 3)
ON CONFLICT (name) DO NOTHING;

-- Insérer des vulnérabilités connues d'exemple
INSERT INTO known_vulnerabilities (cve_id, title, description, severity, cvss_score, affected_components, remediation, external_references) VALUES
('CVE-2023-1234', 'Vulnérabilité XSS dans l''interface web', 'Cross-site scripting dans le formulaire de connexion', 'HIGH', 8.5, ARRAY['web-interface', 'login-form'], 'Mettre à jour vers la version 2.1.0', '["https://example.com/xss-info"]'),
('CVE-2023-5678', 'Injection SQL dans l''API', 'Vulnérabilité d''injection SQL dans les requêtes utilisateur', 'CRITICAL', 9.8, ARRAY['api', 'user-queries'], 'Utiliser des requêtes préparées', '["https://example.com/sql-info"]')
ON CONFLICT (cve_id) DO NOTHING;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue des métriques de sécurité
CREATE OR REPLACE VIEW security_metrics AS
SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE level = 'CRITICAL') as critical_events,
    COUNT(*) FILTER (WHERE level = 'WARNING') as warning_events,
    COUNT(*) FILTER (WHERE level = 'INFO') as info_events,
    COUNT(*) FILTER (WHERE level = 'DEBUG') as debug_events,
    AVG(risk_score) as avg_risk_score,
    MAX(risk_score) as max_risk_score,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as unique_users
FROM security_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours';

-- Vue des alertes non traitées
CREATE OR REPLACE VIEW unacknowledged_alerts AS
SELECT 
    id,
    alert_type,
    severity,
    title,
    description,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_creation
FROM security_alerts
WHERE acknowledged = false
ORDER BY severity DESC, created_at ASC;

-- Vue des sessions actives
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.ip_address,
    s.created_at,
    s.last_activity,
    s.expires_at,
    EXTRACT(EPOCH FROM (s.expires_at - NOW()))/3600 as hours_remaining
FROM security_sessions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.is_active = true AND s.expires_at > NOW()
ORDER BY s.last_activity DESC;

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE security_logs IS 'Logs de sécurité pour audit et détection d''intrusion';
COMMENT ON TABLE user_mfa IS 'Configuration MFA pour les utilisateurs';
COMMENT ON TABLE security_policies IS 'Politiques de sécurité configurables';
COMMENT ON TABLE security_sessions IS 'Sessions de sécurité actives';
COMMENT ON TABLE auth_attempts IS 'Historique des tentatives d''authentification';
COMMENT ON TABLE blocked_ips IS 'IPs bloquées pour sécurité';
COMMENT ON TABLE security_alerts IS 'Alertes de sécurité générées automatiquement';
COMMENT ON TABLE security_audits IS 'Audit des actions de sécurité';
COMMENT ON TABLE known_vulnerabilities IS 'Base de données des vulnérabilités connues';
COMMENT ON TABLE security_incidents IS 'Gestion des incidents de sécurité';

COMMENT ON COLUMN security_logs.risk_score IS 'Score de risque de 0 à 100';
COMMENT ON COLUMN security_logs.metadata IS 'Données supplémentaires au format JSON';
COMMENT ON COLUMN user_mfa.backup_codes IS 'Codes de sauvegarde au format JSON';
COMMENT ON COLUMN security_policies.config IS 'Configuration de la politique au format JSON';
COMMENT ON COLUMN security_sessions.metadata IS 'Métadonnées de session au format JSON';

-- Script pour créer la table 'profiles' manquante
-- Cette table est attendue par Supabase pour l'authentification

-- Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insérer des données de test si nécessaire
-- INSERT INTO public.profiles (id, email, full_name) VALUES 
-- ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Test User');

COMMENT ON TABLE public.profiles IS 'Profils utilisateur par défaut pour Supabase Auth';
COMMENT ON COLUMN public.profiles.id IS 'ID utilisateur (référence auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'Email de utilisateur';
COMMENT ON COLUMN public.profiles.full_name IS 'Nom complet de utilisateur';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de avatar';
COMMENT ON COLUMN public.profiles.updated_at IS 'Date de dernière modification';
COMMENT ON COLUMN public.profiles.created_at IS 'Date de création'; 

-- Ajouter la colonne user_id
ALTER TABLE iocs 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_iocs_user_id ON iocs(user_id);

-- Activer RLS si pas déjà fait
ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques RLS
DROP POLICY IF EXISTS "Users can view own iocs" ON iocs;
DROP POLICY IF EXISTS "Users can insert own iocs" ON iocs;
DROP POLICY IF EXISTS "Users can update own iocs" ON iocs;
DROP POLICY IF EXISTS "Users can delete own iocs" ON iocs;

CREATE POLICY "Users can view own iocs" ON iocs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own iocs" ON iocs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own iocs" ON iocs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own iocs" ON iocs
    FOR DELETE USING (auth.uid() = user_id);

-- Si vous avez des données existantes, vous pouvez les associer à un utilisateur test
-- UPDATE iocs SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Par email
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'n.amesjoun@edu.umi.ac.ma';

-- Ou par UID
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'b12c7ecb-329d-42d4-848b-dae18df0927a';

-- Pour autoriser l'insertion sur la table iocs
create policy "Allow insert for authenticated users"
  on iocs
  for insert
  with check (auth.uid() = user_id);