const REGION_CONFIGS = {
  BR: {
    defaultLang: 'br-pt',
    availableLangs: [
      { code: 'br-pt', label: 'PT' },
      { code: 'br-en', label: 'EN' }
    ]
  },
  DEFAULT: {
    defaultLang: 'de',
    availableLangs: [
      { code: 'de', label: 'DE' },
      { code: 'pt', label: 'PT' }
    ]
  }
};

let currentLang = 'de';
let currentRegionConfig = REGION_CONFIGS.DEFAULT;

function renderLanguageButtons() {
  const container = document.getElementById('lang-switcher');
  if (!container) return;

  container.innerHTML = '';

  currentRegionConfig.availableLangs.forEach(langObj => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang';
    btn.setAttribute('data-lang', langObj.code);
    btn.textContent = langObj.label;

    btn.addEventListener('click', () => {
      setLanguage(langObj.code);
    });

    container.appendChild(btn);
  });
}

function updateLanguageButtons() {
  document.querySelectorAll('.lang').forEach(button => {
    const isActive = button.getAttribute('data-lang') === currentLang;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

async function loadLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    const translations = await response.json();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = key.split('.').reduce((o, i) => o?.[i], translations);

      if (value) {
        // Textknoten austauschen, ohne verschachtelte HTML-Elemente wie SVGs zu löschen
        const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        textNodes.forEach(node => node.remove());
        const textNode = document.createTextNode(value);
        el.prepend(textNode);
      }
    });

    document.dispatchEvent(new CustomEvent('i18n:loaded', {
      detail: { lang, translations }
    }));
  } catch (err) {
    console.error(`Fehler beim Laden von lang/${lang}.json:`, err);
  }
}

function setLanguage(lang) {
  currentLang = lang;
  loadLanguage(lang);
  localStorage.setItem('lang', lang);
  updateLanguageButtons();
}

async function detectRegion() {
  // Test-Modus per URL (?geo=BR)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('geo')?.toUpperCase() === 'BR') {
    return REGION_CONFIGS.BR;
  }

  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.country_code === 'BR') {
      return REGION_CONFIGS.BR;
    }
  } catch (err) {
    console.warn('Geo-IP konnte nicht geladen werden:', err);
  }

  return REGION_CONFIGS.DEFAULT;
}

// Initialisierung auf jeder Seite
document.addEventListener('DOMContentLoaded', async () => {
  currentRegionConfig = await detectRegion();
  renderLanguageButtons();

  const savedLang = localStorage.getItem('lang');
  const isValidSavedLang = currentRegionConfig.availableLangs.some(l => l.code === savedLang);

  if (savedLang && isValidSavedLang) {
    setLanguage(savedLang);
  } else {
    setLanguage(currentRegionConfig.defaultLang);
  }
});
