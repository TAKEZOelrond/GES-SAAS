# Calculateur Bilan GES - La Poste

## Structure du projet

```
projet-laposte-ges/
├── index.html                          # Page principale
├── assets/
│   ├── css/
│   │   ├── variables.css              # Variables CSS (couleurs, espacements)
│   │   ├── base.css                   # Styles de base et reset
│   │   ├── header.css                 # Styles du header et navigation
│   │   ├── hero.css                   # Styles des sections héros
│   │   ├── categories.css             # Styles des cartes de catégories
│   │   ├── info-section.css           # Styles des sections d'information
│   │   └── responsive.css             # Styles responsives
│   ├── js/
│   │   └── main.js                    # JavaScript principal
│   ├── images/
│   │   ├── logo-laposte.svg           # Logo La Poste
│   │   ├── icons/                     # Icônes diverses
│   │   └── backgrounds/               # Images de fond
│   └── fonts/                         # Polices personnalisées (si nécessaires)
├── pages/
│   ├── accueil.html                   # Page d'accueil
│   ├── outil.html                     # Interface de l'outil de calcul
│   ├── apropos.html                   # Page à propos
│   ├── faq.html                       # FAQ
│   └── contact.html                   # Page de contact
└── README.md                          # Documentation
```

## Fonctionnalités implémentées

### ✅ Interface utilisateur
- Design moderne et responsive
- Navigation sticky avec menu hamburger mobile
- Cartes de catégories interactives
- Animations fluides et effets de hover
- Thème adaptatif (clair/sombre)

### ✅ Accessibilité
- Support complet du clavier
- ARIA labels et rôles appropriés
- Lecteurs d'écran compatibles
- Contrastes respectés
- Skip links

### ✅ JavaScript modulaire
- Architecture événementielle
- Gestionnaires pour navigation, animations, notifications
- Utilitaires réutilisables
- Gestion d'erreurs robuste

### ✅ Performance
- CSS optimisé avec variables
- Lazy loading des images
- Animations utilisant requestAnimationFrame
- Code modulaire et minifiable

## Installation et utilisation

### Prérequis
- Serveur web (Apache, Nginx, ou serveur de développement)
- Navigateur moderne supportant ES6+

### Déploiement
1. Cloner ou télécharger les fichiers
2. Placer dans le répertoire du serveur web
3. Accéder à `index.html`

### Développement local
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js
npx serve .

# Avec PHP
php -S localhost:8000
```

## Configuration

### Variables CSS principales
```css
:root {
    --primary-color: #FFD100;        /* Jaune La Poste */
    --secondary-color: #003366;      /* Bleu La Poste */
    --text-dark: #333;               /* Texte principal */
    --bg-light: #f8f9fa;            /* Arrière-plan */
}
```

### Configuration JavaScript
```javascript
const CONFIG = {
    animationDelay: 100,
    scrollOffset: 100,
    mobileBreakpoint: 768
};
```

## Guide de personnalisation

### Modifier les couleurs
1. Éditer `assets/css/variables.css`
2. Ajuster les valeurs dans `:root`
3. Les changements se propagent automatiquement

### Ajouter une catégorie
1. Dans `index.html`, ajouter une div `.category-card`
2. Définir `data-category="nom-categorie"`
3. Le JavaScript gérera automatiquement l'interactivité

### Modifier les animations
1. Ajuster les durées dans `assets/css/variables.css`
2. Personnaliser les keyframes dans les fichiers CSS appropriés

## Compatibilité navigateurs

| Navigateur | Version minimale |
|------------|------------------|
| Chrome     | 60+              |
| Firefox    | 55+              |
| Safari     | 12+              |
| Edge       | 79+              |

## Optimisations futures

### Performance
- [ ] Mise en cache des assets
- [ ] Compression Gzip/Brotli
- [ ] Optimisation des images (WebP, AVIF)
- [ ] Code splitting JavaScript

### Fonctionnalités
- [ ] Mode hors ligne (Service Worker)
- [ ] Sauvegarde locale des données
- [ ] Export des résultats (PDF, Excel)
- [ ] Intégration API de calcul

### Accessibilité
- [ ] Support des technologies d'assistance avancées
- [ ] Navigation vocale
- [ ] Tailles de police adaptatives

## Structure des données

### État global de l'application
```javascript
const state = {
    isMobileMenuOpen: false,           // État du menu mobile
    selectedCategories: new Set(),     // Catégories sélectionnées
    isScrolled: false,                 // État du scroll
    currentTheme: 'light'              // Thème actuel
};
```

### Événements personnalisés
```javascript
// Sélection de catégorie
EventManager.emit('categorySelected', { category: 'batiments' });

// Changement de thème
EventManager.emit('themeChanged', 'dark');
```

## Tests recommandés

### Tests fonctionnels
- [ ] Navigation entre les pages
- [ ] Sélection/désélection des catégories
- [ ] Menu mobile sur différents écrans
- [ ] Accessibilité clavier

### Tests de performance
- [ ] Temps de chargement < 3s
- [ ] Score Lighthouse > 90
- [ ] Animations fluides (60fps)

### Tests d'accessibilité
- [ ] Validation WAVE
- [ ] Test avec lecteur d'écran
- [ ] Navigation clavier complète
- [ ] Contrastes WCAG AA

## Support et maintenance

### Logs et debugging
Les logs sont disponibles dans la console du navigateur :
```javascript
console.log('🚀 Application La Poste - Calculateur GES initialisée');
```

### Gestion d'erreurs
Toutes les erreurs JavaScript sont capturées et loggées :
```javascript
window.addEventListener('error', function(event) {
    console.error('Erreur JavaScript:', event.error);
});
```

---

**Développé pour La Poste - Engagement pour la neutralité carbone**