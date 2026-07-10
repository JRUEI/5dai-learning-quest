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

No Day 2 content may be added to the public website unless the user gives a separate publishing instruction.

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
