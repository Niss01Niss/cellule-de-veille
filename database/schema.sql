-- Table pour les IOCs (Indicateurs de Compromission)
CREATE TABLE IF NOT EXISTS iocs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip TEXT,
    server TEXT,
    os TEXT,
    security_solutions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_iocs_created_at ON iocs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iocs_ip ON iocs(ip);
CREATE INDEX IF NOT EXISTS idx_iocs_server ON iocs(server);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_iocs_updated_at 
    BEFORE UPDATE ON iocs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - à activer selon vos besoins
-- ALTER TABLE iocs ENABLE ROW LEVEL SECURITY;

-- Politique RLS basique (à adapter selon vos besoins)
-- CREATE POLICY "Enable read access for all users" ON iocs FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON iocs FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON iocs FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON iocs FOR DELETE USING (true); 