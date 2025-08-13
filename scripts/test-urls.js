// Script pour tester la validité des URLs dans les données
const testUrls = [
  'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-001',
  'https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-001a',
  'https://nvd.nist.gov/vuln/detail/CVE-2025-002',
  'https://www.securityfocus.com/bid/2025-001',
  'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-003',
  'https://nvd.nist.gov/vuln/detail/CVE-2025-004',
  'https://www.securityfocus.com/bid/2025-002',
  'https://www.exploit-db.com/exploits/2025-001',
  'https://www.rapid7.com/db/modules/exploit/2025-001',
  'https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-001b',
  'https://www.malwarebytes.com/blog/threat-intelligence/2025/01/advanced-malware-attack',
  'https://www.symantec.com/blogs/threat-intelligence/ecosystem-vulnerability-2025',
  'https://owasp.org/www-project-top-ten/2025/',
  'https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-001c',
  'https://www.ietf.org/rfc/rfc2025.txt',
  'https://www.zerodayinitiative.com/advisories/ZDI-25-001',
  'https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-001d',
  'https://aws.amazon.com/security/security-bulletins/AWS-2025-001',
  'https://docs.docker.com/engine/security/'
];

console.log('🔍 Test des URLs dans les données d\'exemple...\n');

testUrls.forEach((url, index) => {
  try {
    const urlObj = new URL(url);
    console.log(`✅ URL ${index + 1}: ${url}`);
    console.log(`   Domaine: ${urlObj.hostname}`);
    console.log(`   Protocole: ${urlObj.protocol}`);
    console.log(`   Chemin: ${urlObj.pathname}`);
    if (urlObj.search) {
      console.log(`   Paramètres: ${urlObj.search}`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ URL ${index + 1} invalide: ${url}`);
    console.log(`   Erreur: ${error.message}\n`);
  }
});

console.log('📝 Note: Ces URLs sont des exemples pour les tests.');
console.log('   Certaines peuvent retourner 404 car elles sont fictives.');
console.log('   Pour un environnement de production, utilisez des URLs réelles.');
