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

## Pipeline

1. Confirm the source exists and is readable.
2. Detect encoding without rewriting the source.
3. Inventory cards, headings, paragraphs, lists and outbound links.
4. Preserve source order.
5. Separate instructions from deliverables and reference material.
6. Produce a manifest under an isolated output directory.
7. Validate completeness against source card count.

## Day 2 acceptance baseline

- Source filename: `5dai_assignment_d2.html`
- Expected card wrappers: 6
- No website output is authorized in the current task.

## Hard failures

- unreadable source;
- extracted section count does not match the detected structure;
- source order changes without an explicit transformation note;
- a reading item is converted into a checkbox;
- any source file is overwritten.

