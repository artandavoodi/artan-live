/* =========================================================
  ARTAN.LIVE · FRAGMENT LOADER
  File: docs/assets/js/core/fragments.js
  Purpose: Mount static HTML fragments into declared fragment targets.
========================================================= */

const FRAGMENT_PATHS = {
  navigation: './assets/fragments/navigation.html',
  footer: './assets/fragments/footer.html',
};

async function loadFragment(name, target) {
  const path = FRAGMENT_PATHS[name];

  if (!path || !target) {
    return;
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load fragment: ${name}`);
  }

  target.innerHTML = await response.text();
  target.dataset.fragmentReady = 'true';
}

export async function mountFragments() {
  const targets = Array.from(document.querySelectorAll('[data-fragment]'));

  await Promise.all(
    targets.map((target) => loadFragment(target.dataset.fragment, target)),
  );

  document.dispatchEvent(new CustomEvent('artan-live:fragments-ready'));
}
