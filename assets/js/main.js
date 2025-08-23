/**
 * JavaScript principal pour la page Calculateur Bilan GES - La Poste
 */

// Configuration
const CONFIG = {
    animationDelay: 100,
    scrollOffset: 100,
    mobileBreakpoint: 768
};

// State global
const state = {
    isMobileMenuOpen: false,
    selectedCategories: new Set(),
    isScrolled: false
};

/**
 * Initialisation de l'application
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Fonction principale d'initialisation
 */
function initializeApp() {
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeCategoryCards();
    initializeButtons();
    initializeAccessibility();
    
    console.log('🚀 Application La Poste - Calculateur GES initialisée');
}

/**
 * Navigation et menu mobile
 */
function initializeNavigation() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
        
        // Fermer le menu en cliquant sur un lien
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Fermer le menu en cliquant à l'extérieur
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
    
    // Marquer la page active
    highlightActiveNavItem();
}

/**
 * Toggle du menu mobile
 */
function toggleMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    state.isMobileMenuOpen = !state.isMobileMenuOpen;
    
    mobileToggle.classList.toggle('active', state.isMobileMenuOpen);
    mainNav.classList.toggle('active', state.isMobileMenuOpen);
    
    // Accessibilité
    mobileToggle.setAttribute('aria-expanded', state.isMobileMenuOpen);
    mainNav.setAttribute('aria-hidden', !state.isMobileMenuOpen);
}

/**
 * Fermer le menu mobile
 */
function closeMobileMenu() {
    if (state.isMobileMenuOpen) {
        state.isMobileMenuOpen = false;
        
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const mainNav = document.getElementById('mainNav');
        
        if (mobileToggle && mainNav) {
            mobileToggle.classList.remove('active');
            mainNav.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');
        }
    }
}

/**
 * Mettre en évidence l'élément de navigation actif
 */
function highlightActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || (currentPath === '/' && linkPath.includes('accueil'))) {
            link.classList.add('active');
        }
    });
}

/**
 * Effets de scroll
 */
function initializeScrollEffects() {
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
}

/**
 * Mise à jour des effets de scroll
 */
function updateScrollEffects() {
    const scrolled = window.scrollY > CONFIG.scrollOffset;
    
    if (scrolled !== state.isScrolled) {
        state.isScrolled = scrolled;
        
        const header = document.querySelector('.header-laposte');
        if (header) {
            header.classList.toggle('scrolled', scrolled);
        }
    }
    
    ticking = false;
}

/**
 * Animation des éléments au scroll (AOS simple)
 */
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(entry.target.dataset.aosDelay) || 0);
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments avec data-aos
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Interaction avec les cartes de catégories
 */
function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        // Click handler
        card.addEventListener('click', function() {
            handleCategoryCardClick(this);
        });
        
        // Keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryCardClick(this);
            }
        });
        
        // Rendre focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        // Effet sonore au hover (optionnel)
        card.addEventListener('mouseenter', function() {
            this.style.setProperty('--hover-scale', '1.02');
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.removeProperty('--hover-scale');
        });
    });
}

/**
 * Gestion du clic sur les cartes de catégories
 */
function handleCategoryCardClick(card) {
    const category = card.dataset.category;
    
    if (!category) return;
    
    // Toggle selection
    if (state.selectedCategories.has(category)) {
        state.selectedCategories.delete(category);
        card.classList.remove('selected');
        card.setAttribute('aria-pressed', 'false');
    } else {
        state.selectedCategories.add(category);
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
    }
    
    // Animation de feedback
    card.style.animation = 'none';
    card.offsetHeight; // Force reflow
    card.style.animation = 'cardClick 0.3s ease';
    
    // Mettre à jour l'interface
    updateCategorySelection();
    
    console.log('Catégories sélectionnées:', Array.from(state.selectedCategories));
}

/**
 * Mise à jour de la sélection des catégories
 */
function updateCategorySelection() {
    const selectedCount = state.selectedCategories.size;
    
    // Exemple d'utilisation: afficher un compteur
    let counter = document.getElementById('selectedCategoriesCounter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'selectedCategoriesCounter';
        counter.className = 'selection-counter';
        document.querySelector('.categories-section').appendChild(counter);
    }
    
    if (selectedCount > 0) {
        counter.textContent = `${selectedCount} catégorie${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''}`;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

/**
 * Initialisation des boutons
 */
function initializeButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Animation de clic
            this.style.transform = 'translateY(-1px) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Analytics (exemple)
            trackButtonClick(this.textContent, this.href);
        });
    });
}

/**
 * Améliorations d'accessibilité
 */
function initializeAccessibility() {
    // Focus visible pour les éléments interactifs
    const interactiveElements = document.querySelectorAll('.category-card, .cta-button, .info-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('focused');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('focused');
        });
    });
    
    // Skip link pour l'accessibilité
    addSkipLink();
    
    // Annonces pour les lecteurs d'écran
    addAriaLiveRegion();
}

/**
 * Ajouter un lien de saut pour l'accessibilité
 */
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: var(--secondary-color);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Ajouter l'ID au contenu principal
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.id = 'main-content';
    }
}

/**
 * Ajouter une région live pour les annonces
 */
function addAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';
    liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    `;
    
    document.body.appendChild(liveRegion);
}

/**
 * Annoncer des messages aux lecteurs d'écran
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

/**
 * Analytics et tracking (exemple)
 */
function trackButtonClick(buttonText, href) {
    // Exemple d'implémentation d'analytics
    console.log('Button clicked:', { buttonText, href, timestamp: new Date().toISOString() });
    
    // Ici vous pourriez intégrer Google Analytics, Adobe Analytics, etc.
    // gtag('event', 'click', { 'button_text': buttonText, 'link_url': href });
}

/**
 * Gestion des erreurs
 */
window.addEventListener('error', function(event) {
    console.error('Erreur JavaScript:', event.error);
    // Ici vous pourriez envoyer l'erreur à un service de monitoring
});

/**
 * Performance monitoring
 */
window.addEventListener('load', function() {
    // Mesurer les performances
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Performance:', {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            total: perfData.loadEventEnd - perfData.fetchStart
        });
    }
});

/**
 * CSS Animation keyframes ajoutées dynamiquement
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes cardClick {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }
    
    .focused {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }
    
    .selection-counter {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: var(--secondary-color);
        padding: 10px 16px;
        border-radius: 25px;
        font-weight: 600;
        box-shadow: var(--shadow-medium);
        z-index: 50;
        transform: translateY(100px);
        transition: transform 0.3s ease;
        display: none;
    }
    
    .selection-counter:not([style*="display: none"]) {
        display: block;
        transform: translateY(0);
    }
    
    .header-laposte.scrolled {
        backdrop-filter: blur(10px);
        background: rgba(0, 51, 102, 0.95);
    }
    
    @media (max-width: 768px) {
        .selection-counter {
            bottom: 10px;
            right: 10px;
            font-size: 0.9rem;
            padding: 8px 12px;
        }
    }
`;
document.head.appendChild(style);

/**
 * Utilitaires
 */
const Utils = {
    /**
     * Debounce function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Smooth scroll vers un élément
     */
    smoothScrollTo: function(target, duration = 1000) {
        const targetElement = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
            
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 100; // Offset pour le header fixe
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = Utils.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation);
    },

    /**
     * Easing function pour les animations
     */
    easeInOutQuad: function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    },

    /**
     * Formatter un nombre avec des séparateurs de milliers
     */
    formatNumber: function(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    },

    /**
     * Vérifier si un élément est visible dans le viewport
     */
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Générer un ID unique
     */
    generateId: function() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }
};

/**
 * Gestionnaire d'événements personnalisés
 */
const EventManager = {
    events: {},

    /**
     * Écouter un événement personnalisé
     */
    on: function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },

    /**
     * Déclencher un événement personnalisé
     */
    emit: function(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Erreur dans le callback d\'événement:', error);
                }
            });
        }
    },

    /**
     * Supprimer un écouteur d'événement
     */
    off: function(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
};

/**
 * Gestionnaire de thème (mode sombre/clair)
 */
const ThemeManager = {
    currentTheme: 'light',

    init: function() {
        // Détecter la préférence système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        this.currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.applyTheme(this.currentTheme);
        
        // Écouter les changements de préférence système
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    setTheme: function(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
        EventManager.emit('themeChanged', theme);
    },

    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
};

/**
 * Gestionnaire de notifications toast
 */
const NotificationManager = {
    container: null,

    init: function() {
        this.createContainer();
    },

    createContainer: function() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 350px;
        `;
        document.body.appendChild(this.container);
    },

    show: function(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        const id = Utils.generateId();
        
        toast.className = `toast toast-${type}`;
        toast.id = id;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="NotificationManager.hide('${id}')">&times;</button>
            </div>
        `;
        
        toast.style.cssText = `
            background: white;
            border-left: 4px solid ${this.getColor(type)};
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 10px;
            overflow: hidden;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        this.container.appendChild(toast);
        
        // Animer l'entrée
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }
        
        return id;
    },

    hide: function(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    },

    getIcon: function(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    getColor: function(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }
};

/**
 * Gestionnaire de formulaires
 */
const FormManager = {
    /**
     * Valider un formulaire
     */
    validate: function(form) {
        const errors = [];
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const error = this.validateField(input);
            if (error) {
                errors.push({ field: input.name, message: error });
            }
        });
        
        return errors;
    },

    /**
     * Valider un champ individuel
     */
    validateField: function(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        if (required && !value) {
            return 'Ce champ est obligatoire';
        }
        
        if (value && type === 'email' && !this.isValidEmail(value)) {
            return 'Adresse e-mail invalide';
        }
        
        if (value && type === 'tel' && !this.isValidPhone(value)) {
            return 'Numéro de téléphone invalide';
        }
        
        return null;
    },

    /**
     * Valider une adresse e-mail
     */
    isValidEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Valider un numéro de téléphone
     */
    isValidPhone: function(phone) {
        const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return regex.test(phone);
    }
};

/**
 * Initialisation des gestionnaires
 */
EventManager.on('DOMContentLoaded', function() {
    NotificationManager.init();
    ThemeManager.init();
});

/**
 * Exemples d'utilisation des événements personnalisés
 */
EventManager.on('categorySelected', function(data) {
    announceToScreenReader(`Catégorie ${data.category} sélectionnée`);
    NotificationManager.show(`Catégorie "${data.category}" ajoutée à votre sélection`, 'success', 3000);
});

EventManager.on('categoryDeselected', function(data) {
    announceToScreenReader(`Catégorie ${data.category} désélectionnée`);
    NotificationManager.show(`Catégorie "${data.category}" supprimée de votre sélection`, 'info', 3000);
});

/**
 * Shortcuts clavier
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K pour ouvrir la recherche (si implémentée)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Ouvrir interface de recherche
        console.log('Raccourci recherche activé');
    }
    
    // Échap pour fermer les modales/menus
    if (e.key === 'Escape') {
        closeMobileMenu();
        // Fermer autres éléments modaux si nécessaires
    }
});

/**
 * Lazy loading pour les images (si nécessaire)
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Export des utilitaires pour usage global
window.LaPosteApp = {
    Utils,
    EventManager,
    ThemeManager,
    NotificationManager,
    FormManager,
    state,
    CONFIG
};