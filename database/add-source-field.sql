-- Script pour ajouter le champ source à la table cyber_alerts
-- Exécutez ce script si la table existe déjà sans le champ source

-- Ajouter le champ source s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cyber_alerts' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE cyber_alerts ADD COLUMN source TEXT;
    END IF;
END $$;

-- Mettre à jour les données existantes avec des sources d'exemple
UPDATE cyber_alerts 
SET source = CASE 
    WHEN id::text LIKE '%1%' THEN 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-001'
    WHEN id::text LIKE '%2%' THEN 'https://nvd.nist.gov/vuln/detail/CVE-2025-002'
    WHEN id::text LIKE '%3%' THEN 'https://www.securityfocus.com/bid/2025-001'
    WHEN id::text LIKE '%4%' THEN 'https://www.exploit-db.com/exploits/2025-001'
    WHEN id::text LIKE '%5%' THEN 'https://www.rapid7.com/db/modules/exploit/2025-001'
    ELSE 'https://www.cisa.gov/news-events/cybersecurity-advisories'
END
WHERE source IS NULL;
