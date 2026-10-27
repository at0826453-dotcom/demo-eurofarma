/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-divided.
 * Source: .cmp-faq-container .cmp-accordion with one .cmp-accordion__item per Q&A.
 * Table: one row per item -> question (.cmp-accordion__title) | answer (.cmp-accordion__panel content).
 */
export default function parse(element, { document }) {
  const cells = [];
  const items = element.querySelectorAll(':scope > .cmp-accordion__item');

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title') || item.querySelector('.cmp-accordion__button');
    const question = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const panel = item.querySelector('.cmp-accordion__panel');

    let answer = [];
    if (panel) {
      answer = [...panel.querySelectorAll('p, ul, ol, h1, h2, h3, h4, h5, h6, table, img')]
        .filter((el) => !el.parentElement.closest('p, ul, ol, table'))
        .filter((el) => el.tagName === 'IMG' || el.textContent.trim());
      if (!answer.length && panel.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = panel.textContent.replace(/\s+/g, ' ').trim();
        answer = [p];
      }
    }
    if (!question && !answer.length) return;
    cells.push([question, answer]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-divided', cells });
  element.replaceWith(block);
}
