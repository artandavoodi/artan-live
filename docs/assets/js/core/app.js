/* =========================================================
  ARTAN.LIVE · APP ENTRY
  File: docs/assets/js/core/app.js
  Purpose: Initialize the public CV hub runtime.
========================================================= */

import { mountFragments } from './fragments.js';
import { renderCv } from '../layers/site/cv.js';

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

async function initializeArtanLive() {
  document.documentElement.dataset.appReady = 'false';

  try {
    await mountFragments();
    bindSiteMenu();
    await import('./02-systems/theme.js');
    await renderCv();
    document.documentElement.dataset.appReady = 'true';
    document.dispatchEvent(new CustomEvent('artan-live:ready'));
  } catch (error) {
    document.documentElement.dataset.appReady = 'error';
    console.error('[artan.live]', error);
  }
}

initializeArtanLive();