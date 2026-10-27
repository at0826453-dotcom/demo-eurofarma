/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for euronpro.com.
 * Inserts <hr> section breaks between template sections and a
 * Section Metadata block for sections with a style.
 */
const MARKER = 'data-excat-section-id';

function findSection(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (!el) continue;
      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute('data-excat-first', 'true');
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const anchor = findSection(element, section);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // Place metadata at the end of the section: before the next section's <hr>
      // if found, otherwise after the surviving section element.
      let placed = false;
      if (marker) {
        let next = marker.nextElementSibling;
        while (next && next.tagName !== 'HR') next = next.nextElementSibling;
        if (next) {
          next.parentNode.insertBefore(metadata, next);
        } else if (anchor && anchor.parentNode) {
          anchor.after(metadata);
        } else {
          marker.parentNode.appendChild(metadata);
        }
        placed = true;
      }
      if (!placed && anchor && anchor.parentNode) anchor.after(metadata);
    }

    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    element.querySelectorAll('hr[data-excat-first]').forEach((hr) => hr.remove());
  }
}
