/**
 * Dynamic Page Image Rotation with WebP & JPG Fallback
 *
 * Target page: stilberatung.html
 * Naming convention:
 *   - Main image: images/stilberatung.webp (or .jpg)
 *   - Additional images: images/stilberatung01.webp, images/stilberatung02.webp, ...
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.chapter-image-container-rotation');
  if (!container) return;

  const CONFIG = {
    imageDir: 'images/',
    imagePrefix: 'stilberatung',
    intervalMs: 5000,
    transitionMs: 2000,
    maxProbe: 20
  };

  /**
   * Helper function to test if an image URL is valid and reachable.
   */
  function checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * Discovers available image pairs (WebP preferred, JPG fallback).
   */
  async function discoverImages() {
    const validUrls = [];

    // 1. Test main image (stilberatung.webp -> stilberatung.jpg)
    const mainWebP = `${CONFIG.imageDir}${CONFIG.imagePrefix}.webp`;
    const mainJpg = `${CONFIG.imageDir}${CONFIG.imagePrefix}.jpg`;

    if (await checkImageExists(mainWebP)) {
      validUrls.push(mainWebP);
    } else if (await checkImageExists(mainJpg)) {
      validUrls.push(mainJpg);
    }

    // 2. Test numbered images (stilberatung01, stilberatung02, ...)
    for (let i = 1; i <= CONFIG.maxProbe; i++) {
      const numStr = String(i).padStart(2, '0');
      const webpUrl = `${CONFIG.imageDir}${CONFIG.imagePrefix}${numStr}.webp`;
      const jpgUrl = `${CONFIG.imageDir}${CONFIG.imagePrefix}${numStr}.jpg`;

      if (await checkImageExists(webpUrl)) {
        validUrls.push(webpUrl);
      } else if (await checkImageExists(jpgUrl)) {
        validUrls.push(jpgUrl);
      } else {
        // Stop probe sequence on first gap
        break;
      }
    }

    return validUrls;
  }

  /**
   * Preloads the first image so the carousel shows immediately.
   */
  function preloadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }

  /**
   * Initializes image rotation logic.
   */
  async function initRotation() {
    const images = await discoverImages();

    if (images.length === 0) {
      console.warn('Page-Rotation: No valid images found.');
      return;
    }

    // Preload the first image so the carousel shows immediately
    await preloadImage(images[0]);

    container.innerHTML = '';
    const track = document.createElement('div');
    track.className = 'chapter-image-track';
    container.appendChild(track);

    images.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Stilberatung ${index + 1}`;
      img.className = 'chapter-image';
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      track.appendChild(img);
    });

    if (images.length < 2) return;

    const firstClone = document.createElement('img');
    firstClone.src = images[0];
    firstClone.alt = '';
    firstClone.className = 'chapter-image';
    firstClone.loading = 'lazy';
    firstClone.decoding = 'async';
    firstClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);

    let currentIndex = 0;

    function advance() {
      currentIndex++;
      track.style.transition = `transform ${CONFIG.transitionMs}ms ease`;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Seamless loop: jump back to first image after reaching the last one
    track.addEventListener('transitionend', () => {
      if (currentIndex === images.length) {
        track.style.transition = 'none';
        currentIndex = 0;
        track.style.transform = 'translateX(0)';
        void track.offsetWidth;
      }
    });

    let rotationTimer = null;

    function startRotation() {
      stopRotation();
      rotationTimer = setInterval(advance, CONFIG.intervalMs);
    }

    function stopRotation() {
      if (rotationTimer !== null) {
        clearInterval(rotationTimer);
        rotationTimer = null;
      }
    }

    container.addEventListener('mouseenter', stopRotation);
    container.addEventListener('mouseleave', startRotation);
    container.addEventListener('touchstart', stopRotation, { passive: true });
    container.addEventListener('touchend', startRotation, { passive: true });

    startRotation();
  }

  initRotation();
});
