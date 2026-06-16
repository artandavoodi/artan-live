
/* =========================================================
  ARTAN.LIVE · THEME SYSTEM
  File: docs/assets/js/core/02-systems/theme.js
  Purpose: Minimal two-state light/dark theme runtime.
========================================================= */

const STORAGE_KEY = 'artan-live-theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';
const THEMES = new Set([THEME_LIGHT, THEME_DARK]);
const DEFAULT_THEME = THEME_LIGHT;

function normalizeTheme(value) {
  const theme = String(value || '').trim().toLowerCase();
  return THEMES.has(theme) ? theme : DEFAULT_THEME;
}

function getStoredTheme() {
  try {
    return normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch (_) {
    return DEFAULT_THEME;
  }
}

function storeTheme(theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, normalizeTheme(theme));
  } catch (_) {}
}

function applyTheme(theme) {
  const nextTheme = normalizeTheme(theme);
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  html.setAttribute('data-theme', nextTheme);
  html.setAttribute('data-theme-effective', nextTheme);
  html.style.colorScheme = nextTheme;

  if (toggle instanceof HTMLElement) {
    toggle.setAttribute('aria-pressed', nextTheme === THEME_DARK ? 'true' : 'false');
    toggle.setAttribute('aria-label', nextTheme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.dataset.themeCurrent = nextTheme;
  }

  storeTheme(nextTheme);
  document.dispatchEvent(new CustomEvent('artan-live:theme-changed', {
    detail: { theme: nextTheme },
  }));

  return nextTheme;
}

function toggleTheme() {
  const currentTheme = normalizeTheme(document.documentElement.getAttribute('data-theme'));
  return applyTheme(currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK);
}

function bindThemeToggle() {
  const toggle = document.getElementById('theme-toggle');

  if (!(toggle instanceof HTMLElement)) {
    return;
  }

  if (toggle.dataset.themeToggleBound === 'true') {
    return;
  }

  toggle.dataset.themeToggleBound = 'true';
  toggle.setAttribute('type', 'button');
  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    toggleTheme();
  });
}

function initThemeSystem() {
  applyTheme(getStoredTheme());
  bindThemeToggle();
}

initThemeSystem();

window.ArtanLiveTheme = Object.freeze({
  applyTheme,
  toggleTheme,
  initThemeSystem,
});
