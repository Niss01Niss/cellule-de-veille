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

-- Vérifier les données insérées
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