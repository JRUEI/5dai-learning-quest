# Whitepaper Deck MCP

## Purpose

Inspect a course Whitepaper PDF, inventory all visual material and prepare a detailed HTML-deck plan. This module does not publish the PDF or update the website by itself.

The visible website label is always `Whitepaper`. Do not replace it with `核心教材導讀`, `白皮書簡報`, or another invented label. Internal filenames and namespaces may continue to use `whitepaper`.

## Current website integration

- Day 1 page: `days/day1/whitepaper.html`; 32 reading pages use `ProgressStore.whitepaperSlide` and synchronize after Google sign-in.
- Day 2 page: `days/day2/whitepaper.html`; 18 reading pages use `5dai-day2-whitepaper-slide` offline and synchronize after Google sign-in.
- Extracted visual assets live under `assets/whitepaper/` and `assets/whitepaper/day2/`; never substitute a full PDF page when a complete figure region can be extracted.

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

## Deck visual design standards

Whitepaper pages are presentation slides, not article pages placed inside a slide-shaped frame. Every implementation and review must preserve a clear presentation hierarchy.

### Titles

- Keep titles restrained. A title identifies the idea; it must not dominate half the slide merely because space is available.
- Prefer one or two lines on desktop. Rewrite an unnecessarily long title before increasing its size or allowing awkward multi-line wrapping.
- Make the diagram, chart or teaching point the visual focus of a content slide.

### Body copy

- Use concise, presentation-length explanations rather than dense article paragraphs.
- Body text must have strong contrast against the background. Do not use pale or low-opacity text that becomes difficult to read on ordinary displays.
- Use a readable weight and line height. Do not rely on thin type or color alone to create hierarchy.

### Labels and section markers

- Kickers, topic names and other labels must look intentional and be immediately scannable.
- Use a high-contrast badge, pill or similarly prominent treatment instead of small, faint colored text floating above the title.
- Preserve the slide number and topic identity, but do not let metadata compete with the main title.

### Takeaways and emphasis

- A colored vertical rule by itself is not sufficient emphasis.
- Present the main takeaway as a distinct callout with a visible background or boundary, adequate padding and an explicit label such as `重點`.
- Keep the takeaway to one concise claim. Do not repeat the full body paragraph inside the callout.

### Visual slides

- Use a visual-first composition: the complete figure should receive roughly two thirds of the available content width on desktop, with a short explanation beside it.
- Place the title across the top when doing so gives the figure more useful space.
- Do not shrink a detailed figure to accommodate an oversized title or long paragraph. Labels inside the figure must remain readable at the initial desktop view, even when zoom is available.
- Avoid large accidental empty areas caused by undersized figures, overly narrow columns or vertically centered article content.
- Size the slide against the usable viewport height after accounting for fixed navigation and outer spacing. Do not combine a rigid minimum slide height with reserved navigation space in a way that creates a scrollbar at 100% browser zoom.
- At standard desktop sizes, a slide whose content fits must occupy one viewport without an unnecessary vertical scrollbar. Preserve scrolling only when content genuinely cannot fit, especially on short mobile screens; never hide overflow and clip course content.
- On mobile, stack content in a deliberate reading order and verify that no grid area, caption, callout or navigation control creates horizontal overflow.

### Required visual QA

For at least one visual slide and one text-only slide, verify all of the following at desktop and mobile widths:

- title wrapping is intentional;
- body text contrast and weight are readable;
- labels are visibly distinct from body text;
- takeaway styling creates a clear emphasis point;
- the primary figure is large enough to inspect;
- there are no unintended implicit grid columns or rows;
- there is no horizontal overflow;
- there is no unnecessary vertical scrollbar at 100% browser zoom on standard desktop viewports.

## Pipeline

1. Verify PDF readability and page count.
2. Extract text for indexing, not as a substitute for visual review.
3. Render every page for visual inventory.
4. Identify figures, schemes, charts, tables and code examples.
5. Extract complete visual regions with safe margins.
6. Build a detailed slide plan tied to source pages.
7. Apply the deck visual design standards above.
8. Render candidate visual and text-only deck pages and verify desktop/mobile legibility.
9. Inspect computed layout or rendered output for unintended grid tracks and undersized figures.
10. Stop before website mutation unless publishing is separately authorized.

## Day 2 acceptance baseline

- Source filename: `Day_2.pdf`
- Expected pages: 49
- PDF is unencrypted and has extractable text.
- Published website page: `days/day2/whitepaper.html`
- Current website deck: 18 summarized reading pages with extracted visual regions.
- Day 2 resume key: `5dai-day2-whitepaper-slide` (offline cache plus Firebase sync after sign-in).
- No full-page PDF publication is authorized; future deck replacement still requires explicit user instruction.

## Hard failures

- unreadable or encrypted source;
- missing page provenance;
- a scheme, table or chart is clipped;
- a full PDF page is used when a complete visual-region extraction is possible;
- presentation content is laid out like a dense article page;
- an oversized title forces the primary visual into a small secondary role;
- low-contrast body copy or faint labels reduce readability;
- a takeaway is indicated only by a subtle line and lacks a clear emphasis treatment;
- a detailed figure is unreadably small in the initial desktop view;
- an unintended grid track compresses or displaces slide content;
- desktop or mobile rendering has horizontal overflow;
- a standard desktop viewport shows a vertical scrollbar even though the slide content fits;
- overflow is hidden in a way that clips course content on a short viewport;
- full PDF publication;
- source PDF modification.
