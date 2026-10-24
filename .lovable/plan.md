# Sign in with username or email + colorful sign-in background

## What changes
1. **Sign-in field** reads "Email or username". If the text contains "@" it is treated as an email; otherwise as a username (a leading "@" is ignored, case-insensitive). Sign-up and "forgot password" still ask for an email.
2. **Colorful background** on the sign-in page: replace the faint photo with a bright, animated-feeling gradient using recycling-bin colors (emerald green, sky blue, sunny yellow, warm coral) as soft blurred color blobs behind the form card, plus the photo kept very faint on top for texture. The form sits on a frosted card so text stays readable.

## Technical details
- New server function `signInWithIdentifier` (public, no auth): input validated with zod (identifier ≤255, password 8–128). For usernames it looks up the account email server-side with the admin client (loaded inside the handler), then signs in server-side with a fresh non-persisting client and returns only the session tokens. The email is never sent to the browser. Failures always return the same generic "Invalid login details" message so usernames can't be probed.
- Client calls `supabase.auth.setSession(tokens)` then invalidates the profile query, matching the current flow. Email input still goes straight through `signInWithPassword`.
- Background colors added as new tokens in `src/styles.css` (`--auth-blob-1..4`, gradient token) — no hard-coded colors in the component.
- Small test for the identifier rule (email vs username detection and "@" stripping).
