/**
 * JavaScript principal pour l'application Calculateur Bilan GES - La Poste
 * Version optimisée avec UX améliorée et fonctionnalités complètes
 * @version 2.0
 * @author La Poste - Équipe Développement GES
 */

// Configuration globale de l'application
const CONFIG = {
    animationDelay: 150,
    scrollOffset: 100,
    mobileBreakpoint: 768,
    debounceDelay: 300,
    autoSaveDelay: 2000,
    maxRetries: 3,
    apiTimeout: 30000
};

// État global de l'application (utilise sessionStorage pour la persistance)
const AppState = {
    navigation: {
        isMobileMenuOpen: false,
        activeSection: null,
        isScrolled: false
    },
    ui: {
        currentTheme: 'light',
        animationsEnabled: true,
        reducedMotion: false
    },
    forms: {
        selectedCategories: new Set(),
        formData: {},
        validationErrors: {},
        isDirty: false
    },
    app: {
        isLoading: false,
        lastSaved: null,
        version: '2.0'
    }
};

// Utilitaires et helpers
const Utils = {
    // Débounce pour éviter les exécutions répétées
    debounce(func, wait) {
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

    // Throttle pour les événements de scroll
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Animation smooth scroll
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Générer un ID unique
    generateId() {
        return 'ges_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    // Formatage des nombres
    formatNumber(num, decimals = 2) {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    // Validation email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Détection de la préférence de mouvement réduit
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

/**
 * Gestionnaire d'événements principal
 */
const EventManager = {
    events: {},
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    },
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
};

/**
 * Initialisation de l'application
 */
document.addEventListener('DOMContentLoaded', function() {
    // Détecter les préférences utilisateur
    AppState.ui.reducedMotion = Utils.prefersReducedMotion();
    AppState.ui.animationsEnabled = !AppState.ui.reducedMotion;
    
    // Initialiser l'application
    initializeApp();
});

/**
 * Fonction principale d'initialisation
 */
async function initializeApp() {
    try {
        // Afficher un indicateur de chargement si nécessaire
        AppState.app.isLoading = true;
        
        // Initialiser tous les modules
        await initializeCore();
        initializeNavigation();
        initializeUI();
        initializeForms();
        initializeInteractions();
        initializeAnimations();
        initializeAccessibility();
        
        // Initialiser la page de résultats si nécessaire
        initializeResultsPage();
        
        // Marquer comme initialisé
        AppState.app.isLoading = false;
        
        // Émettre l'événement d'initialisation complète
        EventManager.emit('app:initialized', AppState);
        
        console.log('🚀 Application La Poste GES v' + AppState.app.version + ' initialisée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        handleInitializationError(error);
    }
}

/**
 * Initialisation du core système
 */
async function initializeCore() {
    // Récupérer les données sauvegardées si disponibles
    loadSavedState();
    
    // Marquer la page active dans la navigation
    highlightActiveNavItem();
    
    // Initialiser le système de sauvegarde automatique
    initializeAutoSave();
}

/**
 * Navigation et menu mobile - VERSION OPTIMISÉE
 */
function initializeNavigation() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileToggle && mainNav) {
        // Événement principal du toggle avec gestion des états
        mobileToggle.addEventListener('click', handleMobileToggle);
        
        // Fermer le menu en cliquant sur un lien
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => closeMobileMenu());
        });
        
        // Fermer le menu en cliquant à l'extérieur
        document.addEventListener('click', handleOutsideClick);
        
        // Gestion du redimensionnement
        window.addEventListener('resize', Utils.debounce(handleResize, 250));
        
        // Gestion du scroll pour le header
        window.addEventListener('scroll', Utils.throttle(handleScroll, 16));
    }
}

/**
 * Gestionnaires d'événements pour la navigation
 */
function handleMobileToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    
    AppState.navigation.isMobileMenuOpen = !AppState.navigation.isMobileMenuOpen;
    updateMobileMenuDisplay();
    
    // Accessibilité
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.setAttribute('aria-expanded', AppState.navigation.isMobileMenuOpen);
        mainNav.setAttribute('aria-hidden', !AppState.navigation.isMobileMenuOpen);
    }
}

function handleOutsideClick(e) {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (!mobileToggle?.contains(e.target) && !mainNav?.contains(e.target)) {
        closeMobileMenu();
    }
}

function handleResize() {
    if (window.innerWidth > CONFIG.mobileBreakpoint) {
        closeMobileMenu();
    }
}

function handleScroll() {
    const scrolled = window.scrollY > CONFIG.scrollOffset;
    
    if (AppState.navigation.isScrolled !== scrolled) {
        AppState.navigation.isScrolled = scrolled;
        
        const header = document.querySelector('.main-header');
        if (header) {
            header.classList.toggle('scrolled', scrolled);
        }
    }
}

function updateMobileMenuDisplay() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (!mobileToggle || !mainNav) return;
    
    if (AppState.navigation.isMobileMenuOpen) {
        mobileToggle.classList.add('active');
        mainNav.classList.add('open');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll
    } else {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    if (AppState.navigation.isMobileMenuOpen) {
        AppState.navigation.isMobileMenuOpen = false;
        updateMobileMenuDisplay();
        
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const mainNav = document.getElementById('mainNav');
        
        if (mobileToggle && mainNav) {
            mobileToggle.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');
        }
    }
}

/**
 * Marquer la page active dans la navigation
 */
function highlightActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath || 
            (currentPath.includes(linkPath.replace('.html', '')) && linkPath !== '/')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * Initialisation de l'interface utilisateur
 */
function initializeUI() {
    // Initialiser les tooltips
    initializeTooltips();
    
    // Initialiser les modales
    initializeModals();
    
    // Initialiser les notifications
    initializeNotifications();
    
    // Gestion des boutons retour en haut
    initializeBackToTop();
}

/**
 * Initialisation des formulaires
 */
function initializeForms() {
    // Validation en temps réel
    initializeFormValidation();
    
    // Compteur de caractères
    initializeCharacterCounters();
    
    // Formulaire de contact
    initializeContactForm();
    
    // Outil de calcul GES
    initializeGESCalculator();
    
    // FAQ search
    initializeFAQSearch();
}

/**
 * Initialisation des interactions
 */
function initializeInteractions() {
    // Cartes de catégories
    initializeCategoryCards();
    
    // Boutons interactifs
    initializeButtons();
    
    // Accordéons FAQ
    initializeFAQAccordions();
    
    // Onglets
    initializeTabs();
}

/**
 * Initialisation des animations
 */
function initializeAnimations() {
    if (!AppState.ui.animationsEnabled) return;
    
    // Observer pour les animations au scroll
    initializeScrollAnimations();
    
    // Animations au chargement
    initializeLoadAnimations();
    
    // Micro-interactions
    initializeMicroInteractions();
}

/**
 * Animations au scroll avec Intersection Observer
 */
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.aosDelay) || 0;
                
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Initialisation des cartes de catégories
 */
function initializeCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', handleCategorySelection);
        card.addEventListener('keydown', handleCategoryKeydown);
        
        // Rendre focusable
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
    });
}

function handleCategorySelection(e) {
    const card = e.currentTarget;
    const category = card.dataset.category;
    
    if (!category) return;
    
    // Toggle selection
    if (AppState.forms.selectedCategories.has(category)) {
        AppState.forms.selectedCategories.delete(category);
        card.classList.remove('selected');
        card.setAttribute('aria-pressed', 'false');
    } else {
        AppState.forms.selectedCategories.add(category);
        card.classList.add('selected');
        card.setAttribute('aria-pressed', 'true');
    }
    
    // Émettre l'événement
    EventManager.emit('category:selected', {
        category,
        selected: AppState.forms.selectedCategories.has(category)
    });
    
    // Feedback visuel
    addRippleEffect(card, e);
}

function handleCategoryKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCategorySelection(e);
    }
}

/**
 * Effet ripple pour les interactions
 */
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

/**
 * Initialisation du formulaire de contact
 */
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Gestion des champs conditionnels
    const entitySelect = document.getElementById('entity');
    const otherEntityGroup = document.getElementById('otherEntityGroup');
    
    if (entitySelect && otherEntityGroup) {
        entitySelect.addEventListener('change', function() {
            if (this.value === 'autre') {
                otherEntityGroup.style.display = 'block';
                otherEntityGroup.querySelector('input').required = true;
            } else {
                otherEntityGroup.style.display = 'none';
                otherEntityGroup.querySelector('input').required = false;
            }
        });
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Validation
    if (!validateContactForm(form)) {
        return;
    }
    
    // État de chargement
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    
    try {
        // Simuler l'envoi (remplacer par un vrai appel API)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Générer un numéro de ticket
        const ticketNumber = 'GES-' + Date.now().toString().slice(-6);
        
        // Afficher le message de succès
        showSuccessMessage(ticketNumber);
        
        // Réinitialiser le formulaire
        form.reset();
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        showNotification('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
    } finally {
        // Restaurer le bouton
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

function validateContactForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        clearFieldError(field);
        
        if (!field.value.trim()) {
            showFieldError(field, 'Ce champ est obligatoire');
            isValid = false;
        } else if (field.type === 'email' && !Utils.isValidEmail(field.value)) {
            showFieldError(field, 'Adresse email invalide');
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
}

function clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
}

function showSuccessMessage(ticketNumber) {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const ticketSpan = document.getElementById('ticketNumber');
    
    if (form && successMessage && ticketSpan) {
        form.style.display = 'none';
        ticketSpan.textContent = ticketNumber;
        successMessage.style.display = 'block';
        
        // Scroll vers le message
        Utils.smoothScrollTo(successMessage, CONFIG.scrollOffset);
    }
}

/**
 * Initialisation des accordéons FAQ
 */
function initializeFAQAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        if (question && answer && icon) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Fermer tous les autres
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                        const otherIcon = otherItem.querySelector('.faq-icon');
                        if (otherIcon) otherIcon.textContent = '+';
                    }
                });
                
                // Toggle l'item courant
                if (isOpen) {
                    item.classList.remove('open');
                    icon.textContent = '+';
                    question.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('open');
                    icon.textContent = '−';
                    question.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Accessibilité
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('role', 'button');
            question.setAttribute('tabindex', '0');
            
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        }
    });
}

/**
 * Recherche dans la FAQ
 */
function initializeFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        const debouncedSearch = Utils.debounce(performFAQSearch, CONFIG.debounceDelay);
        
        searchInput.addEventListener('input', debouncedSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performFAQSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performFAQSearch);
    }
}

function performFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            const questionText = question.textContent.toLowerCase();
            const answerText = answer.textContent.toLowerCase();
            
            if (searchTerm === '' || 
                questionText.includes(searchTerm) || 
                answerText.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
                item.classList.remove('open'); // Fermer si ouvert
            }
        }
    });
    
    // Afficher un message si aucun résultat
    const visibleItems = Array.from(faqItems).filter(item => item.style.display !== 'none');
    
    let noResultsMsg = document.getElementById('noResultsMessage');
    if (visibleItems.length === 0 && searchTerm !== '') {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <p>Aucun résultat trouvé pour "${searchTerm}"</p>
                <button class="btn-outline btn-sm" onclick="clearFAQSearch()">Effacer la recherche</button>
            `;
            document.querySelector('.faq-section').appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function clearFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
        searchInput.value = '';
        performFAQSearch();
    }
}

/**
 * Initialisation des onglets
 */
function initializeTabs() {
    const tabLists = document.querySelectorAll('[role="tablist"]');
    
    tabLists.forEach(tabList => {
        const tabs = tabList.querySelectorAll('[role="tab"]');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', handleTabClick);
            tab.addEventListener('keydown', handleTabKeydown);
        });
    });
}

function handleTabClick(e) {
    const tab = e.currentTarget;
    const tabList = tab.closest('[role="tablist"]');
    const tabs = tabList.querySelectorAll('[role="tab"]');
    const targetId = tab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetId);
    
    // Désactiver tous les onglets
    tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('active');
        
        const panelId = t.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.hidden = true;
        }
    });
    
    // Activer l'onglet courant
    tab.setAttribute('aria-selected', 'true');
    tab.classList.add('active');
    
    if (targetPanel) {
        targetPanel.hidden = false;
    }
}

function handleTabKeydown(e) {
    const tab = e.currentTarget;
    const tabList = tab.closest('[role="tablist"]');
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.indexOf(tab);
    
    let targetIndex;
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            targetIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            break;
        case 'ArrowRight':
            e.preventDefault();
            targetIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'Home':
            e.preventDefault();
            targetIndex = 0;
            break;
        case 'End':
            e.preventDefault();
            targetIndex = tabs.length - 1;
            break;
        default:
            return;
    }
    
    if (targetIndex !== undefined) {
        tabs[targetIndex].focus();
        tabs[targetIndex].click();
    }
}

/**
 * Système de notifications
 */
function initializeNotifications() {
    // Créer le conteneur si nécessaire
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Fermer">&times;</button>
        </div>
    `;
    
    // Ajouter au conteneur
    container.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Fermeture automatique
    const timeoutId = setTimeout(() => {
        removeNotification(notification);
    }, duration);
    
    // Fermeture manuelle
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeoutId);
        removeNotification(notification);
    });
    
    return notification;
}

function removeNotification(notification) {
    notification.classList.add('hiding');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Initialisation de l'accessibilité
 */
function initializeAccessibility() {
    // Gestion de l'outline focus visible
    initializeFocusVisible();
    
    // Gestion du skip link
    initializeSkipLink();
    
    // Annonces pour les lecteurs d'écran
    initializeScreenReaderAnnouncements();
    
    // Navigation au clavier
    initializeKeyboardNavigation();
}

function initializeFocusVisible() {
    // Ajouter la classe focus-visible avec le polyfill
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('user-is-tabbing');
    });
}

function initializeSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                Utils.smoothScrollTo(target, CONFIG.scrollOffset);
            }
        });
    }
}

function initializeScreenReaderAnnouncements() {
    // Créer une zone d'annonces cachée
    let announcer = document.getElementById('screen-reader-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(announcer);
    }
}

function announceToScreenReader(message) {
    const announcer = document.getElementById('screen-reader-announcer');
    if (announcer) {
        announcer.textContent = message;
    }
}

/**
 * Navigation au clavier
 */
function initializeKeyboardNavigation() {
    // Trap focus dans les modales
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Fermer le menu mobile
            if (AppState.navigation.isMobileMenuOpen) {
                closeMobileMenu();
                document.getElementById('mobileMenuToggle')?.focus();
            }
            
            // Fermer les modales ouvertes
            const openModals = document.querySelectorAll('.modal.open');
            openModals.forEach(modal => {
                closeModal(modal);
            });
        }
    });
}

/**
 * Sauvegarde et restauration de l'état
 */
function loadSavedState() {
    try {
        const saved = sessionStorage.getItem('ges-app-state');
        if (saved) {
            const parsedState = JSON.parse(saved);
            
            // Restaurer certaines propriétés seulement
            if (parsedState.forms) {
                AppState.forms.formData = parsedState.forms.formData || {};
                AppState.forms.selectedCategories = new Set(parsedState.forms.selectedCategories || []);
            }
            
            AppState.app.lastSaved = parsedState.app?.lastSaved;
        }
    } catch (error) {
        console.warn('Impossible de charger l\'état sauvegardé:', error);
    }
}

function saveState() {
    try {
        const stateToSave = {
            forms: {
                formData: AppState.forms.formData,
                selectedCategories: Array.from(AppState.forms.selectedCategories)
            },
            app: {
                lastSaved: Date.now(),
                version: AppState.app.version
            }
        };
        
        sessionStorage.setItem('ges-app-state', JSON.stringify(stateToSave));
        AppState.app.lastSaved = Date.now();
        
    } catch (error) {
        console.warn('Impossible de sauvegarder l\'état:', error);
    }
}

function initializeAutoSave() {
    // Sauvegarder automatiquement toutes les 30 secondes si des changements
    setInterval(() => {
        if (AppState.forms.isDirty) {
            saveState();
            AppState.forms.isDirty = false;
        }
    }, CONFIG.autoSaveDelay);
    
    // Sauvegarder avant de quitter la page
    window.addEventListener('beforeunload', saveState);
}

/**
 * Gestion des erreurs
 */
function handleInitializationError(error) {
    console.error('Erreur d\'initialisation:', error);
    
    // Afficher un message d'erreur à l'utilisateur
    const errorMessage = document.createElement('div');
    errorMessage.className = 'initialization-error';
    errorMessage.innerHTML = `
        <div class="error-content">
            <h3>Erreur de chargement</h3>
            <p>Une erreur est survenue lors du chargement de l'application.</p>
            <button onclick="location.reload()" class="btn-primary">Recharger la page</button>
        </div>
    `;
    
    document.body.insertBefore(errorMessage, document.body.firstChild);
}

/**
 * Initialisation des micro-interactions
 */
function initializeMicroInteractions() {
    // Effet hover sur les boutons
    const buttons = document.querySelectorAll('.btn, .category-card, .feature-card');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!AppState.ui.reducedMotion) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

/**
 * Initialisation générale des boutons
 */
function initializeButtons() {
    // Boutons avec effets
    const interactiveButtons = document.querySelectorAll('.btn, .cta-button');
    
    interactiveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ajouter l'effet ripple si pas désactivé
            if (!this.disabled && !AppState.ui.reducedMotion) {
                addRippleEffect(this, e);
            }
        });
    });
    
    // Boutons spéciaux
    const startEvaluation = document.getElementById('startEvaluation');
    if (startEvaluation) {
        startEvaluation.addEventListener('click', function(e) {
            e.preventDefault();
            announceToScreenReader('Navigation vers l\'outil de calcul');
            setTimeout(() => {
                window.location.href = 'outil.html';
            }, 100);
        });
    }
}

/**
 * Initialisation des compteurs de caractères
 */
function initializeCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        const counter = textarea.parentNode.querySelector('.char-counter');
        
        if (counter) {
            const updateCounter = () => {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${textarea.value.length} / ${maxLength} caractères`;
                
                if (remaining < 50) {
                    counter.style.color = 'var(--warning-color)';
                } else {
                    counter.style.color = '';
                }
            };
            
            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Initialiser
        }
    });
}

/**
 * Validation des formulaires en temps réel
 */
function initializeFormValidation() {
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', Utils.debounce(function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        }, 500));
    });
}

function validateField(field) {
    clearFieldError(field);
    
    if (field.required && !field.value.trim()) {
        showFieldError(field, 'Ce champ est obligatoire');
        return false;
    }
    
    if (field.type === 'email' && field.value && !Utils.isValidEmail(field.value)) {
        showFieldError(field, 'Adresse email invalide');
        return false;
    }
    
    if (field.type === 'tel' && field.value && !/^[\d\s\-+()]+$/.test(field.value)) {
        showFieldError(field, 'Numéro de téléphone invalide');
        return false;
    }
    
    return true;
}

/**
 * Tooltips
 */
function initializeTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltips.forEach(element => {
        let tooltip;
        
        element.addEventListener('mouseenter', function() {
            if (tooltip) return;
            
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', function() {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    });
}

/**
 * Bouton retour en haut
 */
function initializeBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTop';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Retour en haut de la page');
    document.body.appendChild(backToTopBtn);
    
    backToTopBtn.addEventListener('click', () => {
        Utils.smoothScrollTo(document.body);
        announceToScreenReader('Retour en haut de la page');
    });
    
    window.addEventListener('scroll', Utils.throttle(() => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 100));
}

/**
 * Initialisation du calculateur GES - Formulaire Multi-Étapes
 */
function initializeGESCalculator() {
    // Vérifier si on est sur la page outil
    if (!document.querySelector('.form-wizard')) return;
    
    // Initialiser le formulaire multi-étapes
    initializeMultiStepForm();
    
    // Initialiser la gestion des bâtiments dynamiques
    initializeDynamicBuildings();
    
    // Boutons d'action
    const saveButton = document.getElementById('saveProgress');
    const exportButton = document.getElementById('exportData');
    
    if (saveButton) {
        saveButton.addEventListener('click', handleSaveProgress);
    }
    
    if (exportButton) {
        exportButton.addEventListener('click', handleExportData);
    }
}

/**
 * Gestionnaire du formulaire multi-étapes
 */
let currentStep = 1;
const totalSteps = 6;

function initializeMultiStepForm() {
    // Éléments du DOM
    const stepButtons = document.querySelectorAll('.nav-step');
    const formSteps = document.querySelectorAll('.form-step');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitForm');
    
    // Initialiser la première étape
    showStep(currentStep);
    
    // Initialiser le titre dynamique
    updateDynamicTitle();
    
    // Navigation par les boutons d'étapes
    stepButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const stepNumber = index + 1;
            if (stepNumber <= getMaxAccessibleStep()) {
                goToStep(stepNumber);
            }
        });
    });
    
    // Boutons de navigation
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
        });
    }
    
    if (submitButton) {
        submitButton.addEventListener('click', handleFormSubmit);
    }
    
    // Validation en temps réel
    initializeStepValidation();
    
    // Sauvegarde automatique
    initializeAutoSaveForSteps();
}

function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > totalSteps) return;
    
    // Masquer l'étape courante
    hideStep(currentStep);
    
    // Mettre à jour l'étape courante
    currentStep = stepNumber;
    
    // Afficher la nouvelle étape
    showStep(currentStep);
    
    // Mettre à jour la navigation
    updateNavigation();
    
    // Mettre à jour la progression
    updateProgressBar();
    
    // Mettre à jour le titre dynamique
    updateDynamicTitle();
    
    // Scroll vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Annoncer le changement aux lecteurs d'écran
    announceToScreenReader(`Étape ${currentStep} sur ${totalSteps}`);
}

function showStep(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (step) {
        step.classList.add('active');
        
        // Focus sur le premier champ
        const firstInput = step.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }
}

function hideStep(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (step) {
        step.classList.remove('active');
    }
}

function updateNavigation() {
    const stepButtons = document.querySelectorAll('.nav-step');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitForm');
    
    // Mettre à jour les boutons d'étapes
    stepButtons.forEach((button, index) => {
        const stepNumber = index + 1;
        button.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            button.classList.add('active');
        } else if (stepNumber < currentStep || isStepCompleted(stepNumber)) {
            button.classList.add('completed');
        }
    });
    
    // Bouton précédent
    if (prevButton) {
        prevButton.style.display = currentStep > 1 ? 'block' : 'none';
    }
    
    // Bouton suivant / soumettre
    if (nextButton && submitButton) {
        if (currentStep < totalSteps) {
            nextButton.style.display = 'block';
            submitButton.style.display = 'none';
        } else {
            nextButton.style.display = 'none';
            submitButton.style.display = 'block';
        }
    }
}

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill && progressText) {
        const percentage = Math.round((currentStep / totalSteps) * 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${percentage}% complété`;
    }
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    if (!currentStepElement) return false;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'warning');
    }
    
    return isValid;
}

function isStepCompleted(stepNumber) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (!step) return false;
    
    const inputs = step.querySelectorAll('input, select, textarea');
    return Array.from(inputs).some(input => input.value.trim() !== '');
}

function getMaxAccessibleStep() {
    // L'utilisateur peut accéder aux étapes jusqu'à l'étape courante + 1
    return Math.min(currentStep + 1, totalSteps);
}

function initializeStepValidation() {
    // Validation en temps réel sur tous les champs
    const allInputs = document.querySelectorAll('.form-step input, .form-step select, .form-step textarea');
    
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', Utils.debounce(function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
            // Marquer comme modifié pour la sauvegarde
            AppState.forms.isDirty = true;
        }, 500));
    });
}

function initializeAutoSaveForSteps() {
    // Sauvegarder à chaque changement d'étape
    EventManager.on('step:changed', () => {
        saveFormData();
    });
    
    // Sauvegarder périodiquement
    setInterval(() => {
        if (AppState.forms.isDirty) {
            saveFormData();
        }
    }, CONFIG.autoSaveDelay);
}

function saveFormData() {
    const formData = {};
    const allInputs = document.querySelectorAll('.form-step input, .form-step select, .form-step textarea');
    
    allInputs.forEach(input => {
        if (input.name && input.value.trim() !== '') {
            formData[input.name] = input.value;
        }
    });
    
    AppState.forms.formData = formData;
    AppState.forms.isDirty = false;
    saveState();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submitForm');
    
    // Valider toutes les étapes
    let allValid = true;
    for (let i = 1; i <= totalSteps; i++) {
        const step = document.getElementById(`step-${i}`);
        const requiredFields = step.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                allValid = false;
            }
        });
    }
    
    if (!allValid) {
        showNotification('Veuillez remplir tous les champs obligatoires dans toutes les étapes', 'error');
        return;
    }
    
    // État de chargement
    submitButton.disabled = true;
    submitButton.textContent = 'Calcul en cours...';
    
    try {
        // Sauvegarder les données finales
        saveFormData();
        
        // Simuler le calcul
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Rediriger vers la page de résultats
        showNotification('Calcul terminé avec succès', 'success');
        
        setTimeout(() => {
            window.location.href = 'resultats.html';
        }, 1500);
        
    } catch (error) {
        console.error('Erreur lors du calcul:', error);
        showNotification('Erreur lors du calcul', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '📊 Calculer le bilan';
    }
}

function displayResults() {
    // Simuler des résultats basés sur les données saisies
    const totalEmissionsElement = document.getElementById('totalEmissions');
    const perEmployeeElement = document.getElementById('perEmployee');
    const mainCategoryElement = document.getElementById('mainCategory');
    
    if (totalEmissionsElement) {
        totalEmissionsElement.textContent = '125,7';
        totalEmissionsElement.dataset.target = '125.7';
    }
    
    if (perEmployeeElement) {
        perEmployeeElement.textContent = '2,8';
        perEmployeeElement.dataset.target = '2.8';
    }
    
    if (mainCategoryElement) {
        mainCategoryElement.textContent = 'Transport';
    }
    
    // Animer les compteurs
    animateCounters();
}

/**
 * Gestion dynamique des bâtiments
 */
function initializeDynamicBuildings() {
    const addBuildingBtn = document.getElementById('addBuilding');
    let buildingCount = 1;
    
    if (addBuildingBtn) {
        addBuildingBtn.addEventListener('click', function() {
            buildingCount++;
            addBuildingItem(buildingCount);
        });
    }
}

function addBuildingItem(number) {
    const template = document.getElementById('buildingTemplate');
    const container = template.parentNode;
    
    if (!template || !container) return;
    
    // Cloner le template
    const newBuilding = template.cloneNode(true);
    newBuilding.id = `building-${number}`;
    newBuilding.classList.remove('building-template');
    
    // Mettre à jour le titre
    const title = newBuilding.querySelector('.building-header h4');
    if (title) {
        title.textContent = `Bâtiment #${number}`;
    }
    
    // Mettre à jour les noms des champs
    const inputs = newBuilding.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (input.name && input.name.includes('[]')) {
            input.name = input.name.replace('[]', `[${number-1}]`);
            input.id = input.id + '_' + number;
        }
    });
    
    // Mettre à jour les labels
    const labels = newBuilding.querySelectorAll('label');
    labels.forEach(label => {
        if (label.getAttribute('for')) {
            label.setAttribute('for', label.getAttribute('for') + '_' + number);
        }
    });
    
    // Ajouter au conteneur
    container.appendChild(newBuilding);
    
    // Ajouter l'animation d'entrée
    newBuilding.style.opacity = '0';
    newBuilding.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newBuilding.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        newBuilding.style.opacity = '1';
        newBuilding.style.transform = 'translateY(0)';
    }, 100);
    
    // Focus sur le premier champ du nouveau bâtiment
    const firstInput = newBuilding.querySelector('input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 400);
    }
    
    showNotification(`Bâtiment #${number} ajouté`, 'success');
}

function removeBuilding(button) {
    const buildingItem = button.closest('.building-item');
    if (buildingItem && !buildingItem.classList.contains('building-template')) {
        
        // Animation de sortie
        buildingItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        buildingItem.style.opacity = '0';
        buildingItem.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            buildingItem.remove();
            showNotification('Bâtiment supprimé', 'info');
        }, 300);
    }
}


function handleSaveProgress() {
    saveState();
    showNotification('Données sauvegardées avec succès', 'success');
}

async function handleCalculateResults() {
    const button = document.getElementById('calculateResults');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!button) return;
    
    // État de chargement
    button.disabled = true;
    button.textContent = 'Calcul en cours...';
    
    try {
        // Simuler le calcul
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Afficher les résultats
        if (resultsSection) {
            resultsSection.style.display = 'block';
            Utils.smoothScrollTo(resultsSection, CONFIG.scrollOffset);
            
            // Animation des chiffres
            animateCounters();
        }
        
        showNotification('Calcul terminé avec succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors du calcul:', error);
        showNotification('Erreur lors du calcul', 'error');
    } finally {
        button.disabled = false;
        button.textContent = '📊 Calculer le bilan';
    }
}

function handleExportData() {
    // Simuler l'export
    const data = {
        timestamp: new Date().toISOString(),
        data: AppState.forms.formData,
        results: {
            totalEmissions: 123.45,
            perEmployee: 2.47,
            mainCategory: 'Transport'
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilan-ges-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Données exportées avec succès', 'success');
}

function animateCounters() {
    const counters = document.querySelectorAll('.result-value');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.dataset.target || 0);
        if (target === 0) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Utils.formatNumber(current);
        }, 30);
    });
}

/**
 * Initialisation des modales (placeholder)
 */
function initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal);
            }
        });
    });
}

function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus sur le premier élément focusable
    const focusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) {
        focusable.focus();
    }
    
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Animations de chargement
 */
function initializeLoadAnimations() {
    // Animer les éléments visibles au chargement
    const immediateElements = document.querySelectorAll('.hero-section, .main-header');
    
    immediateElements.forEach((element, index) => {
        if (!AppState.ui.reducedMotion) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * CONFIG.animationDelay);
        }
    });
}

// Exposer certaines fonctions globalement pour l'accessibilité
window.GESApp = {
    clearFAQSearch,
    showNotification,
    Utils,
    EventManager,
    AppState
};

// Exposer les fonctions du formulaire globalement
window.removeBuilding = removeBuilding;

/**
 * Initialisation de la page de résultats
 */
function initializeResultsPage() {
    // Vérifier si on est sur la page résultats
    if (!document.querySelector('.results-header')) return;
    
    // Initialiser les graphiques
    initializeCharts();
    
    // Animer les compteurs
    setTimeout(() => {
        animateCounters();
        animateBenchmarkBars();
    }, 500);
    
    // Boutons d'action
    initializeResultsActions();
}

function initializeCharts() {
    // Graphique en secteurs des catégories
    const categoryCanvas = document.getElementById('categoryChart');
    if (categoryCanvas) {
        const ctx = categoryCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    'Transport et mobilité',
                    'Bâtiments et énergie',
                    'Achats et services',
                    'Alimentation',
                    'Déchets'
                ],
                datasets: [{
                    data: [45, 30, 15, 6, 4],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Graphique de comparaison sectorielle
    const benchmarkCanvas = document.getElementById('benchmarkChart');
    if (benchmarkCanvas) {
        const ctx = benchmarkCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Votre entité',
                    'Moyenne secteur',
                    'Top 25%',
                    'Objectif 2030'
                ],
                datasets: [{
                    label: 'Émissions (t CO₂eq/personne)',
                    data: [2.8, 3.2, 2.1, 1.9],
                    backgroundColor: [
                        '#FFD100',
                        '#6c757d',
                        '#28a745',
                        '#007bff'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tonnes CO₂eq par personne'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} t CO₂eq/personne`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function animateBenchmarkBars() {
    const benchmarkFills = document.querySelectorAll('.benchmark-fill');
    
    benchmarkFills.forEach((fill, index) => {
        const targetWidth = fill.style.width;
        fill.style.width = '0%';
        
        setTimeout(() => {
            fill.style.width = targetWidth;
        }, index * 200 + 300);
    });
}

function initializeResultsActions() {
    const exportPDFBtn = document.getElementById('exportPDF');
    const exportExcelBtn = document.getElementById('exportExcel');
    const shareResultsBtn = document.getElementById('shareResults');
    const newCalculationBtn = document.getElementById('newCalculation');
    
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', handleExportPDF);
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', handleExportExcel);
    }
    
    if (shareResultsBtn) {
        shareResultsBtn.addEventListener('click', handleShareResults);
    }
    
    if (newCalculationBtn) {
        newCalculationBtn.addEventListener('click', handleNewCalculation);
    }
}

async function handleExportPDF() {
    const button = document.getElementById('exportPDF');
    const originalText = button.textContent;
    
    button.disabled = true;
    button.textContent = 'Génération PDF...';
    
    try {
        // Simuler la génération du PDF
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Créer un lien de téléchargement simulé
        const link = document.createElement('a');
        link.href = '#'; // En réalité, ici on aurait l'URL du PDF généré
        link.download = `bilan-ges-${Date.now()}.pdf`;
        link.click();
        
        showNotification('Rapport PDF généré avec succès', 'success');
        
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

async function handleExportExcel() {
    const button = document.getElementById('exportExcel');
    const originalText = button.textContent;
    
    button.disabled = true;
    button.textContent = 'Export Excel...';
    
    try {
        // Simuler l'export Excel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Générer les données CSV simples
        const csvData = generateCSVData();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `donnees-ges-${Date.now()}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('Données exportées en CSV', 'success');
        
    } catch (error) {
        console.error('Erreur export Excel:', error);
        showNotification('Erreur lors de l\'export', 'error');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

function generateCSVData() {
    return `Catégorie,Émissions (t CO₂eq),Pourcentage
Transport et mobilité,56.5,45%
Bâtiments et énergie,38.2,30%
Achats et services,18.9,15%
Alimentation,7.5,6%
Déchets,5.0,4%
TOTAL,125.7,100%`;
}

function handleShareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'Résultats Bilan GES - La Poste',
            text: 'Consultez les résultats de notre bilan carbone',
            url: window.location.href
        }).then(() => {
            showNotification('Résultats partagés avec succès', 'success');
        }).catch(() => {
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Copier l'URL dans le presse-papier
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Lien copié dans le presse-papier', 'success');
    }).catch(() => {
        showNotification('Impossible de copier le lien', 'warning');
    });
}

function handleNewCalculation() {
    if (confirm('Êtes-vous sûr de vouloir commencer un nouveau calcul ? Les données actuelles seront perdues.')) {
        // Effacer les données sauvegardées
        sessionStorage.removeItem('ges-app-state');
        
        // Rediriger vers l'outil
        window.location.href = 'outil.html';
    }
}

/**
 * Mise à jour du titre dynamique dans le formulaire
 */
const STEP_TITLES = {
    1: "📋 Identification du bilan",
    2: "🏢 Informations sur l'entité", 
    3: "🏗️ Bâtiments et infrastructures",
    4: "🚛 Transport et logistique",
    5: "👥 Personnel et mobilité",
    6: "🛒 Achats, restauration et déchets"
};

const STEP_DESCRIPTIONS = {
    1: "Renseignez le numéro du bilan, les dates de création et mise à jour, l'année de référence, ainsi que les informations du responsable (nom, prénom, email).",
    2: "Décrivez votre entité : nom, type (centre de distribution, bureau de poste...), code REGATE, unité de rattachement et effectifs (collaborateurs internes et externes en ETP).",
    3: "Pour chaque bâtiment : numéro, nom, adresse complète, année de construction, surfaces, consommations énergétiques (électricité, gaz, propane, eau, chauffage, climatisation).",
    4: "Flotte postale : consommations de carburants (gazole, essence, HVO, GNL) et distances électriques/vélos. Transport sous-traité : distances par type de véhicule et carburants.",
    5: "Organisation du travail (jours d'ouverture, télétravail), déplacements domicile-travail et professionnels, mobilité douce (VAE, vélos, transports en commun, voitures).",
    6: "Achats de bureau, consommables, véhicules, machines, textiles. Restauration par type de repas. Déchets par matériau. Équipements informatiques et numériques."
};

function updateDynamicTitle() {
    const toolTitle = document.querySelector('.tool-title');
    const toolSubtitle = document.querySelector('#toolSubtitle');
    
    if (toolTitle && typeof currentStep !== 'undefined') {
        const newTitle = STEP_TITLES[currentStep] || "Calculateur Bilan GES";
        const newDescription = STEP_DESCRIPTIONS[currentStep] || "Évaluez les émissions de gaz à effet de serre de votre entité La Poste";
        
        toolTitle.textContent = newTitle;
        
        if (toolSubtitle) {
            toolSubtitle.textContent = newDescription;
        }
        
        // Mettre à jour le titre de la page aussi
        document.title = `${newTitle} - La Poste`;
    }
}


// Message de debug pour le développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Mode développement - GES Calculator App v' + AppState.app.version);
    console.log('État de l\'application:', AppState);
}