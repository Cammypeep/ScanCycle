# Recycling by material on the Graph page

## What you will see
- Each reviewed video now also records the material of every item: **Plastic, Paper, Cardboard, Metal, Glass, or Other**.
- The Graph page gets:
  - Material buttons above the chart (All, Plastic, Paper, ...) to filter the bar chart.
  - Stacked bars, one color per material, so you can see the mix each day or month.
  - Totals for each material for the chosen time (This week / month / year / All time), for example "Plastic 4 · Paper 2 · Metal 1".
- Only items that earned points are counted, same as now.
- Videos sent before this change have no material saved. The app will guess from the item name (for example "can" means Metal, "bottle" means Plastic). If it can't tell, it counts as Other.

## Technical details
- `src/lib/reward-rules.ts`: add `material` enum (plastic|paper|cardboard|metal|glass|other) to `itemSchema` (optional, for old rows); add `materialOf(item)` with keyword fallback for old results.
- `src/lib/rewards.functions.ts`: add required `material` to the strict JSON schema items and a prompt line asking the AI to name each item's main material.
- `src/routes/_authenticated/stats.tsx`: select `result` too; bucket point-earning items (`itemPoints(i)===10`) by date and material; stacked `Bar` per material using theme chart colors; material filter buttons and per-material totals.
- No database change: material lives inside the existing saved result.
- Tests in `src/test/reward-rules.test.ts`: AI material used when present; "aluminum can" maps to metal and "water bottle" to plastic when missing; unknown name maps to other.
