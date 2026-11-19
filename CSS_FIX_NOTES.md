# REZK Flame CSS hotfix — November 15, 2026

## Fixed

- Native browser white button backgrounds on the **Kick/Discord guide headers** and **bottom navigation dock**. All buttons now inherit the dark interface and have deliberate backgrounds.
- Guide accordion trigger fills the card width and preserves a readable white heading and muted subtitle.
- A collapsed guide card no longer stretches to the height of the expanded card, so there is no enormous blank card beside the open guide.
- Guides show a proper highlighted open state and animated chevron.
- Bottom dock has a consistent dark-glass surface, accessible hover states and gold selected-tab styling.
- Explicit dark color scheme prevents native browser controls from unexpectedly introducing light-theme surfaces.
- Upgraded the service-worker cache name to avoid stale CSS on deploy.

All five games, XP and achievements, images, customization, and the ABDELRHMAN Discord footer link are kept intact.

## Run locally

`npm ci`

`npm run dev`

Open the local URL displayed by Vite. For a production deployment, run `npm run build` after dependencies have installed.

## Deployment / cache

Replace the previous deployed project with this release, rebuild it and hard refresh the page (`Ctrl+Shift+R`) if an old browser/service-worker cache is still showing. This release bumps the cache name so old offline assets can be removed automatically on activation.

## Test scope

Stylesheets passed a CSS syntax parser; all TypeScript/TSX files passed a syntax transpilation check; structural assertions for CSS, assets, Discord link and service worker passed. Full Vite build/browser visual tests couldn't run in this sandbox because npm dependencies were not installed and browser navigations were blocked.
