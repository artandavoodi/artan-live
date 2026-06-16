/* =========================================================
  ARTAN.LIVE · APP ENTRY
  File: docs/assets/js/core/app.js
  Purpose: Initialize the public CV hub runtime.
========================================================= */

import { mountFragments } from './fragments.js';
import { renderCv } from '../layers/site/cv.js';

async function initializeArtanLive() {
  document.documentElement.dataset.appReady = 'false';

  try {
    await mountFragments();
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