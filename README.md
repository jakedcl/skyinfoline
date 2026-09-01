# Skyinfoline

Interactive, stylized Manhattan skyline (Jersey City / west perspective). Left → right = north → south.

**Project roadmap:** see [`docs/PROJECTS.md`](./docs/PROJECTS.md) for structured work tabs (content, viewpoints v2, compare mode, etc.).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- **Sanity** for buildings + transparent PNG cutouts

## Edit buildings (easy)

1. Open **[Skyinfoline Studio](https://skyinfoline.sanity.studio/)** (or locally `http://localhost:3000/studio`)
2. Sign in with your Sanity account
3. **Create / edit / delete** Building documents
4. Upload a **transparent PNG** on the “Skyline cutout” field
5. Set **Skyline order** (`orderIndex`) — lower = farther south; the skyline draws north→south (left→right) from Jersey City.
6. Optional **Year demolished** for towers no longer standing (e.g. Twin Towers: 2001). They appear only between completed and demolished years on the timeline.
7. Click **Publish**

The live site reads published buildings from Sanity. No code deploy needed for content changes.

### Transparent PNGs

Yes — still supported. Upload a PNG with alpha on `cutout`. The skyline uses a PNG CDN URL so transparency is kept. No image → silhouette fallback.

**Tip:** Crop PNGs tight to the building silhouette (minimal transparent padding above the spire). Extra empty space at the top of the file will push labels away from the visible tower.

## Local env

Copy `.env.example` → `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=re2nvive
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-25
```

Add the same `NEXT_PUBLIC_*` vars in the Vercel project settings for previews/production.

## Develop

```bash
npm install
npm run dev
```

- Site: http://localhost:3000  
- Studio: http://localhost:3000/studio  

## Scripts

- `npm run dev` — local server + embedded Studio
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run seed` — re-seed Manhattan buildings (needs `SANITY_WRITE_TOKEN`)

### Adding building cutout PNGs

PNG files are gitignored (large assets). To add or refresh cutouts on **`main`**:

```bash
git checkout main
git pull
cp ~/Documents/Codex/.../building-cutouts/*.png building-cutouts/
git add building-cutouts/
git commit -m "Add building cutout PNGs"
git push
npm run seed
```

Use descriptive filenames as exported (see `building-cutouts/filename-map.json`) or rename to `{id}.png` — both work. See [`building-cutouts/README.md`](./building-cutouts/README.md) for the full filename list.
