/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-coverflow.
 * Source: .cmp-products-carousel (Swiper, loop mode). Swiper clones slides as
 * .swiper-slide-duplicate; only the unique slides are kept.
 * Table: one row per slide -> image | title heading + description.
 */
export default function parse(element, { document }) {
  const cells = [];
  const slides = element.querySelectorAll('.swiper-wrapper > .swiper-slide:not(.swiper-slide-duplicate)');

  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    const text = [];
    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent.trim()) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      text.push(h2);
    }
    slide.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) text.push(p);
    });
    slide.querySelectorAll('a[href]').forEach((a) => {
      if (!a.textContent.trim() || a.contains(img)) return;
      const p = document.createElement('p');
      p.append(a);
      text.push(p);
    });
    if (!img && !text.length) return;
    cells.push([img || '', text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-coverflow', cells });
  element.replaceWith(block);
}
