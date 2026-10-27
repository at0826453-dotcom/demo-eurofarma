/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-text.
 * Source: .cmp-carousel-cards__wrapper (Swiper) with one .cmp-card-item per card.
 * Table (cards "no images" shape): one single-cell row per card -> h3 title + description.
 */
export default function parse(element, { document }) {
  const cells = [];
  const cards = element.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate) .cmp-card-item');

  cards.forEach((card) => {
    const content = [];
    const title = card.querySelector('.cmp-card-item__header h3');
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      content.push(h3);
    }
    // h4 subtitle is empty on the source; keep it only when it has text
    const subtitle = card.querySelector('.cmp-card-item__header h4');
    if (subtitle && subtitle.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = subtitle.textContent.trim();
      content.push(p);
    }
    card.querySelectorAll('.cmp-card-item__content').forEach((desc) => {
      const text = desc.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      const p = document.createElement('p');
      p.innerHTML = desc.innerHTML.trim();
      content.push(p);
    });
    if (content.length) cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-text', cells });
  element.replaceWith(block);
}
