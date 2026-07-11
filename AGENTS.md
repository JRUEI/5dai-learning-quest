# 5DAI Learning Quest - Project Rules

- Verify every source HTML/PDF is readable before changing course content.
- If a source path is unavailable, stop and notify the user before creating learning content.
- Do not publish full course PDFs. Course transcripts or course-page source material may be published only when the user explicitly asks for it and understands the repository is public.
- Preserve original source files; never overwrite them.
- Verify desktop and mobile layout after UI changes.
- Keep the site static. All progress starts in localStorage. Firebase currently syncs only Day 1 manual Assignment deliverables, Podcast topics, and Whitepaper position; Day 1 Assignment reading sections and all Day 2 progress remain localStorage-only. Do not claim or expand cloud sync unless explicitly requested.
- Use the visible material names `Assignment`, `Podcast`, and `Whitepaper`. Do not rename Whitepaper to a translated or invented product label.
- Podcast reading progress counts topic units only. Cover and ending cards remain visible but are excluded from topic totals and the CHAPTERS list.
- Keep the global top-level navigation as `首頁`, `Day 1`, `Day 2`, `Day 3`, `Day 4`, `Day 5`; material links belong inside each Day page.
- Current routes live under `days/dayN/`; shared styles live under `css/`, shared scripts under `js/`, reusable prototypes under `templates/`, and content contracts under `docs/mcp/`.
- Parallel workstreams must use separate Codex worktrees/branches. Do not run multiple mutating tasks against the same checkout or current branch.
- Only the integration workstream may merge or push `main`. Before any commit intended for `main`, run `node scripts/validate-site.mjs` and do not push while it reports an error.
- Parallel workstreams must reread `AGENTS.md` and the relevant file in `docs/mcp/` immediately before changing shared website files.
- Validation should test stable behavior or markup contracts, not private variable names. Script URLs may include cache-busting query parameters such as `?v=...`.
- After updating the clone, state which files GitHub Desktop should commit and suggest a commit message.
