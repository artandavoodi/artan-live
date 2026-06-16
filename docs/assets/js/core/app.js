/* =========================================================
  ARTAN.LIVE · APP ENTRY
  File: docs/assets/js/core/app.js
  Purpose: Initialize the public CV hub runtime.
========================================================= */

import { mountFragments } from './fragments.js';
import { renderCv } from '../layers/site/cv.js';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function resetInitialScrollPosition() {
  if (window.location.hash) {
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function applyStoredThemeBeforeRuntime() {
  const storedTheme = localStorage.getItem('artan-live-theme');
  const theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-theme-effective', theme);
  document.documentElement.style.colorScheme = theme;
}

function setMenuOpen(isOpen) {
  const menu = document.querySelector('[data-cv-menu]');
  const toggle = document.querySelector('[data-cv-menu-toggle]');

  if (!(menu instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) {
    return;
  }

  menu.hidden = !isOpen;
  menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  document.documentElement.toggleAttribute('data-cv-menu-open', isOpen);
}

function bindSiteMenu() {
  const toggle = document.querySelector('[data-cv-menu-toggle]');
  const close = document.querySelector('[data-cv-menu-close]');
  const menu = document.querySelector('[data-cv-menu]');

  if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  close?.addEventListener('click', () => setMenuOpen(false));

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });
}

function isHomePage() {
  return window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
}

function normalizeInnerPageNavigation() {
  const primaryNavigation = document.querySelector('[data-cv-primary-navigation]');

  if (!(primaryNavigation instanceof HTMLElement)) {
    return;
  }

  if (isHomePage()) {
    primaryNavigation.hidden = false;
    primaryNavigation.removeAttribute('aria-hidden');
    return;
  }

  primaryNavigation.replaceChildren();
  primaryNavigation.hidden = true;
  primaryNavigation.setAttribute('aria-hidden', 'true');
  primaryNavigation.dataset.visible = 'false';
}

function normalizeInnerPageFooter() {
  const footerLinks = document.querySelector('.cv-footer__links');

  if (!(footerLinks instanceof HTMLElement)) {
    return;
  }

  footerLinks.hidden = !isHomePage();
  footerLinks.setAttribute('aria-hidden', isHomePage() ? 'false' : 'true');
}

function bindPrimaryNavigationVisibility() {
  const hero = document.querySelector('.cv-page--hero');
  const primaryNavigation = document.querySelector('[data-cv-primary-navigation]');

  if (!(hero instanceof HTMLElement) || !(primaryNavigation instanceof HTMLElement)) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    primaryNavigation.dataset.visible = 'true';
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    primaryNavigation.dataset.visible = entry.isIntersecting ? 'true' : 'false';
  }, { root: null, threshold: 0.38 });

  observer.observe(hero);
}

async function initializeArtanLive() {
  document.documentElement.dataset.appReady = 'false';
  applyStoredThemeBeforeRuntime();
  resetInitialScrollPosition();

  try {
    await mountFragments();
    await import('./02-systems/theme.js');
    normalizeInnerPageNavigation();
    bindSiteMenu();
    bindPrimaryNavigationVisibility();
    await renderCv();
    normalizeInnerPageFooter();
    document.documentElement.dataset.appReady = 'true';
    document.dispatchEvent(new CustomEvent('artan-live:ready'));
  } catch (error) {
    document.documentElement.dataset.appReady = 'error';
    console.error('[artan.live]', error);
  }
}

initializeArtanLive();