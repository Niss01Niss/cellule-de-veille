# Modification : Affichage de la Source au lieu de l'ID

## Résumé des modifications

Cette modification remplace l'affichage de l'ID par la source dans tous les dashboards, avec la source sous forme de lien cliquable.

## Fichiers modifiés

### 1. Base de données
- **`database/complete-schema.sql`** : Ajout du champ `source TEXT` à la table `cyber_alerts`
- **`database/add-source-field.sql`** : Script pour ajouter le champ source aux tables existantes
- **`database/sample-data.sql`** : Mise à jour des données d'exemple avec des sources

### 2. Composants React
- **`components/Dashboard.js`** : 
  - Changement du titre de colonne de "ID" vers "Source"
  - Remplacement de l'affichage `#{alert.id}` par un lien cliquable vers la source
  - Ajout de la source dans le modal de détails

## Fonctionnalités ajoutées

### Affichage de la source
- La colonne "Source" affiche maintenant un lien "Voir la source" au lieu de l'ID
- Si aucune source n'est disponible, affiche "Aucune source"
- Le lien s'ouvre dans un nouvel onglet avec `target="_blank"`

### Modal de détails
- Ajout d'une section "Source" dans le modal de détails
- Affichage de l'URL complète de la source
- Lien cliquable vers la source

### Styling
- Liens en bleu avec effet hover
- Support du mode sombre
- Transitions fluides

## Instructions de déploiement

### 1. Mise à jour de la base de données
Exécutez le script SQL dans votre base de données Supabase :

```sql
-- Exécutez le contenu du fichier database/add-source-field.sql
```

### 2. Redémarrage de l'application
Après avoir mis à jour la base de données, redémarrez votre application Next.js :

```bash
npm run dev
```

## Sources utilisées dans les données d'exemple

Les données d'exemple utilisent des sources réelles de cybersécurité :
- CVE Mitre : https://cve.mitre.org/
- NVD : https://nvd.nist.gov/
- SecurityFocus : https://www.securityfocus.com/
- Exploit-DB : https://www.exploit-db.com/
- Rapid7 : https://www.rapid7.com/
- CISA : https://www.cisa.gov/
- Et d'autres sources de confiance

## Compatibilité

- ✅ Dashboard principal
- ✅ Modal de détails
- ✅ Mode sombre/clair
- ✅ Responsive design
- ✅ Accessibilité (attributs `rel="noopener noreferrer"`)

## Notes techniques

- Le champ `source` est optionnel dans la base de données
- Gestion gracieuse des alertes sans source
- Liens externes sécurisés avec `target="_blank"` et `rel="noopener noreferrer"`
- Support complet du mode sombre
