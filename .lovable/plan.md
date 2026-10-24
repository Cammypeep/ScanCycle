# Real recycling rates in "Your impact"

## What you will see
- CO2 saved and "Remade because of you" now count only the share of your items that actually gets remade where you live. For example, 2 water bottles in the US shows "0.6 new plastic bottles" (about a 30% rate), not 2.
- Remade numbers show one decimal (e.g. 0.6, 4.7).
- A line under the impact cards: "Based on real recycling rates in Australia: plastic 18%, paper 60%, metal 65%, glass 57%, cardboard 65%", with a note that these are estimates.
- If you change your country in Settings, the impact recalculates using that country's rates. Points are not affected.

## Estimated real recycling rates (share actually remade)
| Country | Plastic | Paper | Cardboard | Metal | Glass |
|---|---|---|---|---|---|
| United States | 30% | 65% | 70% | 50% | 31% |
| Canada | 25% | 65% | 70% | 60% | 45% |
| United Kingdom | 45% | 70% | 75% | 75% | 72% |
| Germany | 50% | 80% | 85% | 90% | 80% |
| Australia | 18% | 60% | 65% | 65% | 57% |
| India | 35% | 40% | 45% | 60% | 45% |
| China | 30% | 50% | 55% | 70% | 40% |
| Other countries | 25% | 55% | 60% | 60% | 45% |

Plastic covers bottles and containers. "Other" material uses half the plastic rate. These are rough figures from public estimates and can be changed later.

## Technical details
- `src/lib/recycling-rates.ts`: `RATES` by country plus default; `rateFor(country, material)`.
- `src/lib/impact.ts`: `itemImpact(item, country)` multiplies CO2 and remade count by the rate; remade count kept fractional.
- `stats.tsx`: pass the profile country; format remade with one decimal; show the rate line.
- Tests updated: US regular bottle = 15 g CO2 and 0.3 bottles; Germany 3 cans = 378 g and 2.7 cans; unknown country uses default rates.
