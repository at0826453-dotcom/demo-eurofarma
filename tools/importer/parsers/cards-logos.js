/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-logos.
 * Source: .cmp-partner-container__logos with one .cmp-image per partner logo.
 * Table: one row per logo -> logo image (no text).
 */
export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.cmp-image img').forEach((img) => {
    if (!img.getAttribute('src')) return;
    cells.push([img]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-logos', cells });
  element.replaceWith(block);
}
