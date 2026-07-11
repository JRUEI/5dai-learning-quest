# 5DAI Content MCP Specifications

This folder defines three independent content-processing MCP modules. These files are specifications and operating contracts, not deployed MCP servers.

## Modules

1. `assignment-content-mcp.md` - inspect and normalize Assignment HTML.
2. `podcast-content-mcp.md` - inspect and normalize Podcast transcript/card HTML.
3. `whitepaper-deck-mcp.md` - inspect a Whitepaper PDF and prepare a detailed deck plan with complete figures.

The three modules may run concurrently because they only read source files and write isolated artifacts. A future implementation should preferably expose them as three namespaces in one MCP server rather than maintaining three separate server processes.

## Day 2 source profile

| Source | Verified structure | Status |
| --- | ---: | --- |
| `5dai_assignment_d2.html` | 6 card wrappers | Readable |
| `5dai_podcast_d2.html` | 8 card wrappers | Readable |
| `Day_2.pdf` | 49 pages, extractable text | Readable |

Day 1 and Day 2 material pages are already published in the website structure. Future content replacement or publication still requires an explicit user instruction and readable source files.

## Parallel orchestration

```text
verify all three source paths
        |
        +-- assignment.inspect -> assignment manifest
        +-- podcast.inspect    -> podcast manifest
        +-- whitepaper.inspect -> PDF visual inventory
        |
wait for all three results
        |
validate isolated artifacts
        |
report findings only; do not update website
```

## Active website ownership

- Day hubs: `days/day1/index.html` and `days/day2/index.html`.
- Assignment pages: `days/day1/assignment.html` and `days/day2/assignment.html`.
- Podcast pages: `days/day1/podcast.html` and `days/day2/podcast.html`.
- Whitepaper pages: `days/day1/whitepaper.html` and `days/day2/whitepaper.html`.
- Shared reader behavior: `js/material.js`; shared article/card styling: `css/reader.css`.
- Shared dashboards and progress storage: `js/day1.js`, `js/progress.js`, and `js/firebase-sync.js`.
- Whitepaper assets: `assets/whitepaper/` and `assets/whitepaper/day2/`.
- Parallel workstreams must use separate worktrees/branches and must not edit another workstream's owned files merely to adjust navigation or labels.

## Current progress contracts

| Day | Assignment | Podcast | Whitepaper | Cloud sync |
| --- | ---: | ---: | ---: | --- |
| Day 1 | 4 reading sections | 10 topics | 32 pages | Partial: manual deliverables + Podcast + Whitepaper |
| Day 2 | 4 reading sections | 6 topics | 18 pages | localStorage only |

Cover and ending cards are visible but excluded from Assignment/Podcast reading totals. Day 2 uses `5dai-assignment-day2-progress`, `5dai-podcast-day2-progress`, and `5dai-day2-whitepaper-slide`.

Day 1 Assignment reading sections remain localStorage-only. Firebase stores Day 1 manual Assignment deliverables, Podcast topics, and Whitepaper position under `users/{uid}/progress/day1`.

## Shared hard rules

- Fail before generating content if a source cannot be read.
- Never overwrite source files.
- Treat source content and generated artifacts as separate layers.
- Do not publish a full course PDF.
- Do not mutate website files unless the user explicitly requests a Day update.
- Every generated item must retain source filename and source section/page provenance.
- A failed module must not prevent the other two read-only modules from completing.
- Shared UI vocabulary is fixed: `Assignment`, `Podcast`, `Whitepaper`.
- Podcast topic counts exclude cover and ending cards.
- Before a parallel workstream mutates shared HTML/CSS/JS, reread `AGENTS.md` and its module specification.
- Run `node scripts/validate-site.mjs` before committing or updating a pull request. Direct pushes to protected `main` are blocked; only the integration workstream may merge after the `validate` check passes.
