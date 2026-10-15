# How it works

Skyinfoline is one Next.js page that draws the Manhattan skyline from a list of buildings. There is no API and no backend of its own. The buildings come from Sanity, with a copy in the repo as a fallback, and everything you see (what is visible, how tall, in what order) is worked out in the browser from that list. Paths are relative to the repo root.

## Where the buildings come from

- `src/app/page.tsx` is a server component with `revalidate = 30`. It calls `getBuildings()` in `src/sanity/lib/buildings.ts` and passes the result to `SkylineExplorer`, so a Studio publish shows up within about 30 seconds without a redeploy.
- `getBuildings()` runs one GROQ query (`src/sanity/lib/queries.ts`) for `building` documents that have a slug, and maps them to the `Building` type. The cutout image becomes a PNG URL (`urlForCutout` forces PNG so transparency survives), and the image's aspect ratio is read from the asset metadata in the same query.
- If `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing, the query fails, or it returns no documents, it uses `src/data/buildings-seed.json` instead (37 buildings, no cutout images, drawn as simple silhouettes). That file is also what the seed script writes to Sanity.
- The Studio is embedded at `/studio` (`sanity.config.ts`).

## What shows on screen

All the rules are in `src/lib/` and are wired together in `SkylineExplorer.tsx`.

- **Order.** Each building has an `orderIndex` (lower means further south along Manhattan). The Jersey City view sorts descending, so north is on the left, and the Brooklyn view sorts ascending (`viewpoints.ts`). Switching viewpoint only flips that sort and the labels.
- **Height.** Tower height is `heightFt` relative to the tallest visible tower, so the scale changes when the tallest one is filtered out. With a cutout, width follows the image's aspect ratio, and without one it follows the silhouette shape (`rect`, `step`, `spire` or `art-deco`) (`Skyline.tsx`).
- **Landing view.** Before you touch anything, only the tallest buildings are shown (`landingSet.ts`): 10 under 640 px wide, then one more for every 24 px up to 1024 px, then everything. The first render assumes a 390 px width so the server and client agree, and the real width is applied after mount.
- **Time and eras.** The timeline slider scrubs a year. A building is visible from `yearCompleted` until `yearDemolished` (if set). The era chips (`eras.ts`) filter to towers completed in that window instead, and while a chip is active the slider is replaced by a "resume" button and the scrub year stops hiding anything. Using the slider or an era chip ends the landing view.
- **Fit.** The row is measured and scaled down so every visible tower fits the width (`skyline-layout.ts`). On narrow screens the tower height budget shrinks as more towers are visible, so the full catalog stays readable.
- **Selection.** Clicking a tower opens the detail plate. Left and right arrows move to the neighbouring visible tower in the current order, and Escape closes it. A selected tower that becomes hidden is deselected.

## The seed script

`npm run seed` (`scripts/seed-buildings.mjs`) loads `.env.local`, needs `SANITY_WRITE_TOKEN`, and does this in one transaction:

1. Checks the seed JSON for duplicate ids and names.
2. Finds PNGs in `building-cutouts/`, `public/building-cutouts/` or `outputs/building-cutouts/`, matched by `{id}.png` or by the names in `building-cutouts/filename-map.json`, and uploads them.
3. Deletes a list of legacy document ids, plus any `building` document in Sanity whose id isn't `building-{id}` for an id in the seed file.
4. Writes every seed building with `createOrReplace`, keeping the existing cutout when no new PNG is found for it.

## Environment variables

Names only. See `.env.example`.

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity project for the site and Studio |
| `SANITY_WRITE_TOKEN` | Seed script only |

## Limits worth knowing

- **Reseeding overwrites Studio edits.** `createOrReplace` replaces each seeded building's document, and step 3 deletes buildings that only exist in Sanity. Fields edited in the Studio on a seeded building (other than the cutout image) are lost, and so are buildings added there. Add new buildings to `src/data/buildings-seed.json` too, or don't reseed.
- **`skylineImportance` has no effect yet.** It is stored and in the schema, and `importancePresence` in `src/lib/importance.ts` converts it to a visual weight, but nothing calls that function.
- **The fallback has no pictures.** If Sanity is down, you get silhouettes.
- **It is an illustration.** Heights are real, but positions are an ordering, not geography.
