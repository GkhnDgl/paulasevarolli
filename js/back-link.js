(() => {
  const backLink = document.getElementById('contactBack');
  if (!backLink) return;

  let target = sessionStorage.getItem('navPreviousPage') || 'index.html';
  if (!sessionStorage.getItem('navPreviousPage') && document.referrer) {
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
})();
