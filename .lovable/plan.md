# Bulk submissions, 10-minute cooldown, and scaled points

## What you will see
- **Several videos at once:** On the Rewards page you can pick up to 5 videos in one submission (for example, one per bin). They are reviewed together and points are added up into one result.
- **10-minute cooldown:** After a submission is reviewed, the button shows a countdown ("Next submission in 9:42"). Trying early, even from another tab, is refused with the time left. Failed reviews do not start the cooldown.
- **Points scale with value and amount:** Instead of a flat 10 per item, the AI estimates what each item is worth and how many were recycled. Starting values (easy to change later):

| Item | Points each |
|---|---|
| Single sheet of paper | 0.1 |
| Newspaper / magazine | 1 |
| Small cardboard box | 3 |
| Large flattened box | 6 |
| Plastic water bottle (regular) | 10 |
| Large plastic jug | 12 |
| Aluminum can | 12 |
| Glass bottle / jar | 10 |
| Small plastic cup / tub | 4 |

  Unknown items get a value based on size and material, capped at 20 points each. Quantity counts: "5 sheets of paper" = 0.5 points.
- Points show with one decimal (e.g. "0.5 points", "+24.1 points") on Rewards, Leaderboard, Friends and Graph. Past points stay as they were.
- Recycling-only rule stays: trash and compost still earn 0.

## Technical details
- `reward-rules.ts`: add `quantity` (int 1-200) and `size` (small|regular|large) to items; `VALUE_TABLE` keyed by material+size with paper-sheet override; `itemPoints` = value x quantity, rounded to 0.1, per-item cap 20 x quantity, per-submission cap 200. AI value is never trusted directly; the server table decides.
- `rewards.functions.ts`: accept `paths: string[]` (1-5); send all videos in one AI request; prompt asks for quantity and size per item; cooldown check before work: reject if the user has a `complete` submission newer than 10 minutes (server time).
- Database migration (additive): new `points_awarded numeric(8,1)` column on video submissions, set only by the server; backfill from old `points`; leaderboard and friend score functions recreated to sum `points_awarded`; old generated `points` marked deprecated. Index on (user_id, created_at) for the cooldown check.
- `rewards.tsx`: multi-file picker with list/remove, countdown from latest submission time, decimal display. `leaderboard.tsx`, `friends.tsx`, `stats.tsx`: use new decimal points.
- Tests: 1 sheet paper = 0.1; regular water bottle = 10; 5 sheets = 0.5; trash = 0; cap applies; cooldown helper blocks at 9 min and allows at 10 min.
