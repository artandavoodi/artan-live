# artan.live

Personal professional website for Artan Davoodi. The public files are in `docs/`;
the existing domain is recorded in `docs/CNAME` and is unchanged.

## Ownership

- Page shells: `docs/index.html` and `docs/{about,music,projects,publications}/index.html`.
- Shared navigation/footer: `docs/assets/fragments/`.
- Startup and fragment mounting: `docs/assets/js/core/`.
- Theme behavior: `docs/assets/js/core/02-systems/theme.js`.
- Content renderers: `docs/assets/js/layers/site/`.
- Content: `docs/assets/data/{cv,music,projects,publications}/`.
- Token entry: `docs/assets/css/core/01-tokens/00-tokens-all.css`.
- Site styling: `docs/assets/css/layers/site/site.css`.

## Local review

```sh
python3 -m http.server 8902 --bind 127.0.0.1 --directory docs
bash tools/check-duplicate-assets.sh
bash tools/check-project-icon-sources.sh
git diff --check
```

## Refresher audit: 2026-09-11

The working tree was clean before this session. The remote `main` and local HEAD
both resolved to `ebcf2f0679a0f61bd9fa5be170ee585fdc592bda`.

Fixed two startup defects: inner-page `index.html` URLs were classified as Home,
and direct storage access before the startup error boundary could abort loading.
Page identity now uses the existing body `data-page`; startup delegates to the
existing storage-tolerant theme owner before and after fragment mounting.

Verified: existing duplicate-asset and project-icon checks pass; JSON parsing
and a static HTML/CSS/JS local-reference scan found no missing targets; focused
checks pass for blocked storage and page classification. Browser smoke testing
confirmed the music page renders, its menu opens, and Home navigation loads the
populated CV. Full mobile, accessibility, external-link and console testing remain
pending. No deployment was performed.

## Remaining content and architecture work

- Reconcile embedded homepage metadata with the rendered JSON profile: role and
  email values differ. Confirm current professional facts before rewriting them.
- Review the large shared site stylesheet for section ownership and token drift.
- Review theme access on inner pages: the primary navigation containing the
  theme button is removed there by the current navigation policy.
- Review publication, project, and music detail interactions, keyboard behavior,
  narrow screens, and external destinations.
- Establish repeatable checks and deployment documentation; the current tooling
  contains asset checks but no package-based test/build pipeline.

## Separate music project

The user supplied `artandavoodi.com` for a separate music-only site.
Suggested repository name: `artandavoodi-music`, pending naming decision.
No repository, domain mapping, or redirect has been created for that project yet.
Reuse the audited release data and media deliberately; keep one catalogue owner
after migration. Preserve `artan.live/music/` until the new site is verified, then
decide its cross-link/redirect behavior without changing the existing CV domain.

## Institutional inventory boundary

The initial inventory found fourteen Git roots including the institutional root;
thirteen had GitHub origin URLs configured. `artan-live` and the main website were
clean; the institutional root and Applied-Data-Science-Capstone had existing
changes. The `software/` directory did not contain its own `.git` entry.
This was an inventory, not a behavioral audit of every neighboring repository.
Only `artan-live` remote branch freshness was checked against GitHub.
