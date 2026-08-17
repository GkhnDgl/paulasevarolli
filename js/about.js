(() => {
  const paragraphs = Array.from({ length: 7 }, (_, index) =>
    document.querySelector(`[data-i18n="about.paragraph${index + 1}"]`)
  );

  if (!document.querySelector('[data-i18n="about.heading"]') && !paragraphs.some(Boolean)) return;

  function renderAboutContent(translations) {
    const about = translations?.about;
    if (!about) return;

    const eyebrow = document.querySelector('[data-i18n="about.eyebrow"]');
    const heading = document.querySelector('[data-i18n="about.heading"]');
    if (eyebrow && about.eyebrow) eyebrow.textContent = about.eyebrow;
    if (heading && about.heading) heading.textContent = about.heading;

    paragraphs.forEach((paragraph, index) => {
      if (!paragraph) return;
      const text = about[`paragraph${index + 1}`];
      paragraph.textContent = text || '';
      paragraph.style.display = text ? 'block' : 'none';
    });
  }

  document.addEventListener('i18n:loaded', event => {
    renderAboutContent(event.detail?.translations);
  });

  const scrollToTopButton = document.getElementById('scrollToTopBtn');
  const updateScrollToTopButton = () => {
    scrollToTopButton?.classList.toggle('visible', window.scrollY > 150);
  };

  window.addEventListener('scroll', updateScrollToTopButton, { passive: true });
  updateScrollToTopButton();
  scrollToTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
