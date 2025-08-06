# Dashboard Cyber Alerts - Next.js + Supabase

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer Supabase :
   - Créer un projet sur https://supabase.com
   - Créer la table `cyber_alerts` avec les colonnes :
     - `id` (int8, primary key, auto-increment)
     - `summary` (text)
     - `cvss` (float8)
     - `published` (timestamptz)

3. Configurer les variables d'environnement :
   - Modifier `.env.local` avec vos clés Supabase

4. Lancer le serveur de développement :
```bash
npm run dev
```

## SQL pour créer la table Supabase

```sql
CREATE TABLE cyber_alerts (
  id SERIAL PRIMARY KEY,
  summary TEXT NOT NULL,
  cvss FLOAT NOT NULL,
  published TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

- `GET /api/cyber-alerts` - Récupérer toutes les alertes
- `POST /api/cyber-alerts` - Créer une nouvelle alerte

## Intégration n8n

Pour envoyer des données depuis n8n :
- URL: `http://localhost:3000/api/cyber-alerts`
- Méthode: POST
- Body: `{"summary": "...", "cvss": 7.5, "published": "2025-01-15T10:30:00Z"}`

## Fonctionnalités

- Dashboard avec statistiques en temps réel
- Graphiques interactifs (barres, secteurs, ligne)
- Tableau des alertes récentes
- Classification automatique par sévérité CVSS
- Design responsive avec Tailwind CSS
# cellule-de-veille
