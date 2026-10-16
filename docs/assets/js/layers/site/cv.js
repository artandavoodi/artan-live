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

const ICON_PATHS = {
  website: './assets/brand/logo/symbol-artan.svg',
  'artan-records': { src: './assets/brand/logo/artan-records-symbol-black.svg', darkSrc: './assets/brand/logo/artan-records-symbol-white.svg' },
  instagram: './registry/icons/public/assets/system/social/instagram.svg',
  facebook: './registry/icons/public/assets/layers/website/social/platforms/facebook.svg',
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
  experience: './registry/icons/public/assets/core/interface/status/experience.svg',
  certifications: './registry/icons/public/assets/layers/website/profile/social/Award.svg',
  languages: './registry/icons/public/assets/core/navigation/language/language.svg',
  links: './registry/icons/public/assets/system/cv/links.svg',
  plus: './registry/icons/public/assets/core/actions/create/plus.svg',
  minus: './registry/icons/public/assets/core/actions/minus/minus.svg',
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
  const source = ICON_PATHS[icon];
  image.src = typeof source === 'string' ? source : source.src;
  if (source.darkSrc) {
    image.dataset.lightSrc = source.src;
    image.dataset.darkSrc = source.darkSrc;
    image.src = document.documentElement.dataset.theme === 'dark' ? source.darkSrc : source.src;
  }
  if (icon === 'website') image.dataset.darkMonochrome = 'true';
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
  if(data.profile.portrait.variants?.length) {
    image.srcset=data.profile.portrait.variants.map(v=>`${v.src} ${v.width}w`).join(', ');
    image.sizes=data.profile.portrait.sizes;
  }
  image.alt = data.profile.portrait.alt;
  image.loading = 'eager';
  media.append(image);

  const content = createElement('div', 'cv-hero__content');
  const secondary = document.querySelector('[data-cv-section="availability"]');

  content.append(
    createElement('h1', 'cv-title', data.profile.identity.displayName),
    createElement('p', 'cv-role', data.profile.headline),
    createElement('p', 'cv-subtitle', data.profile.subtitle),
  );
  content.querySelector('h1').id='cv-title';

  const availabilityTitle=createElement('h2','cv-availability__title');
  data.status.availability.headline.forEach((line,index)=>{
    const span=createElement('span','cv-availability__line',line);
    span.style.setProperty('--availability-line-index',index);
    availabilityTitle.append(span);
    if(index<data.status.availability.headline.length-1)availabilityTitle.append(document.createTextNode(' '));
  });
  secondary.replaceChildren(availabilityTitle,createElement('p','cv-summary',data.status.availability.summary));

  if (data.profile.cv.publish !== false) {
    const actions = createElement('div', 'cv-actions');
    actions.setAttribute('aria-label', 'Primary links');
    actions.append(createLink({ href: data.profile.cv.href, label: data.profile.cv.label, className: 'cv-action', icon: 'download' }));
    secondary.append(actions);
  }

  target.replaceChildren(media, content);
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

function bindSectionReveal(selector, visibleAttribute, threshold=0.1) {
  document.querySelectorAll(selector).forEach(section => {
    if (!(section instanceof HTMLElement) || section.dataset.revealBound === 'true') return;
    section.dataset.revealBound = 'true';
    if (!('IntersectionObserver' in window)) {
      section.dataset[visibleAttribute] = 'true';
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      section.dataset[visibleAttribute] = entry.isIntersecting && entry.intersectionRatio>=threshold ? 'true' : 'false';
    }, {threshold});
    observer.observe(section);
  });
}

function bindFocusReveal() {
  bindSectionReveal('.cv-page--focus', 'focusVisible');
}

function bindWorkReveal() {
  bindSectionReveal('.cv-page--work', 'workVisible');
  bindSectionReveal('.cv-card__title--brand','logoVisible',0.65);
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
  data.projects.items.forEach((project) => {
      const target=document.querySelector(`[data-cv-project="${project.name}"]`);
      if(!target)return;
      const article = createElement('article', 'cv-card cv-card--project');
      const title = createElement('h3', 'cv-card__title cv-card__title--brand');

      if (project.logo) {
        const logo=createBrandLogo(project.logo,project.name);
        if(project.logoSize)logo.dataset.logoSize=project.logoSize;
        if(project.darkLogo){
          logo.dataset.lightSrc=project.logo;
          logo.dataset.darkSrc=project.darkLogo;
          logo.src=document.documentElement.dataset.theme==='dark'?project.darkLogo:project.logo;
        }
        title.append(logo);
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

      article.append(createLink({ href: project.url, label: 'Visit project', className: 'cv-card__link', icon: project.icon }));
      target.replaceChildren(article);
    });
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

function renderDetailTriggers(data) {
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

  target.replaceChildren(...triggers
    .filter(trigger=>trigger.key!=='languages' || data.languages.publish!==false)
    .map((trigger, index) => createDetailTrigger(trigger, index)));
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
  const email = data.contact.primaryEmail;
  if (!links.some(link => link.href === email.href)) {
    links.push({ href: email.href, label: email.label, icon: 'email', type: 'email' });
  }

  target.replaceChildren(...links.map(createFooterLink));
}

export async function renderCv() {
  const data = await loadCvData();

  renderHero(data);
  bindSectionReveal('.cv-page--availability','availabilityVisible',0.45);
  renderFocus(data);
  bindFocusReveal();
  renderProjects(data);
  bindWorkReveal();
  renderDetailTriggers(data);
  bindDetailsReveal();
  renderLinks(data);
  renderFooterLinks(data);
  renderSectionIcons();
  bindDetailOverlay(data);

  document.dispatchEvent(new CustomEvent('artan-live:cv-ready'));
}
