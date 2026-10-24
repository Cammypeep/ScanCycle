Rename the "Rewards" tab to "Recycle"

- Top menu: the "Rewards" link label (and its screen-reader label) becomes "Recycle". The page address stays the same.
- The browser tab title for that page becomes "Recycle — ScrapSense".
- Nothing else changes (points, uploads, other pages).

Technical: edit src/components/SiteChrome.tsx line 42 and the head() title/og:title in src/routes/_authenticated/rewards.tsx.
