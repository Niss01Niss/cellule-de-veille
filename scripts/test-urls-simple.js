// Script simple pour tester les URLs
console.log('🔍 Test des URLs...\n');

const urls = [
  'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2025-001',
  'https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-001a',
  'https://nvd.nist.gov/vuln/detail/CVE-2025-002'
];

urls.forEach((url, index) => {
  console.log(`URL ${index + 1}: ${url}`);
  
  // Test simple de validation d'URL
  if (url.startsWith('https://') || url.startsWith('http://')) {
    console.log('✅ URL valide (format correct)');
  } else {
    console.log('❌ URL invalide (format incorrect)');
  }
  
  console.log('');
});

console.log('📝 Note: Ces URLs sont des exemples pour les tests.');
console.log('   Certaines peuvent retourner 404 car elles sont fictives.');
