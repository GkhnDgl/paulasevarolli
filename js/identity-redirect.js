(() => {
  if (!window.netlifyIdentity) return;

  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        window.location.href = '/admin/';
      });
    }
  });
})();
