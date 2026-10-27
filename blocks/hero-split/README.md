# hero-split

Custom **hero** block. Purpose: Top banner with a text column (eyebrow, heading, description, CTAs) beside a foreground device image, over an optional full-bleed background image.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1 (optional): background image only; row 2: eyebrow paragraph, heading, description, CTA link(s), plus an optional side image in the same cell or a second cell.

## Styling behaviour

- A paragraph before the heading becomes the eyebrow (accent bar) and adds `has-eyebrow` to the block (large hero layout). Without an eyebrow the block renders as the compact banner layout (490px tall, centered CTA, light heading).
- CTA classes are set by order unless the link already has `primary`, `secondary` or `accent`: a single CTA gets `accent`; with several, the first gets `primary` and the rest `secondary`.
- The side image is hidden below 900px, as on the source site.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
