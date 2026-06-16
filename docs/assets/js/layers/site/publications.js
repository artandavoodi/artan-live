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

function createLink(href, label) {
  const link = document.createElement('a');
  link.className = 'cv-publication-link';
  link.href = href;
  link.textContent = label;
  link.target = '_blank';
  link.rel = 'noreferrer';
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

function renderPublicationItem(book) {
  const item = createElement('article', 'cv-publication-item');
  const cover = createElement('figure', 'cv-publication-item__cover');
  const image = document.createElement('img');

  image.src = book.cover;
  image.alt = `${book.title} book cover`;
  image.loading = 'lazy';

  cover.append(image);

  const content = createElement('div', 'cv-publication-item__content');
  const meta = createElement('p', 'cv-publication-item__meta', [book.type, book.status, book.language].filter(Boolean).join(' · '));
  const title = createElement('h2', 'cv-publication-item__title', book.title);
  const author = createElement('p', 'cv-publication-item__author', book.author);
  const text = createElement('p', 'cv-publication-item__text', book.description);

  content.append(meta, title, author, text, renderPublicationLinks(book.links));
  item.append(cover, content);

  return item;
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
  const items = Array.isArray(data.items) ? data.items : [];

  target.replaceChildren(...items.map(renderPublicationItem));
}
