// Main Application Controller for Liga Pauperalho
class LigaApp {
  constructor() {
    this.currentSection = 'home';
    this.sections = {};
    this.isInitialized = false;
    this.init();
  }

  // Initialize application
  init() {
    this.cacheElements();
    this.bindEvents();
    this.setupRouting();
    this.setupMobileMenu();
    this.handleInitialRoute();
    this.setupErrorHandling();
    this.setupPerformanceOptimizations();

    // Mark as initialized
    this.isInitialized = true;

    // Show loading complete
    this.hideLoading();
  }

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      navLinks: document.querySelectorAll('.nav-link'),
      sections: document.querySelectorAll('.section'),
      mobileMenuToggle: document.getElementById('mobileMenuToggle'),
      navMenu: document.getElementById('navMenu'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      header: document.getElementById('header')
    };
  }

  // Bind global event listeners
  bindEvents() {
    // Navigation links
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        if (section) {
          this.navigateToSection(section);
        }
      });
    });

    // Mobile menu toggle
    if (this.elements.mobileMenuToggle) {
      this.elements.mobileMenuToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.elements.navMenu &&
          !this.elements.navMenu.contains(e.target) &&
          !this.elements.mobileMenuToggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      this.handleRouteChange();
    });

    // Handle hash change
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });

    // Handle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 100);
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
  }

  // Setup routing system
  setupRouting() {
    // Define route handlers
    this.routes = {
      'home': () => this.showSection('home'),
      'rankings': () => this.handleRankingsRoute(),
      'rules': () => this.showSection('rules'),
      'decklists': () => this.handleDecklistsRoute(),
      'statistics': () => this.handleStatisticsRoute(),
      'admin': () => this.handleAdminRoute(),
      '': () => this.showSection('home'),
      null: () => this.showSection('home')
    };

    // Initialize sections cache
    this.elements.sections.forEach(section => {
      this.sections[section.id] = section;
    });
  }

  // Setup mobile menu
  setupMobileMenu() {
    // Add mobile menu styles if not already present
    if (!document.getElementById('mobileMenuStyles')) {
      const style = document.createElement('style');
      style.id = 'mobileMenuStyles';
      style.textContent = `
        .nav-menu {
          transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }

        .nav-menu.mobile-active {
          display: block;
          transform: translateY(0);
          opacity: 1;
        }

        @media (max-width: 767.98px) {
          .nav-menu {
            display: none;
            transform: translateY(-20px);
            opacity: 0;
          }

          .nav-menu.mobile-active {
            display: block;
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Handle initial route
  handleInitialRoute() {
    const hash = window.location.hash.substring(1);
    this.navigateToSection(hash || 'home');
  }

  // Navigate to section
  navigateToSection(sectionId) {
    if (!sectionId || !this.routes.hasOwnProperty(sectionId)) {
      sectionId = 'home';
    }

    // Update URL
    if (window.location.hash !== `#${sectionId}`) {
      window.location.hash = sectionId;
    }

    // Execute route handler
    const handler = this.routes[sectionId];
    if (handler) {
      handler();
    }
  }

  // Handle route changes
  handleRouteChange() {
    const hash = window.location.hash.substring(1);
    this.navigateToSection(hash || 'home');
  }

  // Show specific section
  showSection(sectionId) {
    // Hide all sections
    Object.values(this.sections).forEach(section => {
      if (section) {
        section.style.display = 'none';
        section.classList.remove('section-active');
      }
    });

    // Show target section
    const targetSection = this.sections[sectionId];
    if (targetSection) {
      targetSection.style.display = 'block';

      // Trigger animation
      setTimeout(() => {
        targetSection.classList.add('section-active');
      }, 50);

      this.currentSection = sectionId;
    }

    // Update navigation active state
    this.updateNavigationActive(sectionId);

    // Scroll to top
    this.scrollToTop();
  }

  
  // Handle rankings route
  handleRankingsRoute() {
    this.showSection('rankings');
    rankingsManager.refresh();
  }

  // Handle decklists route
  handleDecklistsRoute() {
    this.showSection('decklists');
    rankingsManager.loadDecklists();
  }

  // Handle statistics route
  handleStatisticsRoute() {
    this.showSection('statistics');
    rankingsManager.updateStatistics();
  }

  // Handle admin route
  handleAdminRoute() {
    if (!adminManager.requireAdmin()) {
      return;
    }

    this.showSection('admin');
    adminManager.loadAdminData();
  }

  // Update navigation active state
  updateNavigationActive(sectionId) {
    this.elements.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      }
    });
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    if (this.elements.navMenu) {
      this.elements.navMenu.classList.toggle('mobile-active');
    }
  }

  // Close mobile menu
  closeMobileMenu() {
    if (this.elements.navMenu) {
      this.elements.navMenu.classList.remove('mobile-active');
    }
  }

  // Handle scroll events
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add header shadow on scroll
    if (this.elements.header) {
      if (scrollTop > 10) {
        this.elements.header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
      } else {
        this.elements.header.style.boxShadow = '';
      }
    }
  }

  // Handle window resize
  handleResize() {
    // Close mobile menu on desktop
    if (Utils.getViewportWidth() > 768) {
      this.closeMobileMenu();
    }

    // Refresh charts if needed
    if (this.currentSection === 'statistics') {
      rankingsManager.updateStatistics();
    }
  }

  // Handle keyboard shortcuts
  handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not in input fields
    if (e.target.matches('input, textarea, select')) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        // Close modals
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay && modalOverlay.classList.contains('active')) {
          modalOverlay.classList.remove('active');
        }
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        // Number keys for navigation
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const sections = ['home', 'rankings', 'rules', 'decklists', 'statistics'];
          const index = parseInt(e.key) - 1;
          if (sections[index]) {
            this.navigateToSection(sections[index]);
          }
        }
        break;
    }
  }

  // Handle visibility change
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause any animations or polling
      this.pauseBackgroundTasks();
    } else {
      // Page is visible, resume tasks
      this.resumeBackgroundTasks();
    }
  }

  // Setup error handling
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.showGlobalError('Ocorreu um erro inesperado. Por favor, recarregue a página.');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.showGlobalError('Ocorreu um erro ao processar sua solicitação.');
    });
  }

  // Setup performance optimizations
  setupPerformanceOptimizations() {
    // Lazy load images
    this.lazyLoadImages();

    // Preload critical resources
    this.preloadCriticalResources();

    // Setup intersection observer for animations
    this.setupIntersectionObserver();
  }

  // Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Preload critical resources
  preloadCriticalResources() {
    // Preload fonts if needed
    // Preload important images
    // Preload API responses if applicable
  }

  // Setup intersection observer for animations
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });
  }

  // Pause background tasks
  pauseBackgroundTasks() {
    // Clear any intervals or timeouts
    // Pause data polling
    // Pause animations
  }

  // Resume background tasks
  resumeBackgroundTasks() {
    // Resume intervals or timeouts
    // Resume data polling
    // Resume animations
  }

  // Scroll to top smoothly
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Show loading overlay
  showLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'flex';
    }
  }

  // Hide loading overlay
  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'none';
    }
  }

  // Show global error
  showGlobalError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.innerHTML = `
      <div class="global-error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${Utils.escapeHtml(message)}</p>
        <button class="btn btn-outline btn-small" onclick="this.parentElement.parentElement.remove()">
          Fechar
        </button>
      </div>
    `;

    // Add styles if not present
    if (!document.getElementById('globalErrorStyles')) {
      const style = document.createElement('style');
      style.id = 'globalErrorStyles';
      style.textContent = `
        .global-error {
          position: fixed;
          top: var(--header-height);
          left: 0;
          right: 0;
          background-color: var(--color-error);
          color: white;
          z-index: var(--z-notification);
          padding: var(--spacing-md);
          box-shadow: var(--shadow-lg);
        }

        .global-error-content {
          max-width: var(--container-max-width);
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .global-error-content i {
          font-size: var(--font-size-xl);
        }

        .global-error-content p {
          flex: 1;
          margin: 0;
        }

        .global-error-content .btn {
          color: white;
          border-color: white;
        }

        .global-error-content .btn:hover {
          background-color: white;
          color: var(--color-error);
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(errorDiv);

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 10000);
  }

  // Get current section
  getCurrentSection() {
    return this.currentSection;
  }

  // Check if section is visible
  isSectionVisible(sectionId) {
    const section = this.sections[sectionId];
    return section && section.style.display !== 'none';
  }

  // Refresh current section
  refreshCurrentSection() {
    const handler = this.routes[this.currentSection];
    if (handler) {
      handler();
    }
  }

  // Public API methods
  navigateTo(sectionId) {
    this.navigateToSection(sectionId);
  }

  refresh() {
    this.refreshCurrentSection();
  }

  // Initialize the app when DOM is ready
  static init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.ligaApp = new LigaApp();
      });
    } else {
      window.ligaApp = new LigaApp();
    }
  }
}

// Initialize application
LigaApp.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LigaApp };
}