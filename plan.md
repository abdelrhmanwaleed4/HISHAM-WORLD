# HISHAM WORLD — Implementation Plan

## Scope and delivery gate

This plan covers a static, frontend-only React + TypeScript experience for Hisham / هشام. The work is deliberately staged so Phase 1 is implemented first and the project stops for approval before any arcade or progression work. No backend, API routes, database, auth, OAuth, fake live data, external secrets, copyrighted media, or game engine will be introduced.

The four delivery phases are:

1. **Foundation:** project setup, typed profile/config, Liquid Crystal Obsidian design tokens and glass primitives, atmospheric background, cinematic intro, bilingual hero, responsive navigation, social bento, Kick/Discord guide accordions, Arabic/English i18n, customization panel, and versioned localStorage wrapper.
2. **Arcade:** five raw Canvas/DOM games, lazy loading, error boundaries, keyboard/touch controls, pause/restart/game-over states, personal bests, and mobile-friendly arcade hub.
3. **Progression:** XP/ranks, achievements, local daily challenges, progress export/import/reset, and share-score cards.
4. **Polish:** synthesized Web Audio player and real analyser reactivity, VIP pass export/QR, hype combo, optional media spotlight, SEO/PWA/offline support, accessibility/performance pass, README, and verification report.

Phase 1 completion is the next checkpoint. After Phase 1, report exactly what works, what is incomplete, and known issues; do not start Phase 2 without an explicit `continue`.

## Implementation approach

- Use Vite with strict TypeScript and a small dependency surface. Keep the initial entry lightweight and reserve each future game for an independently lazy-loaded module.
- Centralize all brand content in `src/data/profileConfig.ts` and all UI strings in typed Arabic/English dictionaries. Language state updates document `lang` and `dir` without resetting local progress.
- Build translucent glass from CSS custom properties rather than opaque cards. The customization panel edits those variables live and persists only presentation preferences locally.
- Use semantic sections and anchor navigation for the single-page experience. The desktop dock becomes a safe-area-aware mobile bottom dock. All external links use the exact supplied URLs with `target="_blank"` and `rel="noopener noreferrer"`.
- Use a replaceable `H` monogram in Phase 1 because no portrait was supplied. The config will expose portrait paths for later user-provided images without inventing a face.
- Keep the Kick status message neutral and honest: a prominent Watch on Kick CTA plus “Check Stream on Kick”; no LIVE/OFFLINE labels or invented counts.
- Treat local progress and preferences as browser/device-only. The storage wrapper will include a schema version, guarded parsing, validation, and a safe in-memory fallback when storage is unavailable.
- Add `/manus-routes.json` before the dev server starts and keep the static route declaration synchronized with the single home route.

## Design direction: Liquid Crystal Obsidian

### Design movement

A restrained cinematic fusion of luxury broadcast control room, liquid crystal interface, and nocturnal Egyptian neon—premium but warm, with content always more important than effects.

### Core principles

1. **Depth without heaviness:** genuinely translucent surfaces, blur, inner highlights, and soft shadows over an obsidian aurora field.
2. **Signal hierarchy:** emerald is reserved for Kick and key actions; champagne marks earned value; violet identifies community and secondary interaction.
3. **Bilingual clarity:** Arabic-first composition with natural Egyptian-friendly language, strong contrast, and generous readable spacing in both RTL and LTR.
4. **Quiet motion:** cinematic reveal, restrained lift, and responsive feedback; effects yield to reduced-motion and low-performance modes.

### Color philosophy

Obsidian and secondary charcoal create a quiet stage. Emerald is an intentional signal color rather than a blanket neon wash. Champagne gold supplies earned-luxury warmth, while midnight violet gives community actions a cooler counterpoint. Crystal white and muted silver preserve WCAG AA readability.

### Layout paradigm

An asymmetric editorial landing page: the hero sits in a generous negative-space field, social cards form a varied bento rhythm, and lower sections use horizontal rails and expandable glass panels rather than a repetitive centered grid. The navigation floats as a persistent control object.

### Signature elements

- A layered `H` monogram with a thin gold edge highlight and soft emerald halo.
- Crystal “light sweeps” that move only on meaningful hover/focus interactions.
- Small eyebrow labels and hairline dividers that resemble broadcast telemetry without pretending to show live metrics.

### Interaction and animation

Focus rings are obvious and keyboard-first. Hover lift is subtle, magnetic movement is capped, and every effect has a static fallback. Intro animation is a short monogram/title dissolve that skips after the first visit. No autoplay audio, flashing loops, or motion that conveys essential information.

### Typography system

Use bundled Cairo for Arabic and bundled Plus Jakarta Sans for English, with a system fallback stack so the site remains usable if a font file fails. Headlines use a compact, high-contrast display scale; supporting copy stays at comfortable reading widths. Direction-aware logical CSS properties avoid RTL-specific layout forks.

### Brand essence and voice

**Positioning:** HISHAM WORLD is a refined, bilingual home base for a streamer’s chill gaming energy—more personal and interactive than a link page, without pretending to be a broadcast backend.

**Personality:** cinematic, welcoming, quietly confident.

**Voice examples:** “ادخل عالم هشام — روقان، جيمينج، وصحبة حلوة.” / “Pull up for chill gaming, laughs, and real community energy.”

### Wordmark and signature color

The wordmark combines `HISHAM` in a high-tracking sans with a compact Arabic `هشام` lockup and the layered `H` emblem. The ownable signature color is Kick Emerald `#53FC18`, used sparingly as a signal against Obsidian `#08090D`.

## Phase 1 project structure

```text
src/
  components/
    layout/        App shell, dock navigation, section framing
    glass/         GlassPanel, Badge, SectionHeading primitives
    hero/          Intro screen, monogram, bilingual hero
    social/        Social Bento cards and copy/share feedback
    guides/        Kick and Discord checklist accordions
    settings/      Customization panel and appearance controls
  data/
    profileConfig.ts
    i18n.ts
  hooks/
    useLocalStorage.ts
    useMediaQuery.ts
  lib/
    storage.ts
    share.ts
    utils.ts
  styles/
    tokens.css
    globals.css
  App.tsx
  main.tsx
public/
  manus-routes.json
  manifest.webmanifest (Phase 4 ownership)
  robots.txt (Phase 4)
plan.md
TODO.md (after plan approval)
README.md (Phase 4)
```

Future phases add `src/games/`, `src/data/questions.ts`, `achievements.ts`, `challenges.ts`, `src/components/arcade/`, `passes/`, and `audio/` without reorganizing Phase 1.

## Build and verification workflow

1. Install a pinned package manager and dependencies with an explicit lifecycle-build policy.
2. Register TypeScript diagnostics through the host-managed `runtime/post-edit` configuration before the first code batch.
3. Implement Phase 1 in coherent batches, resolving diagnostics after each batch.
4. Start the Vite development service on the configured port and verify that the app and `/manus-routes.json` respond with HTTP 200.
5. Run `npm run build`, `npm run typecheck`/`tsc --noEmit`, and `npm run lint` if configured. Report actual results and bundle observations honestly.
6. Commit Phase 1 to the canonical `main` remote so it is recoverable as a Manus checkpoint. Publication is separate and will not be enabled automatically.

## Explicit non-goals for Phase 1

Phase 1 will not claim that games, XP, achievements, daily challenges, pass export, audio playback, offline caching, or media spotlight are finished. The UI may reserve clear navigation targets for later sections only when those targets do not behave like fake features; incomplete sections will be labeled or omitted rather than presented as working.
