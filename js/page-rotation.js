/* ==========================================================================
   page-rotation.js
   Intelligente nahtlose Bildrotation (Carousel) für die Stilberatung-Seiten.
   ========================================================================== */
(() => {
  'use strict';

  const IMAGE_PREFIX = 'stilberatung';
  const IMAGE_DIR = 'images/';
  const MAX_PROBE = 50;
  const ROTATION_INTERVAL_MS = 4000; // in ms (Animationsintervall für die Bildrotation (Stilberatung))
  const ROTATION_TRANSITION_MS = 2000; // in ms (Animationsdauer für die Bildrotation (Stilberatung))

  function imageExists(url) {
    return new Promise(resolve => {
      const img = new Image();
      const timer = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 3000);

      img.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    });
  }

  async function discoverImages() {
    const urls = [];

    if (await imageExists(`${IMAGE_DIR}${IMAGE_PREFIX}.jpg`)) {
      urls.push(`${IMAGE_DIR}${IMAGE_PREFIX}.jpg`);
    }

    for (let i = 1; i <= MAX_PROBE; i++) {
      const num = String(i).padStart(2, '0');
      const url = `${IMAGE_DIR}${IMAGE_PREFIX}${num}.jpg`;
      if (await imageExists(url)) {
        urls.push(url);
      } else {
        break;
      }
    }

    return urls;
  }

  function initRotation(container) {
    discoverImages().then(urls => {
      // Mindestens 1 Bild benötigt
      if (urls.length === 0) return;

      container.innerHTML = '';

      const track = document.createElement('div');
      track.className = 'chapter-image-track';
      container.appendChild(track);

      // 1. Alle dynamisch gefundenen Bilder einfügen
      urls.forEach(url => {
        const img = document.createElement('img');
        img.className = 'chapter-image';
        img.src = url;
        img.alt = 'Stilberatung';
        track.appendChild(img);
      });

      // Nur weitermachen/Klon anfügen, wenn es mehr als 1 Bild gibt
      if (urls.length < 2) return;

      // 2. Duplikat des ersten Bildes ganz hinten anfügen
      const firstClone = document.createElement('img');
      firstClone.className = 'chapter-image';
      firstClone.src = urls[0];
      firstClone.alt = 'Stilberatung';
      firstClone.setAttribute('aria-hidden', 'true');
      track.appendChild(firstClone);

      const totalSlides = urls.length;
      let currentIndex = 0;
      let intervalId = null;

      function advance() {
        currentIndex++;

        // Weich zum nächsten Bild (bzw. am Ende zum Klon) wischen
        track.style.transition = `transform ${ROTATION_TRANSITION_MS}ms ease`;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      // Sobald die Animation am Klon (Ende) angekommen ist:
      track.addEventListener('transitionend', () => {
        if (currentIndex === totalSlides) {
          // Transition temporär abschalten
          track.style.transition = 'none';
          currentIndex = 0;
          // Unsichtbar zum echten 1. Bild zurückspringen
          track.style.transform = 'translateX(0)';
          // Browser-Reflow erzwingen
          void track.offsetWidth;
        }
      });

      function startRotation() {
        if (intervalId) return;
        intervalId = setInterval(advance, ROTATION_INTERVAL_MS);
      }

      function stopRotation() {
        if (!intervalId) return;
        clearInterval(intervalId);
        intervalId = null;
      }

      container.addEventListener('mouseenter', stopRotation);
      container.addEventListener('mouseleave', startRotation);
      container.addEventListener('touchstart', stopRotation, { passive: true });
      container.addEventListener('touchend', startRotation, { passive: true });

      startRotation();
    }).catch(error => {
      console.error('Fehler beim Entdecken der Bilder:', error);
    });
  }

  function init() {
    const containers = document.querySelectorAll('.chapter-image-container-rotation');
    containers.forEach(initRotation);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();