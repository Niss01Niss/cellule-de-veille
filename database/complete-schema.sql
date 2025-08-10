-- =====================================================
-- SCHEMA COMPLET POUR CYBER ALERTS DASHBOARD
-- =====================================================

-- 1. TABLE DES PROFILS CLIENTS
-- =====================================================
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

-- Index pour client_profiles
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_company_name ON client_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_client_profiles_industry ON client_profiles(industry);

-- 2. TABLE DES IOCs AVEC USER_ID
-- =====================================================
CREATE TABLE IF NOT EXISTS iocs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip TEXT,
    server TEXT,
    os TEXT,
    security_solutions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour iocs
CREATE INDEX IF NOT EXISTS idx_iocs_user_id ON iocs(user_id);
CREATE INDEX IF NOT EXISTS idx_iocs_created_at ON iocs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iocs_ip ON iocs(ip);
CREATE INDEX IF NOT EXISTS idx_iocs_server ON iocs(server);

-- 3. TABLE DES ALERTES CYBER (si elle n'existe pas)
-- =====================================================
CREATE TABLE IF NOT EXISTS cyber_alerts (
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

-- Index pour cyber_alerts
CREATE INDEX IF NOT EXISTS idx_cyber_alerts_published ON cyber_alerts(published DESC);
CREATE INDEX IF NOT EXISTS idx_cyber_alerts_severity ON cyber_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_cyber_alerts_cvss_score ON cyber_alerts(cvss_score DESC);

-- 4. FONCTION POUR MISE À JOUR AUTOMATIQUE
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================
CREATE TRIGGER update_client_profiles_updated_at 
    BEFORE UPDATE ON client_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iocs_updated_at 
    BEFORE UPDATE ON iocs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;

-- Politiques pour client_profiles
CREATE POLICY "Users can view own profile" ON client_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON client_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON client_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour iocs
CREATE POLICY "Users can view own IOCs" ON iocs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own IOCs" ON iocs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own IOCs" ON iocs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own IOCs" ON iocs
    FOR DELETE USING (auth.uid() = user_id);

-- 7. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir les statistiques d'un client
CREATE OR REPLACE FUNCTION get_client_stats(user_uuid UUID)
RETURNS TABLE(
    total_iocs BIGINT,
    total_alerts BIGINT,
    critical_alerts BIGINT,
    high_alerts BIGINT,
    medium_alerts BIGINT,
    low_alerts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM iocs WHERE user_id = user_uuid) as total_iocs,
        (SELECT COUNT(*) FROM cyber_alerts) as total_alerts,
        (SELECT COUNT(*) FROM cyber_alerts WHERE severity = 'Critical') as critical_alerts,
        (SELECT COUNT(*) FROM cyber_alerts WHERE severity = 'High') as high_alerts,
        (SELECT COUNT(*) FROM cyber_alerts WHERE severity = 'Medium') as medium_alerts,
        (SELECT COUNT(*) FROM cyber_alerts WHERE severity = 'Low') as low_alerts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier l'accès utilisateur
CREATE OR REPLACE FUNCTION check_user_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM client_profiles WHERE user_id = user_uuid AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. DONNÉES DE TEST (optionnel)
-- =====================================================

-- Insérer quelques alertes de test si la table est vide
INSERT INTO cyber_alerts (title, summary, description, cvss_score, severity, published, source, cve_id, affected_products, remediation)
SELECT 
    'Vulnerabilité critique dans Apache Log4j',
    'Une vulnérabilité de type Log4Shell permet l''exécution de code à distance',
    'Apache Log4j contient une vulnérabilité critique qui permet l''exécution de code à distance via des requêtes LDAP malveillantes.',
    10.0,
    'Critical',
    NOW() - INTERVAL '1 day',
    'CISA',
    'CVE-2021-44228',
    ARRAY['Apache Log4j', 'Java applications'],
    'Mettre à jour vers Log4j 2.17.0 ou plus récent'
WHERE NOT EXISTS (SELECT 1 FROM cyber_alerts LIMIT 1);

INSERT INTO cyber_alerts (title, summary, description, cvss_score, severity, published, source, cve_id, affected_products, remediation)
SELECT 
    'Vulnérabilité dans Windows Print Spooler',
    'Vulnérabilité d''élévation de privilèges dans le service d''impression Windows',
    'Le service Windows Print Spooler contient une vulnérabilité qui permet l''élévation de privilèges.',
    8.8,
    'High',
    NOW() - INTERVAL '2 days',
    'Microsoft',
    'CVE-2021-34527',
    ARRAY['Windows 10', 'Windows Server 2019', 'Windows Server 2022'],
    'Installer le patch de sécurité Microsoft KB5005010'
WHERE NOT EXISTS (SELECT 1 FROM cyber_alerts WHERE cve_id = 'CVE-2021-34527');

-- 9. VÉRIFICATION ET MESSAGES
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Schema Cyber Alerts créé avec succès!';
    RAISE NOTICE 'Tables créées: client_profiles, iocs, cyber_alerts';
    RAISE NOTICE 'RLS activé sur: client_profiles, iocs';
    RAISE NOTICE 'Index et triggers configurés';
    RAISE NOTICE 'Données de test insérées (si table vide)';
END $$; 