# Podcast Content MCP

## Purpose

Convert Podcast transcript/card HTML into structured reading sections and automatic progress units without publishing Day content.

## MCP namespace

`podcast`

## Proposed tools

### `podcast.inspect_html`

Reports readability, encoding, card count, topic headings, YouTube references, transcript blocks and structural warnings.

### `podcast.extract_manifest`

Returns:

```json
{
  "day": 2,
  "type": "podcast",
  "source": "5dai_podcast_d2.html",
  "cover_cards": [],
  "topics": [
    {
      "stable_id": "d2-podcast-topic-01",
      "title": "...",
      "paragraphs": [],
      "source_cards": [2],
      "progress_unit": 1
    }
  ]
}
```

### `podcast.plan_reading_progress`

Produces automatic tracking metadata:

- topic count;
- DOM section IDs;
- card-to-topic mapping;
- article intersection targets;
- card lightbox page mapping;
- completion threshold and resume target.

Podcast topics are marked read only when the reader reaches the corresponding article section or opens the corresponding card. No manual completion button is generated.

### `podcast.validate_manifest`

Checks that every non-cover card maps to one topic or has an explicit multi-card grouping, and that no transcript block disappears during normalization.

## Pipeline

1. Verify the source file.
2. Detect cover, topic and closing cards.
3. Extract headings and paragraph blocks while preserving order.
4. Group multi-card topics explicitly rather than guessing silently.
5. Create stable topic IDs independent of visible titles.
6. Produce reading-progress metadata.
7. Validate card coverage and provenance.

## Day 2 acceptance baseline

- Source filename: `5dai_podcast_d2.html`
- Expected card wrappers: 8
- No Day 2 website or Firebase records are created in the current task.

## Hard failures

- unreadable source;
- a source card is omitted without classification;
- automatic reading is replaced by manual checkbox completion;
- transcript order changes;
- source HTML is modified.

