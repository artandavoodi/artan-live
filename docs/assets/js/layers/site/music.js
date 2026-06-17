/* =========================================================
  ARTAN.LIVE · MUSIC RENDERER
  File: docs/assets/js/layers/site/music.js
  Purpose: Render the Music page through its own renderer while mirroring the Publications interaction pattern.
========================================================= */

const MUSIC_PATH = '../assets/data/music/releases.json';
const DEFAULT_CATEGORY = 'singles';
const DEFAULT_FILTER = 'all';

let musicData = null;
let activeCategory = DEFAULT_CATEGORY;
let activeFilter = DEFAULT_FILTER;

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined && textContent !== null) {
    element.textContent = textContent;
  }

  return element;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((first, second) => (first.order || 0) - (second.order || 0));
}

function setTextDirection(element, direction) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const value = direction === 'rtl' ? 'rtl' : 'ltr';
  element.dir = value;
  element.dataset.direction = value;
}

function getMusicCoverSource(item) {
  return item.cover?.image || item.media?.cover || '';
}

function getMusicSymbolSource(item) {
  return item.cover?.icon || item.symbol || '♪';
}

function renderMusicCoverSymbol(item, titleText) {
  const symbolSource = getMusicSymbolSource(item);

  if (typeof symbolSource === 'string' && symbolSource.trim().endsWith('.svg')) {
    const icon = document.createElement('img');
    icon.className = 'cv-publication-item__cover-symbol';
    icon.src = symbolSource;
    icon.alt = `${titleText} icon`;
    icon.loading = 'lazy';
    return icon;
  }

  return createElement('span', 'cv-publication-item__cover-symbol', symbolSource || '♪');
}

function getMusicCategory(item) {
  return item.collection || item.category || `${String(item.type || '').toLowerCase()}s`;
}

function getMusicStatus(item) {
  return String(item.status || '').toLowerCase();
}

function normalizeLinkLabel(label) {
  const labels = {
    appleMusic: 'Apple Music',
    spotify: 'Spotify',
    youtubeMusic: 'YouTube Music',
    youtube: 'YouTube',
    soundCloud: 'SoundCloud',
    bandcamp: 'Bandcamp',
    website: 'Website'
  };

  return labels[label] || label;
}

function renderMusicDetail(label, value) {
  const detail = createElement('p', 'cv-publication-item__detail');
  detail.append(
    createElement('span', 'cv-publication-item__detail-label', label),
    createElement('span', 'cv-publication-item__detail-value', String(value)),
  );

  return detail;
}

function renderMusicLinks(item) {
  const wrapper = createElement('div', 'cv-publication-item__links');
  const links = item.links && typeof item.links === 'object'
    ? Object.entries(item.links).filter(([, href]) => Boolean(href))
    : [];

  links.forEach(([label, href]) => {
    const link = createElement('a', 'cv-publication-item__link');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.platform = label;
    link.setAttribute('aria-label', normalizeLinkLabel(label));

    const linkLabel = createElement('span', 'cv-publication-item__link-label', normalizeLinkLabel(label));
    link.appendChild(linkLabel);
    wrapper.appendChild(link);
  });

  return wrapper;
}

function renderMusicDetails(item) {
  const details = createElement('div', 'cv-publication-item__details');
  details.hidden = true;

  const entries = [
    ['Type', item.type],
    ['Format', item.format],
    ['Genre', item.genre],
    ['Label', item.label],
    ['Release Date', item.releaseDate],
    ['Duration', item.duration],
    ['Status', item.status]
  ].filter(([, value]) => Boolean(value));

  entries.forEach(([label, value]) => {
    details.appendChild(renderMusicDetail(label, value));
  });

  return details;
}

function renderMusicCover(item, titleText) {
  const cover = createElement('figure', 'cv-publication-item__cover');
  const coverButton = document.createElement('button');
  coverButton.className = 'cv-publication-item__cover-button';
  coverButton.type = 'button';
  coverButton.setAttribute('aria-expanded', 'false');

  const coverSource = getMusicCoverSource(item);

  if (coverSource) {
    const image = document.createElement('img');
    image.className = 'cv-publication-item__cover-image';
    image.src = coverSource;
    image.alt = `${titleText} cover artwork`;
    image.loading = 'lazy';
    coverButton.appendChild(image);
  }

  const symbol = renderMusicCoverSymbol(item, titleText);
  coverButton.appendChild(symbol);

  cover.appendChild(coverButton);
  return { cover, coverButton };
}

function renderMusicItem(item) {
  const titleText = item.title || 'Untitled release';
  const direction = item.direction === 'rtl' ? 'rtl' : 'ltr';
  const article = createElement('article', 'cv-publication-item');
  article.dataset.musicId = item.id || item.slug || '';
  article.dataset.expanded = 'false';
  setTextDirection(article, direction);

  const { cover, coverButton } = renderMusicCover(item, titleText);
  const content = createElement('div', 'cv-publication-item__content');

  const title = createElement('h2', 'cv-publication-item__title');
  const titleTextNode = createElement('span', 'cv-publication-item__title-button', titleText);
  title.appendChild(titleTextNode);

  const subtitle = createElement('p', 'cv-publication-item__subtitle', item.subtitle || item.role || 'Single');
  const author = createElement('p', 'cv-publication-item__author', item.artist || 'Artan');

  const text = document.createElement('button');
  text.className = 'cv-publication-item__text';
  text.type = 'button';
  text.setAttribute('aria-expanded', 'false');
  text.textContent = item.description || 'Release details will be added after verification.';

  const details = renderMusicDetails(item);
  const links = renderMusicLinks(item);

  function toggleDetails() {
    const isOpen = coverButton.getAttribute('aria-expanded') === 'true';
    const nextValue = isOpen ? 'false' : 'true';

    coverButton.setAttribute('aria-expanded', nextValue);
    text.setAttribute('aria-expanded', nextValue);
    article.dataset.expanded = nextValue;
    details.hidden = isOpen;
  }

  coverButton.addEventListener('click', toggleDetails);
  text.addEventListener('click', toggleDetails);

  content.append(title, subtitle, author, text, details, links);
  article.append(cover, content);

  return article;
}

function renderEmptyState() {
  const empty = createElement('article', 'cv-publication-empty');
  empty.appendChild(createElement('p', null, 'No releases are listed in this view yet.'));

  return empty;
}

function filterMusicItems(items) {
  return normalizeItems(items).filter((item) => {
    const categoryMatches = getMusicCategory(item) === activeCategory;
    const filterMatches = activeFilter === 'all' || getMusicStatus(item) === activeFilter;
    return categoryMatches && filterMatches;
  });
}

function renderMusicSection(data) {
  const target = document.querySelector('[data-music-sections]');

  if (!target) {
    return;
  }

  const list = createElement('div', 'cv-publication-list');
  const items = filterMusicItems(data.items);

  if (items.length) {
    list.append(...items.map(renderMusicItem));
  } else {
    list.appendChild(renderEmptyState());
  }

  target.replaceChildren(list);
}

function updateMusicControls() {
  document.querySelectorAll('[data-music-category]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.musicCategory === activeCategory));
  });

  document.querySelectorAll('[data-music-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.musicFilter === activeFilter));
  });
}

function bindMusicControls() {
  document.querySelectorAll('[data-music-category]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.musicCategory || DEFAULT_CATEGORY;
      updateMusicControls();

      if (musicData) {
        renderMusicSection(musicData);
      }
    });
  });

  document.querySelectorAll('[data-music-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.musicFilter || DEFAULT_FILTER;
      updateMusicControls();

      if (musicData) {
        renderMusicSection(musicData);
      }
    });
  });
}

function renderPageHeader(data) {
  const page = data.page || {};
  const title = document.querySelector('[data-music-page-title]');

  if (title && page.title) {
    title.textContent = page.title;
  }
}

export async function renderMusic() {
  const target = document.querySelector('[data-music-sections]');

  if (!target) {
    return;
  }

  const response = await fetch(`${MUSIC_PATH}?v=${Date.now()}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Unable to load music releases from ${MUSIC_PATH}`);
  }

  musicData = await response.json();

  bindMusicControls();
  updateMusicControls();
  renderPageHeader(musicData);
  renderMusicSection(musicData);
}
