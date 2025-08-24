# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
# Start local development server (choose one):
python -m http.server 8000
npx serve .
php -S localhost:8000
```

Access the application at `http://localhost:8000/accueil.html`

## Project Architecture

### Structure Overview
This is a static HTML/CSS/JS project for La Poste's GHG (Greenhouse Gas) calculator web application. The architecture follows a modular approach with:

- **Static HTML pages**: `accueil.html`, `outil.html`, `apropos.html`, `faq.html`, `contact.html`
- **Modular CSS**: Organized by component in `assets/css/` with CSS variables for theming
- **Vanilla JavaScript**: Single main.js file with modular architecture using event management

### Key Design Patterns

**CSS Architecture**: Uses CSS custom properties (`--primary-color`, `--secondary-color`, etc.) defined in `variables.css` for consistent theming. Each component has its own CSS file (header.css, hero.css, categories.css, etc.).

**JavaScript Architecture**: Event-driven architecture with:
- Global state management via `state` object
- Custom event system via `EventManager`
- Utility functions in `Utils` object  
- Modular managers (ThemeManager, NotificationManager, FormManager)

**Accessibility First**: Comprehensive accessibility features including ARIA attributes, skip links, screen reader announcements, and keyboard navigation support.

### Key Components

**Navigation**: Mobile-responsive header with hamburger menu toggle. Menu state managed in `state.isMobileMenuOpen`.

**Category Cards**: Interactive selection system with visual feedback. Selected categories tracked in `state.selectedCategories` Set.

**Animation System**: Uses Intersection Observer for scroll-based animations with `data-aos` attributes and custom keyframe animations.

**Theme Support**: Adaptive light/dark theme support respecting system preferences (no localStorage used).

## Configuration

### CSS Variables
Primary customization point is `assets/css/variables.css`:
```css
:root {
    --primary-color: #FFD100;    /* La Poste Yellow */
    --secondary-color: #003366;  /* La Poste Blue */
    --text-dark: #333;
    --bg-light: #f8f9fa;
}
```

### JavaScript Config
Application configuration in `main.js`:
```javascript
const CONFIG = {
    animationDelay: 100,
    scrollOffset: 100,
    mobileBreakpoint: 768
};
```

## Browser Support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Uses modern JavaScript features (ES6+)
- Progressive enhancement for older browsers

## Development Notes

### Adding New Pages
1. Create HTML file following existing structure
2. Include standard CSS imports from `assets/css/`
3. Navigation will automatically highlight active page

### Adding Categories
1. Add `.category-card` div with `data-category` attribute
2. JavaScript automatically handles interactivity and state management

### Custom Events
Use the EventManager for component communication:
```javascript
EventManager.emit('categorySelected', { category: 'buildings' });
EventManager.on('categorySelected', callback);
```

### Performance
- Uses requestAnimationFrame for smooth animations
- Intersection Observer for efficient scroll-based effects
- Lazy loading implementation for images with `data-src`
- No external dependencies - pure vanilla JS/CSS