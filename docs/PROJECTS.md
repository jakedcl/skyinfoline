# Skyinfoline — Projects

Structured work tabs for Skyinfoline. When starting a new Cursor thread, point the agent here:

> “Work on **Tab 2** from `docs/PROJECTS.md`.”

Update this file when a tab’s status changes (`active` → `done` → `parked`).

---

## Status key

| Status | Meaning |
|--------|---------|
| **active** | Current focus — do this now |
| **next** | Queued after active tab |
| **parked** | Good idea, not important yet |
| **done** | Shipped |

---

## Tab 1 — Content entry `active`

**Goal:** Fill Sanity with real building data and PNG cutouts so the skyline looks legit.

**You do (Studio):**
- Add / edit buildings (name, height, year, architect, cluster, style, nicknames)
- Upload transparent PNG cutouts
- Set `orderIndex` (lower = farther south along Manhattan)
- Set `skylineImportance` (1–10, affects visual weight — not shown as a number)

**Rough orderIndex guide (leave gaps: 10, 20, 30…):**

| Zone | orderIndex range |
|------|------------------|
| Downtown / FiDi | 10–50 |
| Midtown | 80–140 |
| Billionaires' Row / CPW | 150–180 |
| Hudson Yards | 40–70 (west side, editorial) |

**Agent can help with:** bulk seeding, schema tweaks, import scripts.

**Done when:** ~25–35 must-have towers have cutouts and accurate heights.

---

## Tab 2 — Compare mode `parked`

**Goal:** Select two buildings side-by-side (height, year, architect, style, etc.).

**Depends on:** Tab 1.

---

## Tab 3 — Resume / polish `next`

**Goal:** Make the site feel “out of this world” for portfolio.

**Ideas (pick as we go):**
- Era-based sky color shifts (timeline drives atmosphere)
- Smoother building entrance / construction animations
- Night mode / illumination
- Micro-copy and typography pass
- Loading / empty states
- True 3D exploration (orbit / joysticks) — later phase; current skyline is faux-3D with 2D cutouts only

**Depends on:** Tab 1 for best demo; can start small UI passes anytime.

---

## Tab 4 — Cross-borough expansion `parked`

**Goal:** Brooklyn Tower, JC skyline, etc. as separate modes or layers — not mixed into Manhattan row.

**Depends on:** Tab 1 (Manhattan complete).

---

## Tab 5 — Image pipeline `parked`

**Goal:** Semi-automate finding silhouettes, background removal, upload to Sanity.

**Ideas:** script + API (remove.bg, etc.), batch upload, naming conventions.

**Depends on:** Tab 1 workflow stable.

---

## Shipped (v1 baseline) `done`

- Next.js + Sanity CMS + transparent PNG cutouts
- Interactive 2D skyline (relative height scaling)
- Building detail panel + keyboard nav (← → Esc)
- Cinematic era timeline (play/pause, era chips)
- Two viewpoints: **Jersey City** (north → south) and **Brooklyn Bridge** (south → north)
- `cluster`, `style`, `nicknames`, `skylineImportance` fields

---

## How to use in Cursor

1. Open a **new thread** when context gets long.
2. Say: *“Read `docs/PROJECTS.md`. Work on Tab X.”*
3. When something ships, update status in this file (or ask the agent to).
