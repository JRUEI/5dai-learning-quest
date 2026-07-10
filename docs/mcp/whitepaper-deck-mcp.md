# Whitepaper Deck MCP

## Purpose

Inspect a course Whitepaper PDF, inventory all visual material and prepare a detailed HTML-deck plan. This module does not publish the PDF or update the website by itself.

## MCP namespace

`whitepaper`

## Proposed tools

### `whitepaper.inspect_pdf`

Returns:

- readability and encryption status;
- page count;
- extractable text statistics;
- page dimensions;
- per-page image/vector/text inventory;
- likely figure, table, code and scheme pages.

### `whitepaper.inventory_visuals`

Classifies visual regions as:

- scheme/architecture diagram;
- chart;
- table;
- code example;
- decorative image;
- callout or applied tip.

Each record must include page number and a conservative bounding box.

### `whitepaper.extract_complete_visual`

Extracts the visual region rather than the full PDF page. Bounding boxes must include every label, arrow, legend, axis, annotation and enclosing boundary belonging to the visual.

The tool must render a preview and fail validation if any scheme element touches or crosses the crop edge.

### `whitepaper.build_deck_plan`

Returns a slide plan only:

```json
{
  "day": 2,
  "source": "Day_2.pdf",
  "slides": [
    {
      "stable_id": "d2-whitepaper-01",
      "title": "...",
      "summary": "...",
      "takeaway": "...",
      "source_pages": [1],
      "visual_ids": []
    }
  ]
}
```

### `whitepaper.validate_deck_plan`

Checks topic coverage, source-page provenance, figure completeness, slide order and whether summaries are detailed enough to stand alone.

## Pipeline

1. Verify PDF readability and page count.
2. Extract text for indexing, not as a substitute for visual review.
3. Render every page for visual inventory.
4. Identify figures, schemes, charts, tables and code examples.
5. Extract complete visual regions with safe margins.
6. Build a detailed slide plan tied to source pages.
7. Render candidate deck pages and verify desktop/mobile legibility.
8. Stop before website mutation unless publishing is separately authorized.

## Day 2 acceptance baseline

- Source filename: `Day_2.pdf`
- Expected pages: 49
- PDF is unencrypted and has extractable text.
- No full-page PDF publication and no Day 2 website generation are authorized in the current task.

## Hard failures

- unreadable or encrypted source;
- missing page provenance;
- a scheme, table or chart is clipped;
- a full PDF page is used when a complete visual-region extraction is possible;
- full PDF publication;
- source PDF modification.

