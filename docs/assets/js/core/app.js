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

function getCurrentMenuRoute() {
  const pathname = window.location.pathname.replace(/\/index\.html$/, '/');

  if (pathname === '/') {
    return 'home';
  }

  return pathname.split('/').filter(Boolean)[0] || 'home';
}

function normalizeNavigationRouteTitle() {
  const routeTitle = document.querySelector('[data-cv-route-title]');
  const routeLabels = {
    about: 'About',
    publications: 'Publications',
    music: 'Music',
    projects: 'Projects',
  };

  if (!(routeTitle instanceof HTMLAnchorElement)) {
    return;
  }

  const currentRoute = getCurrentMenuRoute();
  const label = routeLabels[currentRoute];

  if (!label || isHomePage()) {
    routeTitle.hidden = true;
    routeTitle.setAttribute('aria-hidden', 'true');
    routeTitle.textContent = '';
    routeTitle.href = '/';
    return;
  }

  routeTitle.textContent = label;
  routeTitle.href = `/${currentRoute}/`;
  routeTitle.hidden = false;
  routeTitle.setAttribute('aria-hidden', 'false');
}

function normalizeSiteMenuRoutes() {
  const currentRoute = getCurrentMenuRoute();
  const menuLinks = document.querySelectorAll('[data-cv-menu-route]');

  menuLinks.forEach((link) => {
    if (!(link instanceof HTMLElement)) {
      return;
    }

    const isCurrentRoute = link.dataset.cvMenuRoute === currentRoute;
    link.hidden = isCurrentRoute;
    link.setAttribute('aria-hidden', isCurrentRoute ? 'true' : 'false');
  });
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

function bindRouteTitleVisibility() {
  const routeTitle = document.querySelector('[data-cv-route-title]');

  if (!(routeTitle instanceof HTMLElement) || isHomePage()) {
    return;
  }

  const updateVisibility = () => {
    routeTitle.dataset.visible = window.scrollY <= 8 ? 'true' : 'false';
  };

  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });
}

async function initializeArtanLive() {
  document.documentElement.dataset.appReady = 'false';
  applyStoredThemeBeforeRuntime();
  resetInitialScrollPosition();

  try {
    await mountFragments();
    await import('./02-systems/theme.js');
    normalizeInnerPageNavigation();
    normalizeNavigationRouteTitle();
    normalizeSiteMenuRoutes();
    bindSiteMenu();
    bindPrimaryNavigationVisibility();
    bindRouteTitleVisibility();

    if (document.querySelector('[data-cv-section="hero"]')) {
      await renderCv();
    }

    if (document.querySelector('[data-publications-list]')) {
      const { renderPublications } = await import('../layers/site/publications.js');
      await renderPublications();
    }

    if (document.querySelector('[data-music-sections]')) {
      const { renderMusic } = await import('../layers/site/music.js');
      await renderMusic();
    }

    if (document.querySelector('[data-project-sections]')) {
      const { renderProjects } = await import('../layers/site/projects.js');
      await renderProjects();
    }

    normalizeInnerPageFooter();
    document.documentElement.dataset.appReady = 'true';
    document.dispatchEvent(new CustomEvent('artan-live:ready'));
  } catch (error) {
    document.documentElement.dataset.appReady = 'error';
    console.error('[artan.live]', error);
  }
}

initializeArtanLive();