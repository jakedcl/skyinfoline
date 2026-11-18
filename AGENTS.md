# AGENTS.md — skyinfoline

Interactive, stylized Manhattan skyline seen from the west (north on the left). Buildings are transparent PNG cutouts in Sanity, scaled by height. It's a flat illustration, not a 3D model. Live at skyinfoline.vercel.app.

## Stack
- Next.js 16.3 (App Router), React 19.2, TypeScript, Tailwind CSS 4, styled-components 6.
- Sanity 6 + next-sanity 13. Project `re2nvive`, dataset `production`. Studio is embedded at `/studio`.
- Vercel. The same env vars must be set there.

## Layout
- `src/app/` (`page.tsx`, `studio/`). `src/components/` Skyline, SkylineExplorer, BuildingDetail, CinematicTimeline, ViewpointSwitcher, SkylineHeightScale.
- `src/sanity/` env, `lib/`, `schemaTypes/`. `src/lib/` layout math and `eras.ts`. `src/types/building.ts`.
- `src/data/buildings-seed.json` (37 buildings) is the fallback when Sanity is missing or empty, and the source for the seed script.
- `building-cutouts/` PNGs + `filename-map.json`. `docs/how-it-works.md` explains the skyline math.

## Commands
- `cp .env.example .env.local`, then `npm run dev` (site :3000, Studio /studio). `npm run build`, `npm run lint`.
- `npm run seed` uploads cutouts and writes buildings. Needs `SANITY_WRITE_TOKEN`.

## Gotchas
- `npm run seed` **deletes** any `building` doc whose id isn't `building-{id}` from the seed file. Buildings added only in Studio get wiped. Add them to the seed JSON first.
- Seed uses `createOrReplace` and keeps an existing cutout only when no new PNG matches.
- `NEXT_PUBLIC_SANITY_PROJECT_ID` has no default in code. Without it the app silently falls back to seed silhouettes.
- Visibility runs from `yearCompleted` until `yearDemolished`. Era chips filter by completion window and pause the slider.
- `importance` is stored but not used for drawing yet.
