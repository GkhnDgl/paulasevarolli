(() => {
  const reviewsPages = document.getElementById('reviewsPages');
  if (!reviewsPages) return;

  const chapterSection = document.querySelector('.chapter');
  const chapterNav = document.querySelector('.chapter-nav');
  const scrollToTopButton = document.getElementById('scrollToTopBtn');
  let sections = [];
  let currentReadMoreText = 'Weiter lesen';
  let currentReadMoreAria = 'Vollen Review-Text lesen';

  function getReviewLayout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const columns = width >= 1500 ? 4 : width >= 1100 ? 3 : width >= 760 ? 2 : 1;
    const rows = Math.max(1, Math.min(3, Math.floor((height * 0.68) / 230)));
    return { columns, rows, pageSize: columns * rows };
  }

  function buildReviewPages() {
    const sourceCards = Array.from(reviewsPages.querySelectorAll('.review-card'));
    if (!sourceCards.length) return [];

    const { pageSize } = getReviewLayout();
    reviewsPages.replaceChildren();
    for (let index = 0; index < sourceCards.length; index += pageSize) {
      const page = document.createElement('div');
      page.className = 'review-page';
      const grid = document.createElement('div');
      grid.className = 'review-grid';
      sourceCards.slice(index, index + pageSize).forEach(card => grid.append(card.cloneNode(true)));
      page.appendChild(grid);
      reviewsPages.appendChild(page);
    }
    return Array.from(reviewsPages.querySelectorAll('.review-page'));
  }

  function updateReviewLayout() {
    const { columns, rows } = getReviewLayout();
    reviewsPages.style.setProperty('--review-columns', columns);
    reviewsPages.style.setProperty('--review-rows', rows);
    const columnWidth = window.innerWidth <= 900 ? 'minmax(0, 1fr)' : 'minmax(0, 28rem)';

    reviewsPages.querySelectorAll('.review-grid').forEach(grid => {
      grid.style.gridTemplateColumns = `repeat(${columns}, ${columnWidth})`;
      grid.querySelectorAll('.review-card').forEach(card => {
        if (window.innerWidth <= 900) {
          card.style.removeProperty('--review-card-width');
          card.style.setProperty('--review-card-height', 'auto');
          return;
        }
        const quoteLength = card.querySelector('.review-quote')?.textContent.trim().length || 0;
        const cardWidth = Math.min(448, Math.max(288, 160 + quoteLength * 1.8));
        card.style.setProperty('--review-card-width', `${cardWidth}px`);
        card.style.setProperty('--review-card-height', '270px');
      });
    });
  }

  function setupReadMoreButtons() {
    reviewsPages.querySelectorAll('.review-card').forEach(card => {
      const quote = card.querySelector('.review-quote');
      if (!quote) return;
      const hasOverflow = quote.scrollHeight > quote.clientHeight;
      let button = card.querySelector('.review-read-more');

      if (hasOverflow && quote.textContent.trim()) {
        card.classList.add('has-read-more');
        if (!button) {
          button = document.createElement('button');
          button.type = 'button';
          button.className = 'review-read-more';
          card.appendChild(button);
        }
        button.textContent = currentReadMoreText;
        button.setAttribute('aria-label', currentReadMoreAria);
      } else {
        card.classList.remove('has-read-more');
        button?.remove();
      }
    });
  }

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'review-modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="review-modal-panel" role="dialog" aria-modal="true" aria-label="Vollständiger Review-Text">
      <button type="button" class="review-modal-close" aria-label="Schließen">×</button>
      <p class="review-modal-quote"></p>
      <p class="review-modal-author"></p>
      <p class="review-modal-service"></p>
    </div>`;
  modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(modalBackdrop);

  const modalCloseButton = modalBackdrop.querySelector('.review-modal-close');
  const modalQuote = modalBackdrop.querySelector('.review-modal-quote');
  const modalAuthor = modalBackdrop.querySelector('.review-modal-author');
  const modalService = modalBackdrop.querySelector('.review-modal-service');

  function closeReviewModal() {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }

  function openReviewModal(card) {
    const quote = card.querySelector('.review-quote')?.textContent.trim() || '';
    if (!quote) return;
    modalQuote.textContent = quote;
    modalAuthor.textContent = card.querySelector('.review-author')?.textContent.trim() || '';
    modalService.textContent = card.querySelector('.review-service')?.textContent.trim() || '';
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    modalCloseButton.focus();
  }

  modalCloseButton.addEventListener('click', closeReviewModal);
  modalBackdrop.addEventListener('click', event => {
    if (event.target === modalBackdrop) closeReviewModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalBackdrop.classList.contains('is-open')) closeReviewModal();
  });
  reviewsPages.addEventListener('click', event => {
    const button = event.target.closest('.review-read-more');
    if (button) openReviewModal(button.closest('.review-card'));
  });

  function buildNavDots(reviewPages) {
    if (!chapterNav) return;
    chapterNav.replaceChildren();
    for (let index = 0; index <= reviewPages.length; index++) {
      const dot = document.createElement('div');
      dot.className = 'nav-dot';
      chapterNav.appendChild(dot);
    }
  }

  function updateActiveDot() {
    const dots = chapterNav?.querySelectorAll('.nav-dot') || [];
    const scrollPosition = window.scrollY + window.innerHeight * 0.45;
    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (section.offsetTop <= scrollPosition) activeIndex = index;
    });
    dots.forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
    scrollToTopButton?.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
  }

  function refreshLayout() {
    const reviewPages = buildReviewPages();
    updateReviewLayout();
    setupReadMoreButtons();
    buildNavDots(reviewPages);
    sections = chapterSection ? [chapterSection, ...reviewPages] : reviewPages;
    updateActiveDot();
  }

  scrollToTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  chapterNav?.addEventListener('click', event => {
    const dot = event.target.closest('.nav-dot');
    if (!dot) return;
    const dots = Array.from(chapterNav.querySelectorAll('.nav-dot'));
    sections[dots.indexOf(dot)]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.addEventListener('scroll', updateActiveDot, { passive: true });
  window.addEventListener('resize', refreshLayout);

  document.addEventListener('i18n:loaded', ({ detail: { lang, translations } }) => {
    const reviews = translations.reviewsPage?.reviews;
    if (reviews) {
      reviewsPages.replaceChildren(...reviews.map(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        const quote = document.createElement('p');
        quote.className = 'review-quote';
        quote.textContent = review.text || '';
        const author = document.createElement('p');
        author.className = 'review-author';
        author.textContent = review.author || '';
        const service = document.createElement('p');
        service.className = 'review-service';
        service.textContent = review.service || '';
        card.append(quote, author, service);
        return card;
      }));
    }

    const isPortuguese = lang === 'pt' || lang === 'br-pt';
    currentReadMoreText = translations.reviewsPage?.readMore || (isPortuguese ? 'Leia mais' : 'Weiter lesen');
    currentReadMoreAria = translations.reviewsPage?.readMoreAria || (isPortuguese
      ? 'Ler o texto completo da avaliação'
      : 'Vollen Review-Text lesen');
    modalCloseButton.setAttribute('aria-label', isPortuguese ? 'Fechar' : 'Schließen');
    modalBackdrop.setAttribute('aria-label', isPortuguese ? 'Texto completo da avaliação' : 'Vollständiger Review-Text');
    refreshLayout();
  });

  refreshLayout();
})();
