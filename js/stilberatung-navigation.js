(() => {
  const chapters = document.querySelectorAll('.chapter');
  const dots = document.querySelectorAll('.nav-dot');
  const scrollToTopButton = document.getElementById('scrollToTopBtn');
  if (!chapters.length && !dots.length && !scrollToTopButton) return;

  const updateChapterState = index => {
    dots.forEach(dot => dot.classList.toggle('active', dots[index] === dot));
    scrollToTopButton?.classList.toggle('visible', index > 0);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) updateChapterState(Array.from(chapters).indexOf(entry.target));
    });
  }, { threshold: 0.5 });
  chapters.forEach(chapter => observer.observe(chapter));

  scrollToTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => chapters[index]?.scrollIntoView({ behavior: 'smooth' }));
  });
})();
