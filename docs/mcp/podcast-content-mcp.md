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

Cover and ending cards are presentation structure, not progress units. They remain visible in article/card views but must not appear in the numbered `CHAPTERS` list and must not increase the topic total. Day 1 has 12 cards and 10 progress topics; Day 2 has 8 cards and 6 progress topics. In both cases the structure is 1 cover + topic cards + 1 ending.

### `podcast.validate_manifest`

Checks that every non-cover card maps to one topic or has an explicit multi-card grouping, and that no transcript block disappears during normalization.

## Text presentation contract

Podcast source HTML already contains the finished visual cards. Reuse those
existing `.card-wrapper` cards for card view; do not generate, redraw or restyle
a second set of cards.

Article view is a text reading surface, not another card or slide format. Extract
only the meaningful text structure and preserve:

- heading and paragraph order;
- paragraph boundaries and deliberate spacing;
- bold or highlighted phrases as strong emphasis;
- quotations and callouts as visually distinct text blocks;
- ordered and unordered lists as lists rather than flattened paragraphs;
- inline terms, punctuation and line-break meaning from the source.

Text emphasis must be perceptible at a glance, not merely present in the DOM.
On a dark article background, changing light body copy to white bold text alone
is too subtle. Important phrases should keep a source-derived highlighter or
another clearly contrasting accent treatment in addition to font weight.

Quotation marks alone do not create a callout. A source quotation/callout must
remain a distinct block with visible separation from body copy, such as a
contrasting inset background, accent left rule, padding and stronger type. Day 1
topic 01 is the comparison baseline: the yellow-highlighted statistic and the
gray quote box with an orange left rule must remain immediately recognizable in
article view, even though the full card layout is not reproduced.

Decorative card-only elements such as category badges, page counters, oversized
background numerals and footers do not need to be reconstructed in article view.
Sanitizing inline styles must not erase text semantics: in particular, a quote
inside a styled container must remain a quote/callout instead of becoming a plain
paragraph, and highlighted text must remain clearly emphasized.

Validation compares the article text with its source card for wording, order,
grouping, emphasis and callout/list structure. It does not require article view
to reproduce the card's full graphic design. Visual QA must confirm that emphasis
and callouts are clearly distinguishable at normal desktop and mobile viewing
sizes; checking only tag names or font-weight values is insufficient.

## Current website integration

- Day 1 page: `days/day1/podcast.html`; 10 topics use `ProgressStore.podcastSections` and synchronize after Google sign-in.
- Day 2 page: `days/day2/podcast.html`; 6 topics use `5dai-podcast-day2-progress` offline and synchronize after Google sign-in.
- Shared article/card behavior lives in `js/material.js`; shared presentation rules live in `css/reader.css`.

## Pipeline

1. Verify the source file.
2. Detect cover, topic and closing cards.
3. Extract headings and paragraph blocks while preserving order.
4. Group multi-card topics explicitly rather than guessing silently.
5. Create stable topic IDs independent of visible titles.
6. Produce reading-progress metadata.
7. Reuse the original cards and build only the separate semantic article text.
8. Validate card coverage, provenance and text-presentation fidelity.

## Day 2 acceptance baseline

- Source filename: `5dai_podcast_d2.html`
- Expected card wrappers: 8
- Published website page: `days/day2/podcast.html`
- Expected reading topics: 6
- Day 2 reading progress key: `5dai-podcast-day2-progress` (offline cache plus Firebase sync after sign-in).
- Replacing or republishing course content still requires an explicit user instruction.

## Hard failures

- unreadable source;
- a source card is omitted without classification;
- automatic reading is replaced by manual checkbox completion;
- transcript order changes;
- cover or ending cards are counted as Podcast topics;
- existing source cards are redrawn or replaced by generated alternatives;
- article extraction silently flattens emphasis, quotations, callouts or lists;
- source HTML is modified.
