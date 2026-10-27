/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for euronpro.com (AEM Sites / Core Components).
 * Removes global chrome, widgets, tracking and carousel/accordion UI chrome.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global header, sidebar off-canvas navigation, and all footer fragments
    // (including the footer XF nested inside the contact section wrapper).
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--sidebar-navigation',
      '#menuWrapper',
      '.pc-contactContainer__contactWrapper--contact footer.experiencefragment',
      '.pc-contactContainer__contactWrapper--contact .cmp-experiencefragment--footer',
      'footer.experiencefragment',
      '.cmp-experiencefragment--footer',
      'div.access-control',
      'div.pwa-install',
    ]);

    // Remove the now-empty experiencefragment wrapper that held the sidebar
    element.querySelectorAll('div.experiencefragment').forEach((el) => {
      if (!el.querySelector('img, p, h1, h2, h3, h4, h5, h6, a')) el.remove();
    });

    // Tracking pixels
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/clarity\.ms|googleadservices|google\.com\/pagead/i.test(src)) {
        img.remove();
      }
    });

    // Swiper UI chrome, accordion icons, screen-reader "opens in a new tab"
    WebImporter.DOMUtils.remove(element, [
      '.swiper-pagination',
      '.swiper-slide-shadow-left',
      '.swiper-slide-shadow-right',
      'button.arrow',
      'span.cmp-accordion__icon',
      'span.cmp-link__screen-reader-only',
    ]);
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'link',
      'script',
      'style',
      'meta',
      'noscript',
      'iframe',
    ]);

    // Drop CSS backgrounds copied inline by the importer: the hero-split parser
    // already captured the meaningful ones; the rest (FAQ curve, contact pattern)
    // are decorative and would otherwise become content images.
    element.querySelectorAll('[style]').forEach((el) => {
      el.style.removeProperty('background-image');
      el.style.removeProperty('background');
    });

    // Empty headings (e.g. &nbsp; spacers in rich text)
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (!h.textContent.replace(/ /g, ' ').trim() && !h.querySelector('img')) h.remove();
    });

    // Strip tracking / data-layer attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-cmp-') || attr.name === 'data-track' || attr.name.startsWith('data-analytics')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
