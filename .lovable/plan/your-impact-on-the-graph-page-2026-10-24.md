# Your impact on the Graph page

## What you will see
A new "Your impact" section on the Graph page, following the chosen time range (This week / month / year / All time):

- **CO2 saved**: e.g. "1.4 kg of CO2 kept out of the air", with a friendly comparison ("about 6 km not driven by car").
- **Remade items**: what your recycling becomes, e.g. "3 new cans", "5 new bottles", "2 new boxes", "40 new sheets of paper".
- A small bar chart showing CO2 saved per day or month, matching the existing chart.
- A note saying the numbers are typical estimates, not exact measurements.

Only correctly recycled items count, same as points. It works for past videos too.

## Estimates used (per item, easy to change later)
| Material | Size small / regular / large (CO2 saved) | Becomes |
|---|---|---|
| Plastic | 20 g / 50 g / 100 g | new bottles (1 per bottle) |
| Metal | 50 g / 140 g / 200 g | new cans (1 per can) |
| Glass | 100 g / 200 g / 300 g | new bottles/jars (1 each) |
| Paper | 5 g / 30 g / 60 g | new sheets of paper (about 1 each, newspaper about 8) |
| Cardboard | 60 g / 150 g / 300 g | new boxes (1 each) |
| Other | 10 g / 30 g / 60 g | not counted as remade |

Car comparison: about 0.17 kg CO2 per km driven.

## Technical details
- `src/lib/impact.ts`: `CO2_TABLE`, `itemImpact(item)` returns `{co2Grams, remade:{kind,count}}` using `materialOf`, size (default regular) and quantity; only for point-earning items; `formatCo2`, `kmEquivalent`.
- `stats.tsx`: sum impact over rows in the selected range; impact cards plus a CO2 bar chart using theme colors.
- No database change.
- Tests: regular plastic bottle = 50 g and 1 new bottle; 3 cans = 420 g and 3 new cans; trash item = 0; 1 kg = about 5.9 km.
