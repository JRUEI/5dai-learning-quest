# Assignment Content MCP

## Purpose

Convert course Assignment HTML into a stable, reviewable manifest without publishing it to the website.

## MCP namespace

`assignment`

## Proposed tools

### `assignment.inspect_html`

Input:

```json
{ "source_path": "...", "day": 2 }
```

Returns file readability, encoding, title, card count, heading count, link inventory and structural warnings.

### `assignment.extract_manifest`

Returns normalized data:

```json
{
  "day": 2,
  "type": "assignment",
  "source": "5dai_assignment_d2.html",
  "sections": [
    {
      "stable_id": "d2-assignment-01",
      "title": "...",
      "body_blocks": [],
      "links": [],
      "requirements": [],
      "source_card": 1
    }
  ]
}
```

### `assignment.classify_actions`

Classifies each requirement as:

- automatic reading progress;
- manually verifiable deliverable;
- external Codelab or deployment;
- quiz/evaluation candidate;
- informational only.

Reading requirements must not become manual checkboxes. Manual checkboxes are reserved for deliverables that cannot be observed automatically.

### `assignment.validate_manifest`

Checks section order, missing text, duplicated links, unstable IDs and whether every requirement has provenance.

## Text presentation contract

Assignment source HTML already contains the finished visual cards. Reuse the
existing `.card-wrapper` cards for card view; do not redraw or replace them.
Article view is a separate reading surface and must preserve meaningful text
structure: headings, paragraphs, strong/highlighted phrases, callouts, lists,
links and source order.

Emphasis must be perceptible at a glance. White bold text alone is insufficient
when surrounding body text is already light; use a clearly contrasting
source-derived highlight in addition to font weight. A callout must remain a
visually separated block with padding, contrasting background and its source
accent rule rather than being flattened into a paragraph with quotation marks.

Preserve real `<ul>` and `<ol>` structures. Source paragraphs that consistently
use `•` or numbered lines separated by `<br>` should be normalized into semantic
lists in article view. Decorative card metadata does not need to be recreated.
Validate emphasis, callouts and lists visually at desktop and mobile sizes.

## Current website integration

- Day 1 page: `days/day1/assignment.html`; 4 reading sections are tracked in `ProgressStore.assignmentSections` and remain localStorage-only.
- Day 1 manual Assignment deliverables are separate from reading progress and are included in Firebase sync.
- Day 2 page: `days/day2/assignment.html`; 4 reading sections use `5dai-assignment-day2-progress` and remain localStorage-only.

## Pipeline

1. Confirm the source exists and is readable.
2. Detect encoding without rewriting the source.
3. Inventory cards, headings, paragraphs, lists and outbound links.
4. Preserve source order.
5. Separate instructions from deliverables and reference material.
6. Produce a manifest under an isolated output directory.
7. Reuse original cards and build only the semantic article text.
8. Validate completeness and text presentation against the source cards.

## Day 2 acceptance baseline

- Source filename: `5dai_assignment_d2.html`
- Expected card wrappers: 6
- Published website page: `days/day2/assignment.html`
- Reading units: 4 content sections; the cover and ending cards remain visible but are excluded from progress totals.
- Day 2 reading progress key: `5dai-assignment-day2-progress` (localStorage only).
- Replacing or republishing course content still requires an explicit user instruction.

## Hard failures

- unreadable source;
- extracted section count does not match the detected structure;
- source order changes without an explicit transformation note;
- a reading item is converted into a checkbox;
- existing source cards are redrawn or replaced by generated alternatives;
- article extraction flattens emphasis, callouts or lists;
- any source file is overwritten.
