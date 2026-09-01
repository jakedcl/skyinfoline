# Building skyline cutouts

Drop **transparent PNG** cutouts here before running `npm run seed`.

## Naming convention

Each file must match a building `id` from `src/data/buildings-seed.json`:

```
{id}.png
```

Examples:

- `empire-state.png` → Empire State Building
- `flatiron-building.png` → Flatiron Building
- `one-wtc.png` → One World Trade Center

## Alternate folders

The seed script also checks (first match wins):

- `public/building-cutouts/`
- `outputs/building-cutouts/`

## Required files (37 buildings)

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
