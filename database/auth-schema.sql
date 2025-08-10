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

-- Table des sessions utilisateur (optionnel, pour le suivi)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index pour les sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- RLS pour les sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques d'un client
CREATE OR REPLACE FUNCTION get_client_stats(client_user_id UUID)
RETURNS TABLE (
    total_iocs INTEGER,
    total_alerts INTEGER,
    relevant_alerts INTEGER,
    critical_alerts INTEGER,
    high_alerts INTEGER,
    medium_alerts INTEGER,
    low_alerts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(ioc_count.count, 0) as total_iocs,
        COALESCE(alert_count.count, 0) as total_alerts,
        COALESCE(relevant_count.count, 0) as relevant_alerts,
        COALESCE(critical_count.count, 0) as critical_alerts,
        COALESCE(high_count.count, 0) as high_alerts,
        COALESCE(medium_count.count, 0) as medium_alerts,
        COALESCE(low_count.count, 0) as low_alerts
    FROM 
        (SELECT COUNT(*) as count FROM iocs WHERE user_id = client_user_id) ioc_count,
        (SELECT COUNT(*) as count FROM cyber_alerts) alert_count,
        (SELECT COUNT(*) as count FROM cyber_alerts ca 
         JOIN iocs i ON i.user_id = client_user_id 
         WHERE ca.summary ILIKE '%' || i.ip || '%' 
            OR ca.summary ILIKE '%' || i.server || '%' 
            OR ca.summary ILIKE '%' || i.os || '%' 
            OR ca.summary ILIKE '%' || i.security_solutions || '%') relevant_count,
        (SELECT COUNT(*) as count FROM cyber_alerts WHERE cvss >= 9) critical_count,
        (SELECT COUNT(*) as count FROM cyber_alerts WHERE cvss >= 7 AND cvss < 9) high_count,
        (SELECT COUNT(*) as count FROM cyber_alerts WHERE cvss >= 4 AND cvss < 7) medium_count,
        (SELECT COUNT(*) as count FROM cyber_alerts WHERE cvss < 4) low_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a accès à une ressource
CREATE OR REPLACE FUNCTION check_user_access(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vues pour faciliter l'accès aux données
CREATE OR REPLACE VIEW client_dashboard_data AS
SELECT 
    cp.id as profile_id,
    cp.user_id,
    cp.company_name,
    cp.contact_name,
    cp.industry,
    cp.subscription_plan,
    cp.created_at as client_since,
    COUNT(i.id) as total_iocs,
    COUNT(ca.id) as total_alerts
FROM client_profiles cp
LEFT JOIN iocs i ON i.user_id = cp.user_id
LEFT JOIN cyber_alerts ca ON 1=1
WHERE cp.is_active = true
GROUP BY cp.id, cp.user_id, cp.company_name, cp.contact_name, cp.industry, cp.subscription_plan, cp.created_at;

-- RLS pour la vue
ALTER VIEW client_dashboard_data SET (security_invoker = true);

-- Politique pour la vue
CREATE POLICY "Users can view own dashboard data" ON client_dashboard_data
    FOR SELECT USING (auth.uid() = user_id);

-- Commentaires pour la documentation
COMMENT ON TABLE client_profiles IS 'Profils des clients avec informations d''entreprise';
COMMENT ON TABLE user_sessions IS 'Sessions utilisateur pour le suivi et la sécurité';
COMMENT ON FUNCTION get_client_stats(UUID) IS 'Récupère les statistiques personnalisées d''un client';
COMMENT ON FUNCTION check_user_access(UUID) IS 'Vérifie si un utilisateur a accès à une ressource';
COMMENT ON VIEW client_dashboard_data IS 'Vue agrégée des données client pour le dashboard'; 