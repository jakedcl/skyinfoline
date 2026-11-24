# SkyInfoLine

Searchable field guide to New York City buildings, from Dutch New Amsterdam to current proposals. The first website uses atlas research release 0.3 with source links and stable building IDs.

## Development

Use Node 22 and run:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Search for “Jenga Building,” “30 Rock,” “Ghostbusters Firehouse,” or “270 Park Avenue.” The map uses OpenFreeMap for its basemap and the catalog for locations. See [atlas inputs](atlas/README.md) for provenance.

Run `npm run check` for lint, type checks, and a production build. The first preview is local. See [AGENTS.md](AGENTS.md) for the Vercel handoff.
