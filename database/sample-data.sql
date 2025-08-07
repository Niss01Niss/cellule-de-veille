-- Données de test pour la table cyber_alerts
-- Ces données contiennent des vulnérabilités qui peuvent correspondre aux IOCs

INSERT INTO cyber_alerts (summary, cvss, published, description) VALUES
-- Vulnérabilités liées aux IPs
('Vulnérabilité critique dans le serveur 192.168.1.1', 9.8, NOW() - INTERVAL '2 days', 'Une vulnérabilité critique a été découverte dans le serveur avec l''adresse IP 192.168.1.1. Cette vulnérabilité permet l''exécution de code à distance.'),
('Attaque DDoS détectée sur 10.0.0.1', 7.5, NOW() - INTERVAL '1 day', 'Une attaque DDoS massive a été détectée ciblant l''adresse IP 10.0.0.1. Le serveur a été temporairement indisponible.'),

-- Vulnérabilités liées aux serveurs
('Vulnérabilité dans Apache sur srv01.example.com', 8.2, NOW() - INTERVAL '3 days', 'Une vulnérabilité de type RCE a été découverte dans Apache sur le serveur srv01.example.com. Mise à jour urgente requise.'),
('Problème de sécurité sur web-server.company.com', 6.8, NOW() - INTERVAL '4 days', 'Le serveur web-server.company.com présente une vulnérabilité de type XSS qui pourrait permettre l''injection de code malveillant.'),

-- Vulnérabilités liées aux OS
('Vulnérabilité critique Windows 10 - CVE-2024-001', 9.1, NOW() - INTERVAL '5 days', 'Une vulnérabilité critique a été découverte dans Windows 10 permettant l''élévation de privilèges. Patch de sécurité disponible.'),
('Vulnérabilité Linux Ubuntu 20.04 - CVE-2024-002', 7.8, NOW() - INTERVAL '6 days', 'Une vulnérabilité dans le kernel Linux d''Ubuntu 20.04 permet l''accès non autorisé au système.'),
('Problème de sécurité macOS Monterey', 6.5, NOW() - INTERVAL '7 days', 'Une vulnérabilité dans macOS Monterey pourrait permettre l''accès aux données sensibles.'),

-- Vulnérabilités liées aux solutions de sécurité
('Vulnérabilité dans Antivirus Norton', 8.5, NOW() - INTERVAL '8 days', 'Une vulnérabilité critique a été découverte dans l''antivirus Norton permettant de désactiver la protection.'),
('Problème de sécurité Firewall Cisco', 7.2, NOW() - INTERVAL '9 days', 'Le firewall Cisco présente une vulnérabilité qui pourrait permettre le contournement des règles de sécurité.'),
('Vulnérabilité EDR CrowdStrike', 6.9, NOW() - INTERVAL '10 days', 'Une vulnérabilité dans l''EDR CrowdStrike pourrait permettre aux attaquants de masquer leurs activités.'),

-- Vulnérabilités mixtes
('Attaque combinée sur infrastructure critique', 9.5, NOW() - INTERVAL '11 days', 'Une attaque sophistiquée ciblant Windows 10 et les serveurs avec IP 192.168.1.1 a été détectée. Utilisation d''un malware avancé.'),
('Vulnérabilité dans l''écosystème de sécurité', 8.8, NOW() - INTERVAL '12 days', 'Une vulnérabilité affectant à la fois les firewalls et les serveurs Linux Ubuntu 20.04 a été découverte.'),

-- Vulnérabilités générales (pour comparaison)
('Vulnérabilité dans application web générique', 5.5, NOW() - INTERVAL '13 days', 'Une vulnérabilité de type SQL injection a été découverte dans une application web.'),
('Problème de configuration réseau', 4.2, NOW() - INTERVAL '14 days', 'Un problème de configuration réseau pourrait permettre l''accès non autorisé.'),
('Vulnérabilité dans protocole de communication', 6.1, NOW() - INTERVAL '15 days', 'Une vulnérabilité dans le protocole de communication pourrait permettre l''interception de données.');

-- Note: Ces données sont des exemples pour tester le dashboard personnalisé
-- Elles contiennent des mots-clés qui correspondent aux IOCs que les utilisateurs pourraient saisir 