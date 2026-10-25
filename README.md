# ScanCycle

ScanCycle is an AI-powered recycling assistant. Point your camera at an item and it
tells you what the object is, whether it can be recycled, which coloured bin it belongs
to in your country, and what to do with it (rinse, flatten, remove the lid) before it
goes in safely.

Recycling is then rewarded. You film yourself putting an item into the correct bin, the
AI checks the video against your country's bin colours, and you earn points scaled to
how valuable the recycled item is and how much of it you recycled. Points feed a country
and worldwide leaderboard, a graph of what you recycled over time broken down by
material, and an impact estimate of the CO2 saved and the number of new products made
from your recycling — adjusted for the real recycling rate where you live.

## Features

- **Scan** — photograph an item to get its name, recyclability, the correct bin colour
  for your country, and prep steps (safety warnings first). Recently scanned items are
  kept on the page with the bin they belong in.
- **Recycle** — upload a short private video (up to 5 at a time) of you depositing items.
  The video is verified by an AI model: correct bin earns points, wrong bin earns none
  and tells you what you misplaced, and a bin colour that means nothing in your country
  earns no points with an explanation of the colour you should have used.
- **Friends** — add people by username, accept or remove requests, and see each
  friend's full name, handle and points.
- **Leaderboard** — rank yourself against your own country or worldwide, filtered to
  this week, this month, or all time.
- **Graph** — items recycled per day, week, month or year, stacked by material
  (plastic, paper, cardboard, metal, glass, other), with per-material totals.
- **Your impact** — CO2 avoided and products remade from what you recycled, using the
  real recycling rate for your country.
- **Account** — sign in with a username or email (or Google), set your country and
  locality so bin colours match where you actually live, and change them later in
  Settings.

## Tech stack

- [TanStack Start](https://tanstack.com/start) v1 (React 19, Vite) with file-based
  routing in `src/routes`
- Tailwind CSS v4 (`src/styles.css`)
- Lovable Cloud (Supabase) for auth, the database and storage
- Lovable AI Gateway for photo and video analysis (server functions in `src/lib/*.functions.ts`)

## Run it locally

You need Node.js 20 or newer (Bun also works) and npm.

```sh
git clone <this-repository-url>
cd pixel-perfect-replay-5418
npm install
npm run dev
```

Then open the local address the terminal prints (Vite's default is
`http://localhost:5173`).

### Environment variables

The backend address and publishable key live in `.env`, which is committed to this
repository, so a fresh clone works without any extra setup. If you point the app at your
own backend instead, replace these values:

```
VITE_SUPABASE_URL=<your backend URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
VITE_SUPABASE_PROJECT_ID=<your project id>
```

The matching `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PROJECT_ID`
entries (no `VITE_` prefix) are read server-side. Never put a secret key in this file.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Project layout

```
src/
  routes/          pages: auth, scan, rewards, leaderboard, stats, friends, settings
  routes/_authenticated/   pages that require an account
  lib/             AI analysis, bin rules, reward rules, impact maths
  components/      shared UI
supabase/          backend config and migrations
```

## Testing switches

Two flags exist to make manual testing easier and should be set back before a real
launch:

- `ALLOW_REPEAT_VIDEO_SUBMISSIONS` in `src/lib/video-submission-key.ts` — `true` lets the
  same video be submitted more than once.
- `COOLDOWN_ENABLED` in `src/lib/reward-rules.ts` — `false` skips the 10-minute wait
  between submissions.

This project was built with [Lovable](https://lovable.dev).
