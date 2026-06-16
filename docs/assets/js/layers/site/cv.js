/* =========================================================
  ARTAN.LIVE · CV DATA RENDERER
  File: docs/assets/js/layers/site/cv.js
  Purpose: Render the public CV hub from JSON data sources.
========================================================= */

const DATA_PATHS = {
  profile: './assets/data/cv/profile.json',
  contact: './assets/data/cv/contact.json',
  status: './assets/data/cv/status.json',
  focus: './assets/data/cv/focus.json',
  projects: './assets/data/cv/projects.json',
  experience: './assets/data/cv/experience.json',
  certifications: './assets/data/cv/certifications.json',
  languages: './assets/data/cv/languages.json',
  links: './assets/data/cv/links.json',
};

const DETAIL_FRAGMENT_PATHS = {
  experience: './assets/fragments/details/experience.html',
  certifications: './assets/fragments/details/certifications.html',
  languages: './assets/fragments/details/languages.html',
};

let detailOverlayScrollY = 0;
let heroTouchStartY = 0;

const ICON_PATHS = {
  website: './registry/icons/public/assets/core/platform/website/website.svg',
  platform: './registry/icons/public/assets/layers/website/navigation/actions/icos.svg',
  github: './registry/icons/public/assets/system/social/github.svg',
  linkedin: './registry/icons/public/assets/system/social/linkedin.svg',
  behance: './registry/icons/public/assets/system/social/behance.svg',
  orcid: './registry/icons/public/assets/system/social/orcid.svg',
  email: './registry/icons/public/assets/system/social/email.svg',
  download: './registry/icons/public/assets/core/actions/download/download.svg',
  open: './registry/icons/public/assets/core/actions/open/open.svg',
  focus: './registry/icons/public/assets/system/cv/focus.svg',
  projects: './registry/icons/public/assets/system/cv/projects.svg',
  experience: './registry/icons/public/assets/system/cv/experience.svg',
  certifications: './registry/icons/public/assets/system/cv/certifications.svg',
  languages: './registry/icons/public/assets/system/cv/languages.svg',
  links: './registry/icons/public/assets/system/cv/links.svg',
  plus: './registry/icons/public/assets/core/actions/create/plus.svg',
  minus: './registry/icons/public/assets/core/actions/minus/minus.svg',
  neuroartanLogo: './assets/brand/neuroartan/logo-typo.svg',
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

function stripTerminalPeriod(value) {
  return String(value || '').replace(/\.$/, '');
}

function createIcon(icon, label) {
  if (!icon || !ICON_PATHS[icon]) {
    return null;
  }

  const image = createElement('img', 'ui-icon-theme-aware');
  image.src = ICON_PATHS[icon];
  image.alt = '';
  image.width = 24;
  image.height = 24;
  image.loading = 'lazy';
  image.setAttribute('aria-hidden', 'true');
  image.dataset.iconName = icon;

  if (label) {
    image.dataset.iconLabel = label;
  }

  return image;
}

function createBrandLogo(src, label) {
  const image = createElement('img', 'cv-brand-logo');
  image.src = src;
  image.alt = label;
  image.width = 240;
  image.height = 48;
  image.loading = 'lazy';
  return image;
}

function createLink({ href, label, className, icon, iconOnly = false }) {
  const anchor = createElement('a', className);
  anchor.href = href;
  anchor.setAttribute('aria-label', label);

  if (href.startsWith('http')) {
    anchor.rel = 'noopener';
  }

  const iconElement = createIcon(icon, label);

  if (iconElement) {
    anchor.append(iconElement);
  }

  if (!iconOnly) {
    anchor.append(createElement('span', 'cv-link-label', label));
  }

  return anchor;
}

function renderSectionIcon(sectionName, iconName) {
  const section = document.querySelector(`[data-cv-section="${sectionName}"]`);
  const title = section?.querySelector('.cv-section__title');

  if (!(title instanceof HTMLElement)) {
    return;
  }

  const icon = createIcon(iconName, title.textContent);

  if (!icon) {
    return;
  }

  title.replaceChildren(icon, createElement('span', 'cv-section__title-text', title.textContent));
  title.dataset.sectionIcon = iconName;
}

function renderSectionIcons() {
  renderSectionIcon('focus', 'focus');
  renderSectionIcon('work', 'projects');
  renderSectionIcon('links', 'links');
}

async function fetchJson(path) {
  const url = new URL(path, window.location.href);
  url.searchParams.set('v', Date.now().toString());

  const response = await fetch(url.href, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Unable to load CV data: ${path}`);
  }

  return response.json();
}

async function fetchText(path) {
  const url = new URL(path, window.location.href);
  url.searchParams.set('v', Date.now().toString());

  const response = await fetch(url.href, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Unable to load CV fragment: ${path}`);
  }

  return response.text();
}

async function loadCvData() {
  const entries = await Promise.all(
    Object.entries(DATA_PATHS).map(async ([key, path]) => [key, await fetchJson(path)]),
  );

  return Object.fromEntries(entries);
}

function renderHero(data) {
  const target = document.querySelector('[data-cv-section="hero"]');

  if (!target) {
    return;
  }

  const media = createElement('figure', 'cv-portrait');
  const image = createElement('img');
  image.src = data.profile.portrait.src;
  image.alt = data.profile.portrait.alt;
  image.loading = 'eager';
  media.append(image);

  const content = createElement('div', 'cv-hero__content');
  const secondary = createElement('div', 'cv-hero__secondary');

  content.append(
    createElement('h1', 'cv-title', data.profile.identity.displayName),
    createElement('p', 'cv-role', data.profile.headline),
    createElement('p', 'cv-subtitle', data.profile.subtitle),
  );

  const actions = createElement('div', 'cv-actions');
  actions.setAttribute('aria-label', 'Primary links');
  const emailAction = createLink({ href: data.contact.primaryEmail.href, label: data.contact.primaryEmail.label, className: 'cv-action cv-action--email', icon: 'email' });
  emailAction.append(createElement('span', 'cv-action__tooltip', data.contact.primaryEmail.value));

  actions.append(
    emailAction,
    createLink({ href: data.profile.cv.href, label: data.profile.cv.label, className: 'cv-action', icon: 'download' }),
  );

  secondary.append(
    createElement('p', 'cv-location', data.profile.location),
    createElement('p', 'cv-summary', data.profile.summary),
    actions,
  );

  content.append(secondary);
  target.replaceChildren(media, content);
}

function setHeroStage(isExpanded) {
  document.documentElement.dataset.heroStage = isExpanded ? 'expanded' : 'compact';
}

function isHeroStageCandidate() {
  const hero = document.querySelector('.cv-page--hero');

  if (!(hero instanceof HTMLElement)) {
    return false;
  }

  const bounds = hero.getBoundingClientRect();
  return bounds.top <= 8 && bounds.bottom > window.innerHeight * 0.58;
}

function expandHeroStage() {
  if (document.documentElement.dataset.heroStage === 'expanded') {
    return false;
  }

  setHeroStage(true);
  return true;
}

function collapseHeroStage() {
  if (document.documentElement.dataset.heroStage !== 'expanded') {
    return false;
  }

  setHeroStage(false);
  return true;
}

function bindHeroStageReveal() {
  setHeroStage(false);

  window.addEventListener('wheel', (event) => {
    if (!isHeroStageCandidate()) {
      return;
    }

    if (event.deltaY > 0 && expandHeroStage()) {
      event.preventDefault();
      return;
    }

    if (event.deltaY < 0 && collapseHeroStage()) {
      event.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchstart', (event) => {
    heroTouchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    const currentY = event.touches[0]?.clientY || 0;
    const movement = heroTouchStartY - currentY;

    if (!isHeroStageCandidate()) {
      return;
    }

    if (movement > 18 && expandHeroStage()) {
      event.preventDefault();
      return;
    }

    if (movement < -18 && collapseHeroStage()) {
      event.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    const revealKeys = ['ArrowDown', 'PageDown', ' '];
    const collapseKeys = ['ArrowUp', 'PageUp'];

    if (!isHeroStageCandidate()) {
      return;
    }

    if (revealKeys.includes(event.key) && expandHeroStage()) {
      event.preventDefault();
      return;
    }

    if (collapseKeys.includes(event.key) && collapseHeroStage()) {
      event.preventDefault();
    }
  });

  window.addEventListener('scroll', () => {
    if ((window.scrollY || document.documentElement.scrollTop || 0) <= 2) {
      setHeroStage(false);
    }
  }, { passive: true });
}

function renderFocus(data) {
  const target = document.querySelector('[data-cv-list="focus"]');

  if (!target) {
    return;
  }

  target.replaceChildren(
    ...data.focus.items.map((item, index) => {
      const element = createElement('article', 'cv-focus-row');
      const number = createElement('span', 'cv-focus-row__number', String(index + 1).padStart(2, '0'));
      const content = createElement('div', 'cv-focus-row__content');

      content.append(
        createElement('h3', 'cv-focus-row__title', item.label),
        createElement('p', 'cv-focus-row__text', item.description),
      );

      element.style.setProperty('--focus-row-index', index);
      element.append(number, content);
      return element;
    }),
  );
}

function bindSectionReveal(selector, visibleAttribute) {
  const section = document.querySelector(selector);

  if (!(section instanceof HTMLElement) || section.dataset.revealBound === 'true') {
    return;
  }

  section.dataset.revealBound = 'true';

  if (!('IntersectionObserver' in window)) {
    section.dataset[visibleAttribute] = 'true';
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      section.dataset[visibleAttribute] = entry.isIntersecting ? 'true' : 'false';
    },
    {
      root: null,
      threshold: 0.42,
    },
  );

  observer.observe(section);
}

function bindFocusReveal() {
  bindSectionReveal('.cv-page--focus', 'focusVisible');
}

function bindWorkReveal() {
  bindSectionReveal('.cv-page--work', 'workVisible');
}

function bindDetailsReveal() {
  bindSectionReveal('.cv-page--details', 'detailsVisible');
}

function createProjectScopeRow(item, index) {
  const scope = typeof item === 'string' ? { label: item, href: '' } : item;
  const labelText = String(scope.label || '').trim();
  const href = String(scope.href || '').trim();
  const element = createElement(href ? 'a' : 'div', 'cv-project-scope-row');
  const number = createElement('span', 'cv-project-scope-row__number', String(index + 1).padStart(2, '0'));
  const label = createElement('span', 'cv-project-scope-row__label', labelText);
  const actionIcon = href ? createIcon('open', 'Open link') : null;

  if (href) {
    element.href = href;
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
    element.setAttribute('aria-label', labelText);
  }

  element.style.setProperty('--project-scope-index', index);
  element.append(number, label);

  if (actionIcon) {
    actionIcon.classList.add('cv-project-scope-row__action');
    element.append(actionIcon);
  }
  return element;
}

function renderProjects(data) {
  const target = document.querySelector('[data-cv-list="projects"]');

  if (!target) {
    return;
  }

  target.replaceChildren(
    ...data.projects.items.map((project) => {
      const article = createElement('article', 'cv-card cv-card--project');
      const title = createElement('h3', 'cv-card__title cv-card__title--brand');

      if (project.name === 'Neuroartan') {
        title.append(createBrandLogo(ICON_PATHS.neuroartanLogo, project.name));
      } else {
        title.textContent = project.name;
      }

      article.append(
        title,
        createElement('p', 'cv-card__text', project.summary),
      );

      const meta = createElement('div', 'cv-project-scope-list');
      project.scope.forEach((item, index) => meta.append(createProjectScopeRow(item, index)));
      article.append(meta);

      article.append(createLink({ href: project.url, label: 'Visit project', className: 'cv-card__link', icon: 'platform' }));
      return article;
    }),
  );
}

function createDetailTrigger({ key, label, description, icon }, index = 0) {
  const button = createElement('button', 'cv-detail-trigger');
  button.type = 'button';
  button.dataset.detailKey = key;
  button.setAttribute('aria-expanded', 'false');
  button.style.setProperty('--detail-trigger-index', index);

  const iconElement = createIcon(icon, label);
  const plusIcon = createIcon('plus', 'Open');
  const minusIcon = createIcon('minus', 'Close');
  const textElement = createElement('span', 'cv-detail-trigger__text');
  const labelElement = createElement('span', 'cv-detail-trigger__label', label);
  const descriptionElement = createElement('span', 'cv-detail-trigger__description', description);
  const stateElement = createElement('span', 'cv-detail-trigger__state');

  if (plusIcon) {
    plusIcon.dataset.detailStateIcon = 'plus';
    stateElement.append(plusIcon);
  }

  if (minusIcon) {
    minusIcon.dataset.detailStateIcon = 'minus';
    stateElement.append(minusIcon);
  }

  if (iconElement) {
    button.append(iconElement);
  }

  textElement.append(labelElement, descriptionElement);
  button.append(textElement, stateElement);
  return button;
}

function renderDetailTriggers() {
  const target = document.querySelector('[data-cv-list="detail-triggers"]');

  if (!target) {
    return;
  }

  const triggers = [
    {
      key: 'experience',
      label: 'Experience',
      description: 'Professional roles and applied work history',
      icon: 'experience',
    },
    {
      key: 'certifications',
      label: 'Certifications',
      description: 'Selected verified training and professional certificates',
      icon: 'certifications',
    },
    {
      key: 'languages',
      label: 'Languages',
      description: 'English fluent · Persian native',
      icon: 'languages',
    },
  ];

  target.replaceChildren(...triggers.map((trigger, index) => createDetailTrigger(trigger, index)));
}

function createRecordList(items, renderer) {
  const list = createElement('div', 'cv-detail-record-list');
  items.forEach((item) => list.append(renderer(item)));
  return list;
}

function createExperienceRecord(item) {
  const article = createElement('article', 'cv-detail-record cv-detail-record--collapsible');
  const header = createElement('button', 'cv-detail-record__toggle');
  const primary = createElement('span', 'cv-detail-record__primary');
  const text = createElement('span', 'cv-detail-record__text');
  const state = createElement('span', 'cv-detail-record__state');
  const plusIcon = createIcon('plus', 'Open experience details');
  const minusIcon = createIcon('minus', 'Close experience details');
  const details = createElement('div', 'cv-detail-record__details');

  header.type = 'button';
  header.setAttribute('aria-expanded', 'false');

  const dateMeta = `${item.startDate} – ${item.endDate}`;
  const locationMeta = String(item.location || '').trim();
  const typeMeta = String(item.type || '').trim();

  text.append(
    createElement('span', 'cv-record__meta', dateMeta),
    createElement('span', 'cv-record__title', item.organization),
    createElement('span', 'cv-record__role', item.role),
  );

  if (locationMeta) {
    text.append(createElement('span', 'cv-record__location', locationMeta));
  }

  primary.append(text);

  if (plusIcon) {
    plusIcon.dataset.recordStateIcon = 'plus';
    state.append(plusIcon);
  }

  if (minusIcon) {
    minusIcon.dataset.recordStateIcon = 'minus';
    state.append(minusIcon);
  }

  details.hidden = true;
  if (typeMeta) {
    details.append(createElement('p', 'cv-record__type', typeMeta));
  }

  details.append(createElement('p', 'cv-record__text', stripTerminalPeriod(item.summary)));

  header.append(primary, state);
  header.addEventListener('click', () => {
    const isOpen = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    article.toggleAttribute('data-open', !isOpen);
    details.hidden = isOpen;
  });

  article.append(header, details);
  return article;
}

function createCertificationRecord(item) {
  const article = createElement('article', 'cv-detail-record');
  article.append(
    createElement('p', 'cv-record__meta', `${item.provider} · ${item.completed}`),
    createElement('h3', 'cv-record__title', item.title),
    createElement('p', 'cv-record__role', item.category),
  );
  return article;
}

function createLanguageRecord(item) {
  const article = createElement('article', 'cv-detail-record');
  article.append(
    createElement('h3', 'cv-record__title', item.language),
    createElement('p', 'cv-record__role', item.level),
  );
  return article;
}

function getDetailContent(key, data) {
  if (key === 'experience') {
    return {
      fragmentPath: DETAIL_FRAGMENT_PATHS.experience,
      contentSelector: '[data-cv-detail-fragment-content="experience"]',
      records: createRecordList(data.experience.items, createExperienceRecord),
    };
  }

  if (key === 'certifications') {
    return {
      fragmentPath: DETAIL_FRAGMENT_PATHS.certifications,
      contentSelector: '[data-cv-detail-fragment-content="certifications"]',
      records: createRecordList(data.certifications.items, createCertificationRecord),
    };
  }

  if (key === 'languages') {
    return {
      fragmentPath: DETAIL_FRAGMENT_PATHS.languages,
      contentSelector: '[data-cv-detail-fragment-content="languages"]',
      records: createRecordList(data.languages.items, createLanguageRecord),
    };
  }

  return null;
}

function setActiveDetailTrigger(key) {
  document.querySelectorAll('[data-detail-key]').forEach((trigger) => {
    const isActive = trigger.getAttribute('data-detail-key') === key;
    trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    trigger.toggleAttribute('data-active', isActive);
  });
}

function lockPageScroll() {
  detailOverlayScrollY = window.scrollY || document.documentElement.scrollTop || 0;
}

function unlockPageScroll() {
  window.scrollTo({ top: detailOverlayScrollY, left: 0, behavior: 'instant' });
}

function closeDetailOverlay() {
  const overlay = document.querySelector('[data-cv-detail-overlay]');

  if (!(overlay instanceof HTMLElement)) {
    return;
  }

  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.removeAttribute('data-detail-overlay-open');
  unlockPageScroll();
  setActiveDetailTrigger('');
}

async function openDetailOverlay(key, data) {
  const overlay = document.querySelector('[data-cv-detail-overlay]');
  const content = document.querySelector('[data-cv-detail-content]');
  const detail = getDetailContent(key, data);

  if (!(overlay instanceof HTMLElement) || !content || !detail) {
    return;
  }

  content.innerHTML = await fetchText(detail.fragmentPath);

  const fragmentContent = content.querySelector(detail.contentSelector);

  if (fragmentContent) {
    fragmentContent.replaceChildren(detail.records);
  }

  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  document.documentElement.setAttribute('data-detail-overlay-open', 'true');
  lockPageScroll();
  setActiveDetailTrigger(key);
  
  const panel = overlay.querySelector('.cv-detail-overlay__panel');
  if (panel instanceof HTMLElement) {
    panel.scrollTop = 0;
  }
}

function bindDetailOverlay(data) {
  document.querySelectorAll('[data-detail-key]').forEach((trigger) => {
    if (trigger.dataset.detailBound === 'true') {
      return;
    }

    trigger.dataset.detailBound = 'true';
    trigger.addEventListener('click', async () => {
      const key = trigger.getAttribute('data-detail-key');
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        closeDetailOverlay();
        return;
      }

      await openDetailOverlay(key, data);
    });
  });

  document.querySelectorAll('[data-cv-detail-close]').forEach((trigger) => {
    if (trigger.dataset.detailCloseBound === 'true') {
      return;
    }

    trigger.dataset.detailCloseBound = 'true';
    trigger.addEventListener('click', closeDetailOverlay);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDetailOverlay();
    }
  });
}


function getVisibleProfessionalLinks(data) {
  return data.links.items.filter((item) => {
    const href = String(item.href || '').trim();
    const label = String(item.label || '').trim().toLowerCase();

    return href !== 'https://artan.live' && label !== 'website';
  });
}

function createFooterLink({ href, label, icon, type }) {
  const anchor = createLink({
    href,
    label,
    className: 'cv-footer-link',
    icon,
    iconOnly: true,
  });

  anchor.dataset.footerLinkType = type;
  return anchor;
}

function renderLinks(data) {
  const target = document.querySelector('[data-cv-list="links"]');

  if (!target) {
    return;
  }

  target.replaceChildren();
}

function renderFooterLinks(data) {
  const target = document.querySelector('[data-cv-list="footer-links"]');

  if (!target) {
    return;
  }

  const links = getVisibleProfessionalLinks(data);

  target.replaceChildren(...links.map(createFooterLink));
}

function renderSchema(data) {
  const target = document.querySelector('#cv-schema');

  if (!target) {
    return;
  }

  target.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.profile.identity.publicName,
    alternateName: data.profile.identity.legalName,
    jobTitle: data.profile.headline,
    email: data.contact.primaryEmail.value,
    url: 'https://artan.live',
    sameAs: data.links.items
      .map((item) => item.href)
      .filter((href) => href !== 'https://artan.live'),
  });
}

export async function renderCv() {
  const data = await loadCvData();

  renderHero(data);
  bindHeroStageReveal();
  renderFocus(data);
  bindFocusReveal();
  renderProjects(data);
  bindWorkReveal();
  renderDetailTriggers();
  bindDetailsReveal();
  renderLinks(data);
  renderFooterLinks(data);
  renderSchema(data);
  renderSectionIcons();
  bindDetailOverlay(data);

  document.dispatchEvent(new CustomEvent('artan-live:cv-ready'));
}