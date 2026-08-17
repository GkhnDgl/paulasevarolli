/**
 * Navigation Loader
 * Lädt die externe Navigation und wählt die richtige Variante basierend auf der Seite
 * - Hauptseiten (index, stilberatung*, atelier*): Desktop/Mobile automatisch
 * - Unterseiten (about, contact, etc.): Nutzt sessionStorage für Herkunft
 */

(function() {
  const NAV_FILE = 'includes/nav.html';
  const SESSION_KEY = 'navOrigin';
  const CURRENT_PAGE_KEY = 'navCurrentPage';
  const PREVIOUS_PAGE_KEY = 'navPreviousPage';
  const MOBILE_BREAKPOINT = 768;

  function getPageReference() {
    const url = new URL(window.location.href);
    const filename = url.pathname.split('/').pop() || 'index.html';
    return `${filename}${url.search}${url.hash}`;
  }

  /**
   * Bestimmt, ob Mobile-Version angezeigt werden soll
   */
  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  /**
   * Bestimmt den aktuellen Page-Type basierend auf Dateiname
   */
  function getCurrentPageType() {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop() || '';

    if (filename === 'index.html' || filename === '') {
      return 'a'; // Typ A
    }
    if (filename.startsWith('stilberatung')) {
      return 'b'; // Typ B
    }
    if (filename.startsWith('atelier')) {
      return 'c'; // Typ C
    }
    // Unterseiten
    return null;
  }

  /**
   * Bestimmt, welche Navigation für Unterseiten angezeigt wird
   */
  function getNavTypeForSubpage() {
    // URL-Parameter checken
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');

    if (fromParam) {
      sessionStorage.setItem(SESSION_KEY, fromParam);
      if (fromParam === 'index') return 'a';
      if (fromParam === 'stilberatung') return 'b';
      if (fromParam === 'atelier') return 'c';
    }

    // sessionStorage checken
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'index') return 'a';
    if (stored === 'stilberatung') return 'b';
    if (stored === 'atelier') return 'c';

    // Default: Typ A
    return 'a';
  }

  function renderFallbackNavigation(navType) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const navMarkup = {
      a: `
        <a href="index.html" data-i18n="nav.home">Home</a>
        <a href="about.html?from=index" data-i18n="nav.about">Über mich</a>`,
      b: `
        <a href="index.html" data-i18n="nav.home">Home</a>
        <a href="about.html?from=stilberatung" data-i18n="nav.about">Über mich</a>
        <div class="nav-dropdown">
          <a href="stilberatung.html" class="nav-link-dropdown" data-i18n="nav.stilberatung">Stilberatung</a>
          <div class="dropdown-menu">
            <a href="stilberatung.html#reset" data-i18n="services.wardrobeReset.title">Kleiderschrank-Reset</a>
            <a href="stilberatung.html#color" data-i18n="services.colorConsultation.title">Farbberatung</a>
            <a href="stilberatung.html#shopping" data-i18n="services.personalShopping.title">Personal Shopping</a>
            <a href="stilberatung.html#individual" data-i18n="services.individualConsultation.title">Individuelle Stilberatung</a>
          </div>
        </div>
        <a href="stilberatung_shop.html" data-i18n="nav.shop">Shop</a>
        <a href="rezensionen.html" data-i18n="nav.reviews">Rezensionen</a>`,
      c: `
        <a href="index.html" data-i18n="nav.home">Home</a>
        <a href="about.html?from=atelier" data-i18n="nav.about">Über mich</a>
        <a href="atelier.html" data-i18n="nav.services">Leistungen</a>
        <a href="atelier_shop.html" data-i18n="nav.shop">Shop</a>`
    }[navType];

    navbar.querySelector('.nav-left').innerHTML = navMarkup;
    navbar.querySelector('.nav-right').innerHTML = `
      <div class="nav-icon-group">
        <a href="contact.html" class="nav-icon-btn" aria-label="Contact Me" title="Contact Me"><img src="images/email.svg" alt=""></a>
        <a href="https://instagram.com/paulasevarolli" target="_blank" rel="noopener noreferrer" class="nav-icon-btn" aria-label="Instagram" title="Instagram"><img src="images/instagram.svg" alt=""></a>
      </div>
      <div class="nav-dropdown">
        <a href="impressum.html" class="nav-icon-btn" aria-label="Rechtliches" title="Rechtliches">i</a>
        <div class="dropdown-menu">
          <a href="impressum.html" data-i18n="legal.footerImpressum">Impressum</a>
          <a href="datenschutz.html" data-i18n="legal.footerDatenschutz">Datenschutz</a>
        </div>
      </div>
      <div class="lang-switch" id="lang-switcher" role="group" aria-label="Language switcher"></div>`;

    if (window.reinitI18n) window.reinitI18n();
  }

  function cleanupMobileNavigation() {
    if (window.mobileNavigationCleanup) {
      window.mobileNavigationCleanup();
      window.mobileNavigationCleanup = null;
    }
  }

  function setupMobileNavigation(navbar, navLeft) {
    cleanupMobileNavigation();

    const toggle = navbar.querySelector('.mobile-menu-toggle');
    const drawer = navbar.querySelector('.mobile-navigation-drawer');
    const drawerLinks = navbar.querySelector('.mobile-drawer-primary');
    if (!toggle || !drawer || !drawerLinks) return;

    drawerLinks.replaceChildren(...Array.from(navLeft.children).map(link => link.cloneNode(true)));
    const closeTriggers = navbar.querySelectorAll('[data-mobile-menu-close]');
    const focusableSelector = 'a, button';

    const setOpen = isOpen => {
      navbar.classList.toggle('mobile-nav-open', isOpen);
      drawer.setAttribute('aria-hidden', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('mobile-nav-is-open', isOpen);
      if (isOpen) drawer.querySelector(focusableSelector)?.focus();
      else toggle.focus();
    };

    const onToggle = () => setOpen(!navbar.classList.contains('mobile-nav-open'));
    const onClose = () => setOpen(false);
    const onKeyDown = event => {
      if (event.key === 'Escape' && navbar.classList.contains('mobile-nav-open')) onClose();
    };
    const onLinkClick = event => {
      if (event.target.closest('a')) onClose();
    };

    toggle.addEventListener('click', onToggle);
    closeTriggers.forEach(trigger => trigger.addEventListener('click', onClose));
    drawer.addEventListener('click', onLinkClick);
    document.addEventListener('keydown', onKeyDown);

    window.mobileNavigationCleanup = () => {
      toggle.removeEventListener('click', onToggle);
      closeTriggers.forEach(trigger => trigger.removeEventListener('click', onClose));
      drawer.removeEventListener('click', onLinkClick);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('mobile-nav-is-open');
    };
  }

  /**
   * Lädt die Navigation und setzt sie in die Navbar ein
   */
  async function loadNavigation() {
    try {
      const response = await fetch(NAV_FILE);
      if (!response.ok) throw new Error('Navigation file not found');

      const html = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Navbar suchen
      const navbar = document.querySelector('.navbar');
      if (!navbar) {
        console.warn('Navbar element not found');
        return;
      }

      // Seite bestimmen
      let navType = getCurrentPageType();
      if (!navType) {
        // Unterseite
        navType = getNavTypeForSubpage();
      }

      // Mobile oder Desktop
      const deviceType = isMobile() ? 'mobile' : 'desktop';
      const templateId = `nav-template-${navType}-${deviceType}`;
      const navTemplate = tempDiv.querySelector(`#${templateId}`);

      if (!navTemplate) {
        console.warn(`Navigation template ${templateId} not found`);
        return;
      }

      // Nav-Left einsetzen (oder erstellen, falls nicht vorhanden)
      let navLeft = navbar.querySelector('.nav-left');
      if (!navLeft) {
        navLeft = document.createElement('div');
        navbar.insertBefore(navLeft, navbar.querySelector('.nav-right'));
      }
      navLeft.replaceWith(navTemplate.content.querySelector('.nav-left').cloneNode(true));

      // Nav-Right einsetzen
      const navRight = navbar.querySelector('.nav-right');
      const rightTemplateId = deviceType === 'mobile'
        ? '#nav-template-right-mobile'
        : '#nav-template-right';
      const rightTemplate = tempDiv.querySelector(rightTemplateId);
      if (navRight && rightTemplate) {
        const rightContent = rightTemplate.content.querySelector('.nav-right');
        navRight.replaceChildren(...Array.from(rightContent.childNodes).map(node => node.cloneNode(true)));
        if (deviceType === 'mobile') {
          setupMobileNavigation(navbar, navbar.querySelector('.nav-left'));
        } else {
          cleanupMobileNavigation();
        }
      }

      // i18n neu initialisieren: Language Buttons + Translations
      if (window.reinitI18n) {
        window.reinitI18n();
      }
    } catch (error) {
      console.error('Failed to load navigation:', error);
      const navType = getCurrentPageType() || getNavTypeForSubpage();
      renderFallbackNavigation(navType);
    }
  }

  /**
   * Speichert die aktuelle Seite im sessionStorage für Unterseiten
   */
  function recordCurrentPage() {
    const navType = getCurrentPageType();
    const currentPage = getPageReference();
    const previousPage = sessionStorage.getItem(CURRENT_PAGE_KEY);

    if (previousPage && previousPage !== currentPage) {
      sessionStorage.setItem(PREVIOUS_PAGE_KEY, previousPage);
    }
    sessionStorage.setItem(CURRENT_PAGE_KEY, currentPage);

    if (navType) {
      const pageMap = {
        'a': 'index',
        'b': 'stilberatung',
        'c': 'atelier'
      };
      sessionStorage.setItem(SESSION_KEY, pageMap[navType]);
    }
  }

  /**
   * Lädt Navigation wenn DOM ready ist
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      recordCurrentPage();
      loadNavigation();
    });
  } else {
    recordCurrentPage();
    loadNavigation();
  }

  /**
   * Responsive: Neulade Navigation bei Fenstergrößenänderung
   */
  let resizeTimeout;
  let lastIsMobile = isMobile();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentIsMobile = isMobile();
      if (currentIsMobile !== lastIsMobile) {
        lastIsMobile = currentIsMobile;
        loadNavigation();
      }
    }, 250);
  });
})();
