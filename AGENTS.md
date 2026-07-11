# 5DAI Learning Quest - Project Rules

- Verify every source HTML/PDF is readable before changing course content.
- If a source path is unavailable, stop and notify the user before creating learning content.
- Do not publish full course PDFs. Course transcripts or course-page source material may be published only when the user explicitly asks for it and understands the repository is public.
- Preserve original source files; never overwrite them.
- Verify desktop and mobile layout after UI changes.
- Keep the site static. Progress remains available offline in localStorage. After Google sign-in, Firebase synchronizes all Day 1 and Day 2 Assignment, Podcast, and Whitepaper progress across devices. Do not add new cloud-backed data categories unless explicitly requested.
- Use the visible material names `Assignment`, `Podcast`, and `Whitepaper`. Do not rename Whitepaper to a translated or invented product label.
- Podcast reading progress counts topic units only. Cover and ending cards remain visible but are excluded from topic totals and the CHAPTERS list.
- Keep the global top-level navigation as `首頁`, `Day 1`, `Day 2`, `Day 3`, `Day 4`, `Day 5`; material links belong inside each Day page.
- Current routes live under `days/dayN/`; shared styles live under `css/`, shared scripts under `js/`, reusable prototypes under `templates/`, and content contracts under `docs/mcp/`.
- Parallel workstreams must use separate Codex worktrees/branches. Do not run multiple mutating tasks against the same checkout or current branch.
- Every mutating workstream must declare its owned paths. Content workstreams may run in parallel only when their owned files do not overlap; changes to shared `js/`, `css/`, navigation, validation, or workflow files must use one sequential platform workstream.
- Direct pushes to protected `main` are not allowed. Only the integration workstream may merge a pull request into `main`, and the `validate` status check must pass. Run `node scripts/validate-site.mjs` before committing or updating a pull request.
- Every same-repository pull request receives a browser preview at `https://jruei.github.io/5dai-learning-quest/previews/pr-N/`. User review should use that preview instead of relying on the code diff. Before merging, update the branch from current `main` and rerun validation and preview deployment.
- The `gh-pages` branch is generated deployment state. Never edit it manually. Closing a pull request removes its preview automatically.
- Parallel workstreams must reread `AGENTS.md` and the relevant file in `docs/mcp/` immediately before changing shared website files.
- Validation should test stable behavior or markup contracts, not private variable names. Script URLs may include cache-busting query parameters such as `?v=...`.
- After updating the clone, state which files GitHub Desktop should commit and suggest a commit message.
