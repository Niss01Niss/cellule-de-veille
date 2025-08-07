# Changelog - Cyber Alerts Dashboard

## Version 2.1.0 - Corrections et Améliorations

### ✅ **Corrections Appliquées**

#### 1. **Graphique Circulaire - Masquage des Vulnérabilités Faibles**
- **Problème** : Les vulnérabilités faibles (0%) apparaissaient dans le graphique et perturbaient l'affichage
- **Solution** : Filtrage conditionnel - seules les catégories avec des valeurs > 0 sont affichées
- **Fichier** : `components/PersonalizedDashboard.js`

#### 2. **Bouton "Voir plus" - Dashboard Personnalisé**
- **Problème** : Le bouton "Voir plus" manquait dans le tableau du dashboard personnalisé
- **Solution** : Ajout du bouton avec modal de détails complet incluant :
  - Score CVSS et catégorie
  - Date de publication formatée
  - Résumé et description
  - Correspondances trouvées avec les IOCs
  - Score de pertinence
- **Fichier** : `components/PersonalizedDashboard.js`

#### 3. **Popup de Modification IOC - Amélioration UX**
- **Problème** : 
  - L'aide s'ouvrait en même temps que la modification
  - Interface de modification basique
- **Solution** :
  - Correction de l'ordre : modification d'abord, aide séparée
  - Interface moderne avec header, grille responsive, footer
  - Placeholders améliorés
  - Boutons avec icônes et états de chargement
- **Fichier** : `components/IOCInput.js`

#### 4. **Points d'Interrogation - Suppression**
- **Problème** : Points d'interrogation à côté de chaque input qui encombraient l'interface
- **Solution** : Suppression des boutons d'aide individuels, l'aide reste accessible via le bouton principal
- **Fichier** : `components/IOCInput.js`

#### 5. **Icône de Modification - Amélioration**
- **Problème** : Icône `Info` utilisée pour la modification (confus)
- **Solution** : Remplacement par l'icône `Edit` plus appropriée
- **Fichier** : `components/IOCInput.js`

#### 6. **Filtrage Dashboard Personnalisé - Seuil Plus Strict**
- **Problème** : Vulnérabilités avec score très faible (1) étaient affichées
- **Solution** : Seuil augmenté de `> 0` à `>= 4` pour n'afficher que les correspondances réelles
- **Fichier** : `components/PersonalizedDashboard.js`

### 🎨 **Améliorations UX**

- **Modal de modification** : Design moderne avec backdrop blur, animations, responsive
- **Modal de détails** : Interface complète avec toutes les informations pertinentes
- **Graphique circulaire** : Affichage propre sans segments vides
- **Boutons d'action** : Icônes appropriées et états de chargement

### 🔧 **Fonctionnalités Techniques**

- **API PUT** : Endpoint pour modifier les IOCs
- **Gestion d'état** : États locaux pour les modals et la sélection
- **Validation** : Vérification des données avant sauvegarde
- **Gestion d'erreurs** : Messages d'erreur appropriés

### 📱 **Responsive Design**

- **Grille adaptative** : 1 colonne sur mobile, 2 sur desktop pour les formulaires
- **Modals responsives** : Taille adaptée à l'écran
- **Tableaux scrollables** : Gestion des contenus larges

---

**Résultat** : Interface plus propre, fonctionnelle et intuitive ! 🎉 