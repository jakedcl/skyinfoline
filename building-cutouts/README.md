# Building skyline cutouts

Drop **transparent PNG** cutouts here before running `npm run seed`.

## Committing PNGs to git

PNG cutouts in `building-cutouts/` and `public/building-cutouts/` are tracked by git (only `outputs/building-cutouts/` is ignored).

After adding or updating cutouts:

```bash
git add public/building-cutouts/
git commit -m "Add building cutout PNGs"
git push
```

If you added PNGs before the gitignore fix, force-add them once:

```bash
git add -f public/building-cutouts/*.png
git commit -m "Add building cutout PNGs"
git push
```

Either folder works for the seed script; `public/building-cutouts/` is a common choice when assets should ship with the app.

## Naming convention

The seed script accepts **either** format:

1. **Seed id** — `{id}.png` (matches `id` in `src/data/buildings-seed.json`)
2. **Descriptive filename** — mapped via `filename-map.json` in this folder

Examples of seed-id names:

- `empire-state.png` → Empire State Building
- `flatiron-building.png` → Flatiron Building
- `one-wtc.png` → One World Trade Center

If your PNGs use descriptive names (e.g. from an export folder), copy them as-is and rely on `filename-map.json`. Add new mappings there when filenames do not match a seed id.

## Alternate folders

The seed script also checks (first match wins):

- `public/building-cutouts/`
- `outputs/building-cutouts/`

## Descriptive filenames (mapped)

These filenames are recognized via `filename-map.json`:

| Your PNG filename | Building |
| --- | --- |
| `1-world-trade-center-north-tower.png` | 1 World Trade Center (North Tower) |
| `2-world-trade-center-south-tower.png` | 2 World Trade Center (South Tower) |
| `3-world-trade-center.png` | 3 World Trade Center |
| `4-world-trade-center.png` | 4 World Trade Center |
| `8-spruce-street.png` | 8 Spruce Street |
| `15-central-park-west.png` | 15 Central Park West |
| `30-hudson-yards.png` | 30 Hudson Yards |
| `30-rockefeller-plaza.png` | 30 Rockefeller Plaza |
| `35-hudson-yards.png` | 35 Hudson Yards |
| `40-wall-street.png` | 40 Wall Street |
| `50-hudson-yards.png` | 50 Hudson Yards |
| `53w53.png` | 53W53 |
| `70-pine-street.png` | 70 Pine Street |
| `111-west-57th-street.png` | 111 West 57th Street |
| `220-central-park-south.png` | 220 Central Park South |
| `270-park-avenue.png` | 270 Park Avenue |
| `432-park-avenue.png` | 432 Park Avenue |
| `520-park-avenue.png` | 520 Park Avenue |
| `550-madison-avenue.png` | 550 Madison Avenue |
| `bank-of-america-tower.png` | Bank of America Tower |
| `central-park-tower.png` | Central Park Tower |
| `chrysler-building.png` | Chrysler Building |
| `citigroup-center.png` | Citigroup Center |
| `empire-state-building.png` | Empire State Building |
| `flatiron-building.png` | Flatiron Building |
| `general-electric-building-570-lexington.png` | General Electric Building |
| `hearst-tower.png` | Hearst Tower |
| `lever-house.png` | Lever House |
| `metlife-building.png` | MetLife Building |
| `metropolitan-life-insurance-company-tower.png` | Metropolitan Life Insurance Company Tower |
| `one-manhattan-west.png` | One Manhattan West |
| `one-vanderbilt.png` | One Vanderbilt |
| `one-world-trade-center.png` | One World Trade Center |
| `one57.png` | One57 |
| `seagram-building.png` | Seagram Building |
| `the-spiral.png` | The Spiral |
| `woolworth-building.png` | Woolworth Building |

## Seed-id filenames (direct match)

You can also name files with the seed id directly:

| PNG filename | Building |
| --- | --- |
| `15-central-park-west.png` | 15 Central Park West |
| `270-park-avenue.png` | 270 Park Avenue |
| `30-hudson-yards.png` | 30 Hudson Yards |
| `30-rockefeller-plaza.png` | 30 Rockefeller Plaza |
| `35-hudson-yards.png` | 35 Hudson Yards |
| `50-hudson-yards.png` | 50 Hudson Yards |
| `520-park-avenue.png` | 520 Park Avenue |
| `53w53.png` | 53W53 |
| `550-madison.png` | 550 Madison Avenue |
| `bank-of-america.png` | Bank of America Tower |
| `central-park-tower.png` | Central Park Tower |
| `chrysler.png` | Chrysler Building |
| `citigroup-center.png` | Citigroup Center |
| `eight-spruce.png` | 8 Spruce Street |
| `empire-state.png` | Empire State Building |
| `flatiron-building.png` | Flatiron Building |
| `forty-wall.png` | 40 Wall Street |
| `four-thirty-two-park.png` | 432 Park Avenue |
| `four-wtc.png` | 4 World Trade Center |
| `ge-building-570-lexington.png` | General Electric Building |
| `hearst-tower.png` | Hearst Tower |
| `lever-house.png` | Lever House |
| `metlife.png` | MetLife Building |
| `metropolitan-life-tower.png` | Metropolitan Life Insurance Company Tower |
| `one-manhattan-west.png` | One Manhattan West |
| `one-vanderbilt.png` | One Vanderbilt |
| `one-wtc.png` | One World Trade Center |
| `one57.png` | One57 |
| `seagram-building.png` | Seagram Building |
| `seventy-pine.png` | 70 Pine Street |
| `steinway-tower.png` | 111 West 57th Street |
| `the-spiral.png` | The Spiral |
| `three-wtc.png` | 3 World Trade Center |
| `two-twenty-cps.png` | 220 Central Park South |
| `woolworth.png` | Woolworth Building |
| `world-trade-center-north-tower.png` | 1 World Trade Center (North Tower) |
| `world-trade-center-south-tower.png` | 2 World Trade Center (South Tower) |

## Seed command

```bash
# Requires SANITY_WRITE_TOKEN in .env.local
npm run seed
```

The script uploads new PNGs to Sanity, attaches them to the `cutout` field on each building document, and preserves existing cutouts when no local file is present.
