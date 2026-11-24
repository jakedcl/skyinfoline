# AGENTS.md — SkyInfoLine

SkyInfoLine is a sourced architectural atlas of New York City. Deployment is pending.

## Stack
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, MapLibre GL JS.
- The local site needs no Sanity, hosted database, keys, or external image service.

## Layout
- `src/app/` contains home, explore and building detail routes.
- `src/lib/` reads the atlas, ranks search results and formats sourced facts.
- `atlas/` contains inputs from the versioned atlas research release.

## Commands
- `npm ci`, `npm run dev`, `npm run check`. Use the Node version in `.nvmrc`.

## Gotchas
- Treat the atlas IDs and evidence paths as stable. Never merge two buildings solely because they share an address.
- Review the source and vintage before showing an approximate historical location, reported status or conflicting dimension.
- Build and verify locally first. When a hosted preview is needed, stop and tell Jake which repository and branch to connect to Vercel. Jake handles the connection and separately approves promotion.
