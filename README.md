# Cyber Alerts Dashboard

## Fonctionnalités principales

- **Dashboard filtré par IOCs** : Le dashboard principal n'affiche que les vulnérabilités en lien avec les IOCs saisis par le client (IP, serveur, OS, solutions de sécurité). Si aucune vulnérabilité ne correspond, le tableau reste vide.
- **Dashboard personnalisé** : Vue avancée avec scoring de pertinence, graphiques, et correspondances détaillées.
- **Alertes critiques** : Section compacte, défilement automatique, n'affiche que les vulnérabilités critiques liées aux IOCs.
- **Popup "Voir plus"** : Détail complet de chaque vulnérabilité accessible depuis tous les tableaux.
- **Gestion des IOCs** : Ajout, suppression, et modification via une popup d'édition.
- **Aide intelligente** : La popup d'aide s'ouvre automatiquement à chaque ajout ou modification d'IOC, et reste accessible à tout moment.
- **Pagination** : Navigation fluide dans les tableaux de vulnérabilités.
- **Design moderne** : Gradients, animations, responsive, expérience utilisateur professionnelle.

## Architecture technique

- **Next.js** (React) pour le frontend et l'API
- **Supabase** pour la base de données et l'authentification
- **Tailwind CSS** pour le style
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes

## Expérience utilisateur

- **Accueil** : Statistiques globales, alertes critiques défilantes, graphiques, tableau paginé
- **Dashboard personnalisé** : Vulnérabilités pertinentes selon les IOCs, scoring, correspondances
- **IOCs** : Ajout, édition (popup), suppression, aide contextuelle automatique
- **Popup d'aide** : Tutoriel interactif à chaque ajout/modification d'IOC
- **Popup de détails** : Accessible partout via "Voir plus"

## Configuration

1. **Cloner le projet**
2. **Configurer Supabase** :
   - Créer un projet sur https://supabase.com
   - Copier l'URL et la clé anonyme dans `.env.local`
3. **Créer les tables** :
   - Exécuter `database/schema.sql` et `database/sample-data.sql` dans Supabase
4. **Lancer le projet** :
```bash
   npm install
npm run dev
```

## API

- `/api/cyber-alerts` : GET (liste), POST (ajout)
- `/api/iocs` : GET (liste), POST (ajout)
- `/api/iocs/[id]` : DELETE (suppression), PUT (modification)

## Fichiers importants

- `components/Dashboard.js` : Dashboard principal filtré par IOCs
- `components/PersonalizedDashboard.js` : Dashboard personnalisé
- `components/IOCInput.js` : Gestion des IOCs, popup édition, aide automatique
- `components/IOCHelpModal.js` : Popup d'aide contextuelle
- `pages/api/iocs/[id].js` : API édition/suppression IOC
- `database/schema.sql` : Structure de la base
- `database/sample-data.sql` : Données de test

## Nouveautés et UX avancée

- **Filtrage intelligent** : Toutes les vulnérabilités affichées sont liées aux IOCs du client
- **Popup édition IOC** : Modification rapide et intuitive
- **Aide automatique** : Toujours affichée lors de l'ajout ou modification d'IOC
- **Défilement automatique alertes critiques** : UX moderne
- **Popup "Voir plus"** : Détail complet, recommandations, responsive

## Conseils

- Utilisez le dashboard personnalisé pour une vue avancée et le scoring
- Ajoutez/modifiez vos IOCs pour personnaliser l'expérience
- Utilisez la popup d'aide pour optimiser la saisie des IOCs

---

**Projet prêt pour la production et la personnalisation client !**
