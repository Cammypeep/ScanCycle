# Steady sign-in background + Earth in the center

## What changes
1. **Same background on both tabs:** The background stays put when you switch between "Sign in" and "Create account". Right now the picture stretches to fit the box, and the create-account box is taller, so the picture moves. It will be pinned to the screen instead, so it looks exactly like the sign-in view on both tabs, and when you scroll.
2. **Earth in the middle:** Edit the current background picture. The Earth that sits in the flag ring gets replaced by a country flag that isn't already in the ring. A large Earth goes in the center, sized to fill the space just inside the ring of flags. The green recycling symbol stays on top of the Earth, so the app's symbol is still there. Everything else (the flags, colors, dark background) stays the same.

## Technical details
- `AccountForm.tsx`: change the background img from `absolute inset-0` to `fixed inset-0 h-screen w-screen object-cover` (with `-z-0` and content set to `relative`), so its size depends on the viewport, not the form height.
- Use `imagegen--edit_image` on `src/assets/auth-flags.jpg` (same file, same size). Check the result for duplicate or garbled flags and fix them with follow-up edits.
- Take a screenshot of both tabs to confirm the background doesn't move.
