# Guide du Mode Sombre et Glissement Sidebar

## 🌙 **Mode Sombre/Clair**

### Fonctionnalités
- **Basculement automatique** : Détection de la préférence système
- **Persistance** : Sauvegarde du choix dans localStorage
- **Transition fluide** : Animation de 300ms entre les thèmes
- **Bouton dédié** : Dans le sidebar sous "Aide"

### Utilisation
1. **Desktop** : Cliquez sur le bouton "Mode Sombre/Clair" dans le sidebar
2. **Mobile** : Ouvrez le sidebar et cliquez sur le bouton de thème
3. **Icônes** : 
   - 🌙 (Lune) = Passer en mode sombre
   - ☀️ (Soleil) = Passer en mode clair

### Couleurs Supportées
- **Arrière-plans** : `dark:bg-dark-900`, `dark:bg-dark-800`
- **Textes** : `dark:text-white`, `dark:text-gray-300`
- **Bordures** : `dark:border-dark-700`
- **Hover** : `dark:hover:bg-dark-700`

---

## 📱 **Glissement du Sidebar**

### Fonctionnalités
- **Animation fluide** : Transition de 300ms
- **Bouton animé** : Menu ↔ X avec rotation
- **Overlay** : Fond flouté sur mobile
- **Fermeture automatique** : Clic sur overlay

### Utilisation
1. **Mobile** : Cliquez sur le bouton hamburger animé
2. **Desktop** : Sidebar toujours visible
3. **Fermeture** : 
   - Clic sur X dans le sidebar
   - Clic sur l'overlay (mobile)
   - Clic sur le bouton hamburger

### Animations
- **Bouton** : Rotation et changement d'icône
- **Sidebar** : Glissement depuis la gauche
- **Overlay** : Apparition/disparition avec fade

---

## 🎨 **Classes CSS Utilisées**

### Mode Sombre
```css
/* Arrière-plans */
dark:bg-dark-900    /* Fond principal */
dark:bg-dark-800    /* Sidebar, cartes */
dark:bg-dark-700    /* Hover, bordures */

/* Textes */
dark:text-white     /* Titres */
dark:text-gray-300  /* Texte principal */
dark:text-gray-400  /* Texte secondaire */
dark:text-gray-500  /* Labels */

/* Transitions */
transition-colors duration-300
```

### Glissement
```css
/* Animations */
transform transition-all duration-300 ease-out
translate-x-0       /* Ouvert */
-translate-x-full   /* Fermé */

/* Bouton animé */
opacity-0 rotate-90 scale-0    /* Menu caché */
opacity-100 rotate-0 scale-100 /* Menu visible */
```

---

## 🔧 **Configuration Technique**

### Context Provider
```javascript
// contexts/ThemeContext.js
const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)
```

### Tailwind Config
```javascript
// tailwind.config.js
darkMode: 'class',
theme: {
  extend: {
    colors: {
      dark: { 50: '#f8fafc', ..., 900: '#0f172a' }
    }
  }
}
```

### Utilisation dans les Composants
```javascript
const { isDark, toggleTheme, isSidebarOpen, toggleSidebar } = useTheme()
```

---

## 📱 **Responsive Design**

### Mobile (< 1024px)
- Sidebar caché par défaut
- Bouton hamburger animé
- Overlay avec backdrop blur
- Largeur: 320px (w-80)

### Desktop (≥ 1024px)
- Sidebar toujours visible
- Pas de bouton hamburger
- Largeur: 288px (w-72)

---

## 🎯 **Points Clés**

✅ **Mode sombre complet** avec toutes les couleurs adaptées  
✅ **Persistance** du choix utilisateur  
✅ **Animations fluides** pour une UX moderne  
✅ **Responsive** sur tous les écrans  
✅ **Accessibilité** avec aria-labels  
✅ **Performance** optimisée avec transitions CSS  

---

**Résultat** : Interface moderne avec thème adaptatif et navigation fluide ! 🚀 