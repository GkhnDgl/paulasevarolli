(() => {
  const chapters = Array.from(document.querySelectorAll('.chapter, .page-section, footer'));
  const dots = document.querySelectorAll('.nav-dot');
  const scrollToTopButton = document.getElementById('scrollToTopBtn');
  const usesChapterObserver = chapters.filter(section => section.classList.contains('chapter')).length > 1
    && !document.querySelector('.page-section');

  if (!chapters.length && !dots.length && !scrollToTopButton) return;

  const updateChapterState = index => {
    dots.forEach(dot => dot.classList.toggle('active', dots[index] === dot));
    if (usesChapterObserver) {
      scrollToTopButton?.classList.toggle('visible', index > 0);
    }
  };

  if (usesChapterObserver) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateChapterState(chapters.indexOf(entry.target));
        }
      });
    }, { threshold: 0.5 });

    chapters
      .filter(section => section.classList.contains('chapter'))
      .forEach(chapter => observer.observe(chapter));

    scrollToTopButton?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => chapters[index]?.scrollIntoView({ behavior: 'smooth' }));
    });
    return;
  }

  const updateNavigation = () => {
    const scrollPosition = window.scrollY + window.innerHeight * 0.4;
    let activeIndex = 0;

    chapters.forEach((section, index) => {
      if (section.offsetTop <= scrollPosition) activeIndex = index;
    });

    updateChapterState(activeIndex);
    if (scrollToTopButton) {
      scrollToTopButton.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
    }
  };

  window.addEventListener('scroll', updateNavigation, { passive: true });
  window.addEventListener('resize', updateNavigation);
  updateNavigation();

  scrollToTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      chapters[index]?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
