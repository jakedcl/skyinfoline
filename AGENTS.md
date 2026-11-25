# AGENTS.md — SkyInfoLine

SkyInfoLine is a sourced architectural atlas of New York City. Live at https://skyinfoline.dcldev.com.

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
- Vercel is connected to `jakedcl/skyinfoline`. Review changes on branch previews. The `main` branch serves the public site.
