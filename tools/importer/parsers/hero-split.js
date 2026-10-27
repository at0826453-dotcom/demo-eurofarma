/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-split.
 * Shapes:
 *  (a) .pc-heroContent__upperContent - background image is the direct child img
 *      of the parent .pc-heroContent; text in .pc-heroContent__textColumn;
 *      side image is img.pc-heroContent__imageWrapper--bannerDesktop.
 *  (b) .pc-subscriptionContainer - background is its direct child img; headline
 *      + CTA in .pc-subscriptionContainer__descriptionContainer; side image in
 *      .pc-subscriptionContainer__image img.
 * Table: row 1 background image; row 2 eyebrow, heading, description,
 * CTA link(s) and the side image.
 */

// On the live site these backgrounds are CSS backgrounds from the
// loggedOutHome clientlib (the scraper materialises them as a direct child
// <img>). Static-HTML import runs have no CSS, so fall back to the known asset.
const CLIENTLIB = 'https://www.euronpro.com/etc.clientlibs/euronpro/clientlibs/clientlib-loggedOutHome/resources/';
const HERO_BG = `${CLIENTLIB}hero-content-background.png`;
const SUBSCRIPTION_BG = `${CLIENTLIB}fingerprint.jpg`;

function makeImg(document, src) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  return img;
}

function findBackground(document, container, fallbackUrl) {
  if (!container) return null;
  const direct = container.querySelector(':scope > img');
  if (direct) return direct;
  const view = document.defaultView || (typeof window !== 'undefined' ? window : null);
  const candidates = [container, ...container.querySelectorAll(':scope > *')];
  for (const el of candidates) {
    const styles = [el.style && el.style.backgroundImage];
    if (view && view.getComputedStyle) {
      try {
        styles.push(view.getComputedStyle(el).backgroundImage);
        styles.push(view.getComputedStyle(el, '::before').backgroundImage);
      } catch (e) { /* ignore */ }
    }
    for (const bg of styles) {
      const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (m) return makeImg(document, m[1]);
    }
  }
  return fallbackUrl ? makeImg(document, fallbackUrl) : null;
}

function buildCta(document, a) {
  if (!a) return null;
  const label = a.querySelector('.cmp-button__text');
  const text = (label ? label.textContent : a.textContent).trim();
  if (!text) return null;
  const link = document.createElement('a');
  link.href = a.getAttribute('href') || '#';
  link.textContent = text;
  const p = document.createElement('p');
  p.append(link);
  return p;
}

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function copyAs(document, tag, source) {
  const el = document.createElement(tag);
  el.innerHTML = source.innerHTML;
  return el;
}

export default function parse(element, { document }) {
  const cells = [];
  const content = [];
  let background = null;
  let sideImage = null;

  if (element.classList.contains('pc-subscriptionContainer')) {
    // shape (b)
    background = findBackground(document, element, SUBSCRIPTION_BG);
    const desc = element.querySelector('.pc-subscriptionContainer__descriptionContainer');
    if (desc) {
      const headline = desc.querySelector('p');
      if (headline && textOf(headline)) content.push(copyAs(document, 'h2', headline));
      desc.querySelectorAll('a').forEach((a) => {
        const cta = buildCta(document, a);
        if (cta) content.push(cta);
      });
    }
    sideImage = element.querySelector('.pc-subscriptionContainer__image img');
  } else {
    // shape (a)
    const hero = element.closest('.pc-heroContent');
    background = findBackground(document, hero, HERO_BG);
    const textCol = element.querySelector('.pc-heroContent__textColumn') || element;

    const eyebrow = textCol.querySelector('.pc-heroContent__textColumn--title p');
    if (eyebrow && textOf(eyebrow)) content.push(copyAs(document, 'p', eyebrow));
    const title = textCol.querySelector('.pc-heroContent__textColumn--subTitle p');
    if (title && textOf(title)) content.push(copyAs(document, 'h1', title));
    const description = textCol.querySelector('.pc-heroContent__textColumn--description p');
    if (description && textOf(description)) content.push(copyAs(document, 'p', description));
    textCol.querySelectorAll('.pc-heroContent__buttonWrapper a').forEach((a) => {
      const cta = buildCta(document, a);
      if (cta) content.push(cta);
    });
    sideImage = element.querySelector('img.pc-heroContent__imageWrapper--bannerDesktop');
  }

  if (background) cells.push([background]);
  if (sideImage) content.push(sideImage);
  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
