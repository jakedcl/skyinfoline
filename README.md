# Skyinfoline

Interactive, stylized Manhattan skyline (Brooklyn / east perspective). Left → right = south → north.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- **Sanity** for buildings + transparent PNG cutouts

## Edit buildings (easy)

1. Open **[Skyinfoline Studio](https://skyinfoline.sanity.studio/)** (or locally `http://localhost:3000/studio`)
2. Sign in with your Sanity account
3. **Create / edit / delete** Building documents
4. Upload a **transparent PNG** on the “Skyline cutout” field
5. Set **Skyline order** (`orderIndex`) — lower = farther south = farther left
6. Click **Publish**

The live site reads published buildings from Sanity. No code deploy needed for content changes.

### Transparent PNGs

Yes — still supported. Upload a PNG with alpha on `cutout`. The skyline uses a PNG CDN URL so transparency is kept. No image → silhouette fallback.

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
