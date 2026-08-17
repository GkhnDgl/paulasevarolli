(() => {
  const aboutParagraphs = Array.from({ length: 7 }, (_, index) =>
    document.querySelector(`[data-i18n="about.paragraph${index + 1}"]`)
  );
  const priceTableBody = document.getElementById('priceTableBody');
  const aboutPage = document.querySelector('[data-i18n="about.heading"]') || aboutParagraphs.some(Boolean);

  if (!aboutPage && !priceTableBody) return;

  function renderAboutContent(about) {
    if (!about) return;

    const eyebrow = document.querySelector('[data-i18n="about.eyebrow"]');
    const heading = document.querySelector('[data-i18n="about.heading"]');
    if (eyebrow && about.eyebrow) eyebrow.textContent = about.eyebrow;
    if (heading && about.heading) heading.textContent = about.heading;

    aboutParagraphs.forEach((paragraph, index) => {
      if (!paragraph) return;
      const text = about[`paragraph${index + 1}`];
      paragraph.textContent = text || '';
      paragraph.style.display = text ? 'block' : 'none';
    });
  }

  function renderPriceTable(items) {
    if (!priceTableBody || !items) return;

    priceTableBody.replaceChildren(...items.map(item => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const priceCell = document.createElement('td');
      nameCell.textContent = item.name || '';
      priceCell.textContent = item.price || '';
      row.append(nameCell, priceCell);
      return row;
    }));
  }

  document.addEventListener('i18n:loaded', event => {
    const translations = event.detail?.translations;
    renderAboutContent(translations?.about);
    renderPriceTable(translations?.atelier?.priceItems);
  });

  if (aboutPage) {
    const scrollToTopButton = document.getElementById('scrollToTopBtn');
    const updateScrollToTopButton = () => {
      scrollToTopButton?.classList.toggle('visible', window.scrollY > 150);
    };

    window.addEventListener('scroll', updateScrollToTopButton, { passive: true });
    updateScrollToTopButton();
    scrollToTopButton?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
