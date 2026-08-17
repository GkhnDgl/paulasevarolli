const REGION_CONFIGS = {
  BR: {
    defaultLang: 'br-pt',
    availableLangs: [{ code: 'br-pt', label: 'PT' }, { code: 'br-en', label: 'EN' }]
  },
  DEFAULT: {
    defaultLang: 'de',
    availableLangs: [{ code: 'de', label: 'DE' }, { code: 'pt', label: 'PT' }]
  }
};

let currentLang = 'de';
let currentRegionConfig = REGION_CONFIGS.DEFAULT;
let languageRequestId = 0;

const getTranslation = (translations, key) =>
  key.split('.').reduce((value, part) => value?.[part], translations);

function renderLanguageButtons() {
  const container = document.getElementById('lang-switcher');
  if (!container) return;

  container.replaceChildren(...currentRegionConfig.availableLangs.map(({ code, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lang';
    button.dataset.lang = code;
    button.textContent = label;
    button.addEventListener('click', () => void setLanguage(code));
    return button;
  }));
}

function updateLanguageButtons() {
  document.querySelectorAll('.lang').forEach(button => {
    const isActive = button.dataset.lang === currentLang;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const value = getTranslation(translations, element.dataset.i18n);
    if (typeof value !== 'string') return;

    Array.from(element.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .forEach(node => node.remove());
    element.prepend(document.createTextNode(value));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const value = getTranslation(translations, element.dataset.i18nPlaceholder);
    if (typeof value === 'string') element.setAttribute('placeholder', value);
  });
}

async function loadLanguage(lang) {
  const response = await fetch(`lang/${lang}.json`);
  if (!response.ok) throw new Error(`Übersetzung konnte nicht geladen werden (${response.status}).`);

  return response.json();
}

async function setLanguage(lang) {
  if (!currentRegionConfig.availableLangs.some(option => option.code === lang)) return;
  const requestId = ++languageRequestId;

  try {
    const translations = await loadLanguage(lang);
    if (requestId !== languageRequestId) return;

    applyTranslations(translations);
    currentLang = lang;
    document.documentElement.lang = lang === 'br-pt' ? 'pt-BR' : lang.split('-').pop();
    localStorage.setItem('lang', lang);
    updateLanguageButtons();
    document.dispatchEvent(new CustomEvent('i18n:loaded', { detail: { lang, translations } }));
  } catch (error) {
    console.error(`Fehler beim Laden von lang/${lang}.json:`, error);
  }
}

function detectRegion() {
  // Browser locale avoids a slow external Geo-IP call and the related privacy leak.
  const forcedRegion = new URLSearchParams(window.location.search).get('geo')?.toUpperCase();
  if (forcedRegion === 'BR') return REGION_CONFIGS.BR;
  return navigator.language?.toLowerCase() === 'pt-br' ? REGION_CONFIGS.BR : REGION_CONFIGS.DEFAULT;
}

function initI18n() {
  currentRegionConfig = detectRegion();
  renderLanguageButtons();

  const savedLang = localStorage.getItem('lang');
  const initialLang = currentRegionConfig.availableLangs.some(option => option.code === savedLang)
    ? savedLang
    : currentRegionConfig.defaultLang;
  void setLanguage(initialLang);
}

// Globale Funktion für nav-loader.js
window.reinitI18n = () => {
  renderLanguageButtons();
  const savedLang = localStorage.getItem('lang');
  if (savedLang && currentRegionConfig.availableLangs.some(option => option.code === savedLang)) {
    void setLanguage(savedLang);
  }
};

document.addEventListener('DOMContentLoaded', initI18n);
