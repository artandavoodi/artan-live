const BOOKS_PATH = '/assets/data/publications/books.json';

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

const STORE_ICON_PATHS = {
  'Apple Books': '/registry/icons/public/assets/core/commerce/books/apple-books/apple-books.svg',
  Amazon: '/registry/icons/public/assets/core/commerce/marketplaces/amazon/amazon.svg',
};
const PREVIEW_ICON_PATH = '/registry/icons/public/assets/core/actions/preview/preview.svg';

function createStoreIcon(label) {
  if (label === 'Apple Books') {
    const icon = document.createElement('img');
    icon.className = 'cv-publication-link__image';
    icon.src = STORE_ICON_PATHS[label] || '';
    icon.alt = '';
    icon.loading = 'lazy';
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }

  const icon = document.createElement('span');
  icon.className = 'cv-publication-link__icon';
  icon.style.setProperty('--cv-publication-link-icon', `url("${STORE_ICON_PATHS[label] || ''}")`);
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}

function createPreviewIcon() {
  const icon = document.createElement('span');
  icon.className = 'cv-publication-preview-toggle__icon';
  icon.style.setProperty('--cv-publication-preview-icon', `url("${PREVIEW_ICON_PATH}")`);
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}

function createPreviewToggle(label = 'Preview') {
  const button = document.createElement('button');
  button.className = 'cv-publication-preview-toggle';
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.append(createPreviewIcon());
  button.append(createElement('span', 'cv-publication-preview-toggle__label', label));
  return button;
}

function getPreviewOverlayElements() {
  const overlay = document.querySelector('[data-publication-preview-overlay]');
  const reader = document.querySelector('[data-publication-preview-reader]');
  const closeButton = document.querySelector('[data-publication-preview-close]');

  if (!(overlay instanceof HTMLElement) || !(reader instanceof HTMLElement) || !(closeButton instanceof HTMLButtonElement)) {
    return null;
  }

  return { overlay, reader, closeButton };
}

function closePreviewOverlay() {
  const elements = getPreviewOverlayElements();

  if (!elements) {
    return;
  }

  elements.overlay.hidden = true;
  elements.overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.removeAttribute('data-publication-preview-open');
}

async function openPreviewOverlay(preview, direction) {
  const elements = getPreviewOverlayElements();

  if (!elements || !preview?.path) {
    return;
  }

  setTextDirection(elements.reader, direction);
  elements.reader.textContent = 'Loading preview…';
  elements.overlay.hidden = false;
  elements.overlay.setAttribute('aria-hidden', 'false');
  document.documentElement.setAttribute('data-publication-preview-open', 'true');

  try {
    const response = await fetch(`${preview.path}?v=${Date.now()}`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Unable to load preview from ${preview.path}`);
    }

    elements.reader.innerHTML = await response.text();
  } catch (error) {
    elements.reader.textContent = 'Preview is not available yet.';
    console.error('[artan.live]', error);
  }
}

function bindPreviewOverlay() {
  const elements = getPreviewOverlayElements();

  if (!elements || elements.overlay.dataset.bound === 'true') {
    return;
  }

  elements.overlay.dataset.bound = 'true';
  elements.closeButton.addEventListener('click', closePreviewOverlay);
  elements.overlay.addEventListener('click', (event) => {
    if (event.target === elements.overlay) {
      closePreviewOverlay();
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePreviewOverlay();
    }
  });
}

function createLink(href, label) {
  const link = document.createElement('a');
  link.className = 'cv-publication-link';
  link.href = href;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.dataset.store = label.toLowerCase().replace(/\s+/g, '-');
  link.setAttribute('aria-label', label);
  link.append(createStoreIcon(label));
  link.append(createElement('span', 'cv-publication-link__label', label));
  return link;
}

function renderPublicationLinks(links = {}) {
  const list = createElement('div', 'cv-publication-links');
  const appleBooks = links.appleBooks || '';
  const amazon = links.amazon || '';

  if (appleBooks) {
    list.append(createLink(appleBooks, 'Apple Books'));
  }

  if (amazon) {
    list.append(createLink(amazon, 'Amazon'));
  }

  (links.additional || []).forEach((item) => {
    if (item?.href && item?.label) {
      list.append(createLink(item.href, item.label));
    }
  });

  if (!list.children.length) {
    list.append(createElement('span', 'cv-publication-link cv-publication-link--pending', 'Links pending'));
  }

  return list;
}

function createDetail(label, value) {
  if (!value) {
    return null;
  }

  const detail = createElement('p', 'cv-publication-item__detail');
  detail.append(
    createElement('span', 'cv-publication-item__detail-label', label),
    createElement('span', 'cv-publication-item__detail-value', value),
  );
  return detail;
}

function getCoverSource(book) {
  if (typeof book.cover === 'string') {
    return book.cover;
  }

  return book.cover?.image || book.cover?.svg || '';
}

function getSymbolSource(book) {
  if (typeof book.icon === 'string') {
    return book.icon;
  }

  return book.cover?.symbol || book.cover?.svg || '';
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function setTextDirection(element, direction) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const value = direction === 'rtl' ? 'rtl' : 'ltr';
  element.dir = value;
  element.dataset.direction = value;
}

function renderPublicationItem(book) {
  const direction = book.direction === 'rtl' ? 'rtl' : 'ltr';
  const item = createElement('article', 'cv-publication-item');
  item.dataset.publicationId = book.id || '';
  item.dataset.language = book.language || '';
  setTextDirection(item, direction);

  const cover = createElement('figure', 'cv-publication-item__cover');
  const coverButton = createElement('button', 'cv-publication-item__cover-button');
  const image = document.createElement('img');
  const symbol = document.createElement('img');
  const coverSource = getCoverSource(book);
  const symbolSource = getSymbolSource(book);

  coverButton.type = 'button';
  coverButton.setAttribute('aria-expanded', 'false');
  coverButton.setAttribute('aria-label', `Open ${book.title} publication details`);

  image.className = 'cv-publication-item__cover-image';
  image.src = coverSource;
  image.alt = `${book.title} book cover`;
  image.loading = 'lazy';

  symbol.className = 'cv-publication-item__cover-symbol';
  symbol.src = symbolSource;
  symbol.alt = '';
  symbol.loading = 'lazy';
  symbol.setAttribute('aria-hidden', 'true');

  coverButton.append(image, symbol);
  cover.append(coverButton);

  const content = createElement('div', 'cv-publication-item__content');
  setTextDirection(content, direction);

  const title = createElement('h2', 'cv-publication-item__title');
  const titleButton = document.createElement('button');
  titleButton.className = 'cv-publication-item__title-button';
  titleButton.type = 'button';
  titleButton.textContent = book.title;
  titleButton.setAttribute('aria-expanded', 'false');
  title.append(titleButton);
  const subtitle = createElement('p', 'cv-publication-item__subtitle', book.subtitle);
  const author = createElement('p', 'cv-publication-item__author', book.author);
  const text = document.createElement('button');
  text.className = 'cv-publication-item__text';
  text.type = 'button';
  text.textContent = book.description || '';
  text.setAttribute('aria-expanded', 'false');
  text.setAttribute('aria-label', `Open ${book.title} publication details`);
  const details = createElement('div', 'cv-publication-item__details');
  const preview = book.preview || {};
  const previewToggles = [];

  details.hidden = true;
  [
    createDetail('Publisher', book.publisher),
    createDetail('Publication date', book.publicationDate ? formatDate(book.publicationDate) : ''),
    createDetail('Series', book.series?.name ? `${book.series.name} · ${book.series.number}` : ''),
    createDetail('Genre', book.genre),
  ].forEach((detail) => {
    if (detail) {
      details.append(detail);
    }
  });

  if (preview.path) {
    const previewAction = createElement('div', 'cv-publication-preview-action');
    const previewButton = createPreviewToggle(preview.label || 'Preview');
    previewToggles.push(titleButton, previewButton);
    previewAction.append(previewButton);
    details.append(previewAction);
  } else {
    titleButton.disabled = true;
  }

  async function togglePreview() {
    if (!preview.path) {
      return;
    }

    previewToggles.forEach((button) => {
      button.setAttribute('aria-expanded', 'true');
    });

    await openPreviewOverlay(preview, direction);

    previewToggles.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
  }

  previewToggles.forEach((button) => {
    button.addEventListener('click', togglePreview);
  });

  function toggleDetails() {
    const isOpen = coverButton.getAttribute('aria-expanded') === 'true';
    const nextValue = isOpen ? 'false' : 'true';
    coverButton.setAttribute('aria-expanded', nextValue);
    text.setAttribute('aria-expanded', nextValue);
    item.dataset.expanded = nextValue;
    details.hidden = isOpen;
  }

  coverButton.addEventListener('click', toggleDetails);
  text.addEventListener('click', toggleDetails);

  content.append(title, subtitle, author, text, details, renderPublicationLinks(book.links));
  item.append(cover, content);

  return item;
}

function applyPublicationFilter(filter) {
  const nextFilter = filter || 'English';
  const buttons = document.querySelectorAll('[data-publication-filter]');
  const items = document.querySelectorAll('[data-publication-id]');

  buttons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const isActive = button.dataset.publicationFilter === nextFilter;
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  items.forEach((item) => {
    if (!(item instanceof HTMLElement)) {
      return;
    }

    const shouldShow = item.dataset.language === nextFilter;
    item.hidden = !shouldShow;
    item.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  });
}

function bindPublicationFilters() {
  const buttons = document.querySelectorAll('[data-publication-filter]');

  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    if (button.dataset.filterBound === 'true') {
      return;
    }

    button.dataset.filterBound = 'true';
    button.addEventListener('click', () => applyPublicationFilter(button.dataset.publicationFilter));
  });
}

function applyPublicationCategory(category) {
  const nextCategory = category || 'books';
  const buttons = document.querySelectorAll('[data-publication-category]');
  const panels = document.querySelectorAll('[data-publication-panel]');

  buttons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const isActive = button.dataset.publicationCategory === nextCategory;
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  panels.forEach((panel) => {
    if (!(panel instanceof HTMLElement)) {
      return;
    }

    const shouldShow = panel.dataset.publicationPanel === nextCategory;
    panel.hidden = !shouldShow;
    panel.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  });
}

function bindPublicationCategories() {
  const buttons = document.querySelectorAll('[data-publication-category]');

  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    if (button.dataset.categoryBound === 'true') {
      return;
    }

    button.dataset.categoryBound = 'true';
    button.addEventListener('click', () => applyPublicationCategory(button.dataset.publicationCategory));
  });
}

export async function renderPublications() {
  const target = document.querySelector('[data-publications-list]');

  if (!target) {
    return;
  }

  const response = await fetch(`${BOOKS_PATH}?v=${Date.now()}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Unable to load publications from ${BOOKS_PATH}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items)
    ? [...data.items].sort((first, second) => (first.order || 0) - (second.order || 0))
    : [];

  target.replaceChildren(...items.map(renderPublicationItem));
  bindPreviewOverlay();
  bindPublicationCategories();
  bindPublicationFilters();
  applyPublicationCategory('books');
  applyPublicationFilter('English');
}
