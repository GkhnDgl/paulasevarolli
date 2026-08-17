(() => {
  const backLink = document.getElementById('contactBack');
  const subjectInput = document.getElementById('subject');
  const serviceKey = new URLSearchParams(window.location.search).get('service');
  if (!backLink && !subjectInput) return;

  if (backLink) {
    const originTargets = {
      index: 'index.html',
      stilberatung: serviceKey ? `stilberatung.html#${serviceKey}` : 'stilberatung.html',
      atelier: 'atelier.html'
    };
    const previousPage = sessionStorage.getItem('navPreviousPage');
    let target = previousPage === 'stilberatung.html' && serviceKey
      ? `stilberatung.html#${serviceKey}`
      : previousPage || originTargets[sessionStorage.getItem('navOrigin')] || 'index.html';

    if (!previousPage && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.origin === window.location.origin && referrerUrl.href !== window.location.href) {
          target = referrerUrl.href;
        }
      } catch {
        // Fallback bleibt index.html.
      }
    }
    backLink.href = target;
  }

  if (!subjectInput) return;

  document.addEventListener('i18n:loaded', async event => {
    try {
      const translations = event.detail?.translations || await fetch(`lang/${localStorage.getItem('lang') || 'de'}.json`)
        .then(response => {
          if (!response.ok) throw new Error(`Übersetzung konnte nicht geladen werden (${response.status}).`);
          return response.json();
        });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const value = element.dataset.i18nPlaceholder
          .split('.')
          .reduce((result, part) => result?.[part], translations);
        if (value) element.setAttribute('placeholder', value);
      });

      const serviceTitles = {
        reset: translations.servicePages?.wardrobeReset?.title,
        color: translations.servicePages?.colorConsultation?.title,
        shopping: translations.servicePages?.personalShopping?.title,
        individual: translations.servicePages?.individualConsultation?.title
      };
      const serviceTitle = serviceTitles[serviceKey];
      if (serviceTitle) {
        const prefix = translations.contactPage?.subjectPrefix || 'Terminanfrage:';
        subjectInput.value = `${prefix} ${serviceTitle}`;
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontaktformulars:', error);
    }
  });
})();
