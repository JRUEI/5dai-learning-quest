# 5DAI Learning Quest

Personal learning-progress tracker published as a static GitHub Pages site.

Progress remains available offline in localStorage. After Google sign-in, Firebase synchronizes all Day 1 and Day 2 Assignment, Podcast, and Whitepaper progress across devices. Existing progress from multiple devices is merged on first connection, and later changes are delivered through a live Firestore listener.

## Project structure

```text
index.html          Home page
days/day1/          Day 1 page and materials
days/day2/          Day 2 page and materials
days/day3/          Day 3 page
days/day4/          Day 4 page
days/day5/          Day 5 page
css/                Shared site and reader styles
js/                 Shared progress, reader and sync scripts
assets/             Course visuals
templates/          Reusable HTML templates
docs/               Content pipeline documentation
scripts/            Site validation tools
```

Each Day directory uses `index.html` as its landing page. Material pages such as
`assignment.html`, `podcast.html`, and `whitepaper.html` live beside that Day page.

## Validation and parallel work

Run `node scripts/validate-site.mjs` before committing or updating a pull
request. Parallel Codex tasks should use separate worktrees/branches. Direct
pushes to protected `main` are blocked; only the integration task should merge
a pull request after the `validate` check passes.
