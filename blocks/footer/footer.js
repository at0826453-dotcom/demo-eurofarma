const SECTION_CLASSES = ['brand', 'nav', 'legal', 'copyright'];

/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  let path = '/content/footer.plain.html';
  let resp = await fetch(path);
  if (!resp.ok) {
    path = '/footer.plain.html';
    resp = await fetch(path);
  }
  if (!resp.ok) return null;
  return { html: await resp.text(), base: new URL(path, window.location).href };
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
 * Icon-only external links (e.g. social profiles) open in a new tab and keep an accessible name.
 * @param {Element} root fragment root
 */
function decorateIconLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const img = a.querySelector('img');
    if (!img || a.textContent.trim()) return;
    a.classList.add('footer-icon-link');
    if (new URL(a.href, window.location).origin !== window.location.origin) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    if (img.alt) a.setAttribute('aria-label', img.alt);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  footer.className = 'footer-content';
  footer.innerHTML = fragment.html;
  rebaseImages(footer, fragment.base);
  decorateIconLinks(footer);

  [...footer.children].forEach((section, i) => {
    section.classList.add(`footer-${SECTION_CLASSES[i] || `section-${i + 1}`}`);
  });

  block.append(footer);
}
