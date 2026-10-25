# Bright & sunny color refresh

Swap the dark gloomy theme for a light, cheerful palette across every app page.

## What changes
- Background: warm cream with soft color washes (sky blue, sunny yellow, coral) instead of dark navy.
- Main color: fresh green for buttons and highlights, with sky blue, sunny yellow and coral as extra accent colors.
- Cards: white, softly shadowed, with dark readable text.
- Headings and point numbers: colorful gradients (green to sky blue) instead of silver.
- Nav tabs: each tab gets its own accent color when active (green, blue, yellow, coral).
- Graph colors and the leaderboard top-3 get brighter, more varied colors.
- Bin color squares, warnings ("Use this bin" callout) and the login flags background stay as they are; the login card becomes light to match.

## Technical details
- Rewrite `:root` tokens in `src/styles.css` (background, card, foreground, muted, border, chart-1..5, gradients, shadows) to light oklch values; add `--sun`, `--sky`, `--coral` tokens registered in `@theme inline`.
- Replace `--gradient-steel` (used by `text-steel`) with a green-to-sky gradient; update `--gradient-page` to light radial washes.
- Scan components for hardcoded dark-assumption classes (e.g. `bg-black/..`, `text-white`) and switch to tokens.
- SiteChrome nav: per-tab accent tokens.
- Browser-check scanner, recycle, leaderboard, graph and login pages for contrast.
