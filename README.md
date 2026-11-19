# HISHAM WORLD

HISHAM WORLD is a premium, static React + TypeScript frontend for Egyptian streamer Hisham / هشام. It uses a cinematic flame-and-gold REZK art direction, Arabic-first RTL layout with an English toggle, a local arcade, local progression, and optional browser-native polish features.

## What is included

- React 18, TypeScript strict mode, Vite, Framer Motion, Lucide React, and self-hosted Cairo / Plus Jakarta Sans fonts.
- Static-only deployment shape with no backend, database, authentication, API keys, or environment variables.
- Five lazy-loaded raw Canvas/DOM games: Click Rush, Emerald Snake, Guess The Game, Memory Clash, and Reflex Arena.
- Versioned browser/device-local storage for guides, customization, game bests, XP, achievements, daily challenges, and progression export/import.
- Phase 4 tools: a fixed floating soundtrack player with a bundled original MP3/OGG music loop, a Discord-linked VIP Squad Pass with QR and PNG export, Hype Combo, and an optional config-driven media spotlight slot. A dedicated QR Codes section provides scannable PNGs for the configured social and creator links.
- Cinematic, user-supplied REZK portrait + banner (optimized locally into WebP), new hero/feature sections, responsive flame-glass UI, fixed reading progress and a live XP/level capsule.
- SEO metadata, canonical URL, Open Graph/Twitter metadata, robots, sitemap, application-owned PWA manifest, and an upgraded offline service worker.

## Development

```bash
npm ci
npm run dev
```

The development server listens on port `3000`. The project also exposes `/manus-routes.json` for the static route declaration.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

The production output is written to `dist/` and is ready for Vercel, Netlify, GitHub Pages, or another static host. The host should serve `index.html` for the single `/` route and preserve the files in `public/`.

## Local data and privacy

No account or global leaderboard exists. Progress, preferences, personal bests, and daily challenge state remain in the browser/device local-storage wrapper. The export action creates a JSON backup locally; import accepts only the versioned schema and normalizes stale daily data. Reset progress asks for confirmation before clearing the local progression state.

## Profile configuration

Edit `src/data/profileConfig.ts` to update social URLs, portraits, branding, and the media spotlight. The provided REZK images are stored in `public/images/` and already wired to the hero and cinematic banner. The site's written name is kept as **HISHAM WORLD** as requested, while the uploaded pictures visibly say **REZK**. Update the copy if a full rename is intended.

**IMPORTANT: footer Discord URL:** the personal Discord user ID/link for ABDELRHMAN was not supplied. Set `creatorDiscordUrl` to your real personal profile URL, for example `https://discord.com/users/123456789012345678` (replace the example ID; do not leave a fake ID). Until configured, clicking the highlighted footer name shows a notice instead of opening a wrong person's profile. The footer wording is deliberately `Mabe By ABDELRHMAN` as supplied.

**Domain:** canonical/OG metadata and sitemap currently mention `hisham.world`, which is an editable placeholder and has not been verified as owned. Replace it with the actual deployment domain before publication.

## Accessibility and performance notes

The shell includes visible focus states, semantic buttons and progress bars, keyboard-friendly controls, 44px touch targets for primary controls, RTL-safe positioning, reduced-motion support, low-performance blur limits, lazy-loaded arcade chunks, hidden-tab game pausing where implemented, and honest local-only/error states. The service worker uses a versioned cache; bump `CACHE` in `public/sw.js` when changing its offline shell contract.

## Changes in Flame edition

- Fixed Click Rush pause/resume by using elapsed frame deltas and separate drawing/timing loops.
- Fixed Snake rendering on every movement, self-collision when following the tail, and food spawning inside the snake.
- Fixed Memory mismatched pairs returning face down and added a proper session reset on difficulty change.
- Fixed Guess The Game's repeated XP award exploit: XP is now granted once after a complete 5-question round.
- Fixed Reflex Arena's premature taps and scoring based on round score rather than previous personal best.
- Fixed daily challenge IDs, made the date local rather than UTC, and capped XP per completed run.
- Persisted Hype Combo high score; refreshed color design throughout, including the game's score/share artwork.
- Added a page reading progress strip and a level/XP progress indicator in the top bar.
- Updated PWA service worker for network-first documents and correct static asset MIME handling.

## Verification limitations

All TypeScript/TSX files passed a syntax-transpilation check in this environment. A complete dependency installation, Vite production build, browser/mobile QA, and ESLint verification require `npm ci` in a network-enabled environment. A local attempt at `npm ci` did not finish due to an npm installation error. No successful build is claimed.


## v4 · QR Codes and floating music

- A standalone **Account QR Codes** section generates scan-ready QR codes from `profileConfig.social` and `creatorDiscordUrl`. Every card includes an actual destination link, copy, open and downloadable PNG. QR destinations are **not independently verified live**: make sure social URLs/invite links in `src/data/profileConfig.ts` stay valid.
- A compact floating music dock sits **above** the navigation dock on desktop and mobile, with play/pause, mute, volume, seek and minimize controls. User's explicit pause preference and volume are stored locally.
- Attempts immediate autoplay, but browsers can forbid unprompted sound. The site retries when the visitor taps **Enter** on the intro page, or makes their first interaction. If the browser still blocks audio, the user can click Play.
- The project includes an **original generated instrumental theme**, not a claimed commercial song. Files: `public/audio/rezk-flame-theme.mp3` and `public/audio/rezk-flame-theme.ogg`.
- To replace it with your own audio, put your authorized MP3 under `public/audio/` and change `profileConfig.music.src` (and optionally `profileConfig.music.title`). The floating player will use that file everywhere.
- Works on static hosting, no music API, no backend, no YouTube scraping.
