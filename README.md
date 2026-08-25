# Skyinfoline

Interactive, stylized Manhattan skyline (Brooklyn / east perspective). Left → right = south → north.

## Stack

- Next.js (App Router) + TypeScript + Tailwind

## Add a building

1. Add an object to [`src/data/buildings.ts`](src/data/buildings.ts).
2. Set `orderIndex` for left-to-right position (lower = farther south).
3. Optional: drop a transparent PNG in `public/buildings/` and set `imageSrc` (e.g. `/buildings/empire-state.png`). Without an image, a silhouette shape is used.

## Develop

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — local server
- `npm run build` — production build
- `npm run lint` — ESLint
