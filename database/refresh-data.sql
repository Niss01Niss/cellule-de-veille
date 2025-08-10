-- Script pour nettoyer et recharger les données avec des dates récentes de 2025
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Nettoyer les données existantes
DELETE FROM cyber_alerts;

-- 2. Réinitialiser la séquence d'ID (si nécessaire)
-- ALTER SEQUENCE cyber_alerts_id_seq RESTART WITH 1;

-- 3. Insérer les nouvelles données récentes de 2025
INSERT INTO cyber_alerts (summary, cvss, published, description) VALUES
-- Vulnérabilités très récentes (derniers jours)
('Vulnérabilité critique dans le serveur 192.168.1.1', 9.8, '2025-01-15 14:30:00', 'Une vulnérabilité critique a été découverte dans le serveur avec l''adresse IP 192.168.1.1. Cette vulnérabilité permet l''exécution de code à distance.'),
('Attaque DDoS détectée sur 10.0.0.1', 7.5, '2025-01-14 09:15:00', 'Une attaque DDoS massive a été détectée ciblant l''adresse IP 10.0.0.1. Le serveur a été temporairement indisponible.'),

-- Vulnérabilités récentes (semaine en cours)
('Vulnérabilité dans Apache sur srv01.example.com', 8.2, '2025-01-13 16:45:00', 'Une vulnérabilité de type RCE a été découverte dans Apache sur le serveur srv01.example.com. Mise à jour urgente requise.'),
('Problème de sécurité sur web-server.company.com', 6.8, '2025-01-12 11:20:00', 'Le serveur web-server.company.com présente une vulnérabilité de type XSS qui pourrait permettre l''injection de code malveillant.'),

-- Vulnérabilités liées aux OS récents
('Vulnérabilité critique Windows 11 - CVE-2025-001', 9.1, '2025-01-11 13:30:00', 'Une vulnérabilité critique a été découverte dans Windows 11 permettant l''élévation de privilèges. Patch de sécurité disponible.'),
('Vulnérabilité Linux Ubuntu 22.04 - CVE-2025-002', 7.8, '2025-01-10 08:45:00', 'Une vulnérabilité dans le kernel Linux d''Ubuntu 22.04 permet l''accès non autorisé au système.'),
('Problème de sécurité macOS Sonoma', 6.5, '2025-01-09 15:20:00', 'Une vulnérabilité dans macOS Sonoma pourrait permettre l''accès aux données sensibles.'),

-- Vulnérabilités liées aux solutions de sécurité modernes
('Vulnérabilité dans Antivirus Bitdefender 2025', 8.5, '2025-01-08 10:30:00', 'Une vulnérabilité critique a été découverte dans l''antivirus Bitdefender 2025 permettant de désactiver la protection.'),
('Problème de sécurité Firewall Palo Alto', 7.2, '2025-01-07 14:15:00', 'Le firewall Palo Alto présente une vulnérabilité qui pourrait permettre le contournement des règles de sécurité.'),
('Vulnérabilité EDR SentinelOne', 6.9, '2025-01-06 12:00:00', 'Une vulnérabilité dans l''EDR SentinelOne pourrait permettre aux attaquants de masquer leurs activités.'),

-- Vulnérabilités mixtes récentes
('Attaque combinée sur infrastructure critique', 9.5, '2025-01-05 17:30:00', 'Une attaque sophistiquée ciblant Windows 11 et les serveurs avec IP 192.168.1.1 a été détectée. Utilisation d''un malware avancé.'),
('Vulnérabilité dans l''écosystème de sécurité', 8.8, '2025-01-04 09:45:00', 'Une vulnérabilité affectant à la fois les firewalls et les serveurs Linux Ubuntu 22.04 a été découverte.'),

-- Vulnérabilités générales récentes
('Vulnérabilité dans application web moderne', 5.5, '2025-01-03 16:20:00', 'Une vulnérabilité de type SQL injection a été découverte dans une application web moderne.'),
('Problème de configuration réseau avancé', 4.2, '2025-01-02 11:10:00', 'Un problème de configuration réseau pourrait permettre l''accès non autorisé.'),
('Vulnérabilité dans protocole de communication sécurisé', 6.1, '2025-01-01 13:00:00', 'Une vulnérabilité dans le protocole de communication sécurisé pourrait permettre l''interception de données.'),

-- Alertes très récentes (aujourd'hui et hier)
('Nouvelle vulnérabilité zero-day découverte', 9.9, '2025-01-16 08:00:00', 'Une vulnérabilité zero-day critique a été découverte affectant plusieurs systèmes. Patch en cours de développement.'),
('Attaque ransomware massive en cours', 9.7, '2025-01-16 10:30:00', 'Une attaque ransomware massive ciblant les infrastructures critiques est en cours. Recommandations de sécurité urgentes.'),
('Vulnérabilité dans le cloud AWS', 8.9, '2025-01-15 18:45:00', 'Une vulnérabilité critique a été découverte dans les services AWS. Mise à jour de sécurité requise immédiatement.'),
('Problème de sécurité dans Docker', 7.6, '2025-01-15 12:15:00', 'Une vulnérabilité dans Docker pourrait permettre l''échappement de conteneurs. Mise à jour recommandée.');

-- 4. Vérifier les données insérées
SELECT 
    id,
    summary,
    cvss,
    published,
    DATE(published) as date_only
FROM cyber_alerts 
ORDER BY published DESC 
LIMIT 10; 