# HISHAM WORLD — REZK Flame Edition

## Implemented

- [x] Integrated optimized user-supplied portrait and REZK banner into hero, splash, and showcase.
- [x] Redesigned the site with orange, gold, warm crystal glass, improved mobile layouts and subtle visual polish.
- [x] Added top-of-page scroll progress and topbar XP/level progress.
- [x] Added the exact requested footer text `Mabe By ABDELRHMAN` with highlighted clickable name.
- [x] Configured footer click to show a clear setup notice if the creator Discord profile link is not set. No fake profile link.
- [x] Fixed Click Rush pause/timer, independent draw loop, hit handling.
- [x] Fixed Snake per-tick drawing, tail collision, safe spawning, mobile D-pad controls.
- [x] Fixed Memory face-down mismatch handling, accuracy and difficulty resets.
- [x] Fixed Guess The Game cumulative XP exploit; XP awarded after all 5 questions.
- [x] Fixed Reflex timing lifecycle and false-start scores.
- [x] Fixed XP cap, daily challenge IDs, and local-day key.
- [x] Made the Memory achievement threshold attainable.
- [x] Persisted best Hype Combo across page reloads.
- [x] Updated cache strategy, social content, metadata and application icon.
- [x] Checked TS/TSX syntax, CSS parsing, and core XP/serialization behavior.

## Before publishing

- [ ] Add the exact personal Discord profile link in `src/data/profileConfig.ts` (`creatorDiscordUrl`).
- [ ] Replace the placeholder deployment domain `https://hisham.world` if it is not your actual domain.
- [ ] Confirm that the artwork reading **REZK** is intended for a site whose written name remains **HISHAM WORLD**.
- [ ] Run `npm ci && npm run build && npm run lint` with working npm internet; installation was blocked in the current runtime.
- [ ] Test arcade and RTL on actual Android and desktop browsers.
