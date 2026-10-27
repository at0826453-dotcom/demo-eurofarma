/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-feature.
 * Source: .pc-heroContent__heroBulletWrapper with one
 * .pc-heroContent__heroBulletWrapper--heroBullet per feature.
 * Table: one row per feature -> icon image | text.
 */
export default function parse(element, { document }) {
  const cells = [];
  const items = element.querySelectorAll('.pc-heroContent__heroBulletWrapper--heroBullet');

  items.forEach((item) => {
    const icon = item.querySelector('.cmp-hero-bullet__icon img') || item.querySelector('img');
    const text = [...item.querySelectorAll('.cmp-richText p')].filter((p) => p.textContent.trim());
    if (!icon && !text.length) return;
    cells.push([icon || '', text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-feature', cells });
  element.replaceWith(block);
}
