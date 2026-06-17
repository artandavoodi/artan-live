const PROJECTS_PATH = '/assets/data/projects/projects.json';
const DEFAULT_CATEGORY = 'current';
const DEFAULT_FILTER = 'all';

let projectsData = null;
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

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeAssetPath(path) {
  if (!path) {
    return '';
  }

  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) {
    return path;
  }

  return `/${path.replace(/^\.\.\//, '')}`;
}

function getProjectCategory(item) {
  return normalizeValue(item.category || 'archive');
}

function getProjectStatus(item) {
  return normalizeValue(item.status || 'active');
}

function getProjectCoverSource(item) {
  return normalizeAssetPath(item.cover?.image || item.media?.cover || '');
}

function getProjectIconSource(item) {
  return normalizeAssetPath(item.cover?.icon || item.media?.icon || '');
}

function renderProjectCoverIcon(item, titleText) {
  const iconSource = getProjectIconSource(item);

  if (iconSource) {
    const icon = document.createElement('img');
    icon.className = 'cv-publication-item__cover-symbol';
    icon.src = iconSource;
    icon.alt = `${titleText} icon`;
    icon.loading = 'lazy';
    return icon;
  }

  return createElement('span', 'cv-publication-item__cover-symbol', item.symbol || 'P');
}

function renderProjectDetail(label, value) {
  const detail = createElement('p', 'cv-publication-item__detail');

  detail.append(
    createElement('span', 'cv-publication-item__detail-label', label),
    createElement('span', 'cv-publication-item__detail-value', String(value)),
  );

  return detail;
}

function renderProjectDetails(item) {
  const details = createElement('div', 'cv-publication-item__details');
  details.hidden = true;

  Object.entries(item.details || {}).forEach(([label, value]) => {
    if (!value) {
      return;
    }

    details.appendChild(renderProjectDetail(label, value));
  });

  return details;
}

function renderProjectLinks(item) {
  const links = item.links || {};
  const entries = Object.entries(links).filter(([, value]) => value?.href);

  if (!entries.length) {
    return document.createDocumentFragment();
  }

  const wrapper = createElement('div', 'cv-publication-item__links');

  entries.forEach(([key, value]) => {
    const label = value.label || key;
    const link = createElement('a', 'cv-publication-item__link');
    const hiddenLabel = createElement('span', 'cv-publication-item__link-label', label);

    link.href = value.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', label);
    link.dataset.platform = key;

    const iconSource = normalizeAssetPath(value.icon || '');

    if (iconSource) {
      link.style.setProperty('--project-link-icon', `url('${iconSource}')`);
    }

    link.appendChild(hiddenLabel);
    wrapper.appendChild(link);
  });

  return wrapper;
}

function renderProjectCover(item, titleText) {
  const cover = createElement('figure', 'cv-publication-item__cover');
  const coverButton = document.createElement('button');
  const coverSource = getProjectCoverSource(item);

  coverButton.className = 'cv-publication-item__cover-button';
  coverButton.type = 'button';
  coverButton.setAttribute('aria-expanded', 'false');
  coverButton.setAttribute('aria-label', `Show details for ${titleText}`);

  if (coverSource) {
    const image = document.createElement('img');
    image.className = 'cv-publication-item__cover-image';
    image.src = coverSource;
    image.alt = `${titleText} cover image`;
    image.loading = 'lazy';
    coverButton.appendChild(image);
  }

  const symbol = renderProjectCoverIcon(item, titleText);
  coverButton.appendChild(symbol);

  cover.appendChild(coverButton);

  return { cover, coverButton };
}

function renderProjectItem(item) {
  const article = createElement('article', 'cv-publication-item');
  const titleText = item.title || 'Untitled project';

  article.dataset.projectId = item.id || titleText.toLowerCase().replace(/\s+/g, '-');
  article.dataset.projectCategory = getProjectCategory(item);
  article.dataset.projectStatus = getProjectStatus(item);

  const { cover, coverButton } = renderProjectCover(item, titleText);
  const content = createElement('div', 'cv-publication-item__content');

  const title = createElement('h2', 'cv-publication-item__title');
  const titleTextNode = createElement('span', 'cv-publication-item__title-button', titleText);
  title.appendChild(titleTextNode);

  const subtitle = createElement('p', 'cv-publication-item__subtitle', item.subtitle || item.type || 'Current project');
  const author = createElement('p', 'cv-publication-item__author', item.role || 'Artan');
  const text = document.createElement('button');

  text.className = 'cv-publication-item__text';
  text.type = 'button';
  text.textContent = item.description || '';
  text.setAttribute('aria-expanded', 'false');

  const details = renderProjectDetails(item);
  const links = renderProjectLinks(item);

  const toggleDetails = () => {
    const expanded = coverButton.getAttribute('aria-expanded') === 'true';
    const nextExpanded = !expanded;

    coverButton.setAttribute('aria-expanded', String(nextExpanded));
    text.setAttribute('aria-expanded', String(nextExpanded));
    details.hidden = !nextExpanded;
  };

  coverButton.addEventListener('click', toggleDetails);
  text.addEventListener('click', toggleDetails);

  content.append(title, subtitle, author, text, details, links);
  article.append(cover, content);

  return article;
}

function getVisibleProjects(data) {
  return [...(data.items || [])]
    .filter((item) => getProjectCategory(item) === activeCategory)
    .filter((item) => activeFilter === 'all' || getProjectStatus(item) === activeFilter)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

function renderProjectsSection(data) {
  const target = document.querySelector('[data-project-sections]');

  if (!target) {
    return;
  }

  const items = getVisibleProjects(data);
  const list = createElement('div', 'cv-publication-list');

  if (items.length) {
    list.append(...items.map(renderProjectItem));
  } else {
    const empty = createElement('p', 'cv-publication-empty', 'No projects are listed in this view yet.');
    list.appendChild(empty);
  }

  target.replaceChildren(list);
}

function syncProjectControls(data) {
  document.querySelectorAll('[data-project-category]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.projectCategory === activeCategory));

    button.addEventListener('click', () => {
      activeCategory = button.dataset.projectCategory || DEFAULT_CATEGORY;
      document.querySelectorAll('[data-project-category]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderProjectsSection(data);
    });
  });

  document.querySelectorAll('[data-project-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.projectFilter === activeFilter));

    button.addEventListener('click', () => {
      activeFilter = button.dataset.projectFilter || DEFAULT_FILTER;
      document.querySelectorAll('[data-project-filter]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderProjectsSection(data);
    });
  });
}

function updateProjectsTitle(data) {
  const title = document.querySelector('[data-projects-page-title]');

  if (title && data.page?.title) {
    title.textContent = data.page.title;
  }
}

export async function renderProjects() {
  const target = document.querySelector('[data-project-sections]');

  if (!target) {
    return;
  }

  const response = await fetch(PROJECTS_PATH);

  if (!response.ok) {
    throw new Error(`Unable to load projects from ${PROJECTS_PATH}`);
  }

  projectsData = await response.json();

  updateProjectsTitle(projectsData);
  syncProjectControls(projectsData);
  renderProjectsSection(projectsData);
}
