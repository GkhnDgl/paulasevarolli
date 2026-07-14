window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const hero = document.querySelector('.hero');
  const h1 = document.querySelector('.hero h1');
  const p = document.querySelector('.hero p');
  const btn = document.querySelector('.hero-btn');

  if (!hero || !h1 || !p) return;

  if (scrollY > 50) {
    const progress = Math.min((scrollY - 50) / 100, 1);
    const newHeight = 90 - 70 * progress;
    const newFontSize = 90 - 66 * progress;

    hero.style.height = newHeight + 'vh';
    h1.style.fontSize = newFontSize + 'px';
    p.style.opacity = 1 - progress;
    if (btn) {
      btn.style.opacity = 1 - progress;
    }
  } else {
    hero.style.position = 'relative';
    hero.style.height = '90vh';
    h1.style.fontSize = '90px';
    p.style.opacity = '1';
    if (btn) {
      btn.style.opacity = '1';
    }
    document.body.style.paddingTop = '0';
  }
});

function showSubpage(service) {
  const about = document.querySelector('.about');
  const services = document.querySelector('.services');
  const contact = document.querySelector('.contact');
  const subpage = document.getElementById(service);

  if (about) about.style.display = 'none';
  if (services) services.style.display = 'none';
  if (contact) contact.style.display = 'none';
  if (subpage) subpage.style.display = 'block';
  window.scrollTo(0, 0);
}

function showMain() {
  document.querySelectorAll('.subpage').forEach(sub => sub.style.display = 'none');

  const about = document.querySelector('.about');
  const services = document.querySelector('.services');
  const contact = document.querySelector('.contact');

  if (about) about.style.display = 'block';
  if (services) services.style.display = 'block';
  if (contact) contact.style.display = 'block';
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const service = card.getAttribute('data-service');
      if (service) {
        showSubpage(service);
      }
    });
    card.style.cursor = 'pointer';
  });

  document.querySelectorAll('.dropdown-menu a[data-service]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const service = link.getAttribute('data-service');
      if (service) {
        showSubpage(service);
      }
    });
  });
});