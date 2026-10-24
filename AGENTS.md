<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Authenticated photo analysis uses server-side Responses with profile location; photo history stays device-local and is partitioned by account to avoid cross-account exposure.
- Accounts, friendships and verified video awards persist in Cloud with owner-scoped policies; only the authenticated server verifier writes awards, and generated database points enforce the per-item rule.
- Private videos are reviewed using a video-capable model with actual MIME data; video-submission-key.ts owns the reversible repeat-submission testing switch, while uncertainty never earns points.
- App pages live under the client-only authenticated layout; public account pages collect missing profile fields after social login.
