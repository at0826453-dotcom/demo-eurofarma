// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

const SECTION_CLASSES = ['brand', 'tools', 'locale'];

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  const paths = ['/content/nav.plain.html', '/nav.plain.html'];
  // eslint-disable-next-line no-restricted-syntax
  for (const path of paths) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(path);
    // eslint-disable-next-line no-await-in-loop
    if (resp.ok) return { html: await resp.text(), base: new URL(path, window.location).href };
  }
  return null;
}

/**
 * Resolves relative image paths against the fragment URL so they work on any page.
 * @param {Element} root fragment root
 * @param {string} base fragment URL
 */
function rebaseImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
  });
}

/**
 * Closes every open dropdown in the nav.
 * @param {Element} nav nav element
 * @param {Element} [except] dropdown trigger to keep open
 */
function closeDropdowns(nav, except) {
  nav.querySelectorAll('.nav-drop > button[aria-expanded="true"]').forEach((button) => {
    if (button !== except) button.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Turns list items with a nested list into click-toggled dropdowns.
 * The item's own content (text, icons) becomes the trigger button.
 * @param {Element} section nav section
 * @param {Element} nav nav element
 */
function decorateDropdowns(section, nav) {
  section.querySelectorAll(':scope li').forEach((item) => {
    const subList = item.querySelector(':scope > ul');
    if (!subList) return;
    item.classList.add('nav-drop');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    [...item.childNodes].forEach((node) => {
      if (node === subList) return;
      if (node.nodeName === 'P') button.append(...node.childNodes);
      else button.append(node);
    });
    [...item.childNodes].filter((node) => node !== subList).forEach((node) => node.remove());
    button.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    const label = document.createElement('span');
    label.className = 'nav-drop-label';
    [...button.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => {
      label.append(node.textContent.trim());
      node.remove();
    });
    button.append(label);
    button.setAttribute('aria-label', label.textContent);
    item.prepend(button);
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = button.getAttribute('aria-expanded') === 'true';
      closeDropdowns(nav, button);
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = fragment.html;
  rebaseImages(nav, fragment.base);

  [...nav.children].forEach((section, i) => {
    section.classList.add(`nav-${SECTION_CLASSES[i] || `section-${i + 1}`}`);
    decorateDropdowns(section, nav);
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeDropdowns(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop > button[aria-expanded="true"]');
    if (open) {
      closeDropdowns(nav);
      open.focus();
    }
  });
  isDesktop.addEventListener('change', () => closeDropdowns(nav));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
