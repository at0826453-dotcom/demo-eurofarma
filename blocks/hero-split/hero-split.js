import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  const pics = el.querySelectorAll('picture');
  return pics.length > 0 && el.textContent.trim() === '';
}

function optimize(picture, eager, breakpoints) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  const optimized = createOptimizedPicture(img.src, img.alt, eager, breakpoints);
  picture.replaceWith(optimized);
  return optimized;
}

export default function decorate(block) {
  const rows = [...block.children];
  const background = document.createElement('div');
  background.className = 'hero-split-background';
  const content = document.createElement('div');
  content.className = 'hero-split-content';
  const text = document.createElement('div');
  text.className = 'hero-split-text';
  const media = document.createElement('div');
  media.className = 'hero-split-media';

  rows.forEach((row, index) => {
    // first picture-only row is the background image
    if (index === 0 && rows.length > 1 && isPictureOnly(row)) {
      const pic = row.querySelector('picture');
      if (pic) background.append(pic);
      return;
    }
    [...row.children].forEach((cell) => {
      if (isPictureOnly(cell)) {
        media.append(...cell.querySelectorAll('picture'));
        return;
      }
      // pictures mixed with text: pull them out as the side image
      cell.querySelectorAll('picture').forEach((pic) => {
        const parent = pic.parentElement;
        media.append(pic);
        if (parent && parent !== cell && parent.tagName === 'P' && !parent.textContent.trim() && !parent.children.length) parent.remove();
      });
      text.append(...cell.childNodes);
    });
  });

  // eyebrow: a paragraph placed before the first heading
  const heading = text.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P') {
        prev.classList.add('hero-split-eyebrow');
        block.classList.add('has-eyebrow');
      }
      prev = prev.previousElementSibling;
    }
  }

  // group CTA paragraphs
  const ctaParas = [...text.querySelectorAll(':scope > p')].filter((p) => {
    const links = p.querySelectorAll('a');
    return links.length > 0 && p.textContent.trim() === [...links].map((a) => a.textContent).join('').trim();
  });
  if (ctaParas.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-split-actions';
    ctaParas[0].before(actions);
    const links = ctaParas.flatMap((p) => [...p.querySelectorAll('a')]);
    const styles = ['primary', 'secondary', 'accent'];
    links.forEach((a, i) => {
      a.classList.add('button');
      if (styles.some((s) => a.classList.contains(s))) return;
      // single CTA: dark "accent" button; several: filled primary, then outlined secondary
      if (links.length === 1) a.classList.add('accent');
      else a.classList.add(i === 0 ? 'primary' : 'secondary');
    });
    actions.append(...ctaParas);
  }

  block.replaceChildren();
  if (background.querySelector('picture')) {
    optimize(background.querySelector('picture'), true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
    block.append(background);
    block.classList.add('has-background');
  }
  content.append(text);
  if (media.querySelector('picture')) {
    media.querySelectorAll('picture').forEach((pic) => optimize(pic, false, [{ width: '900' }]));
    content.append(media);
    block.classList.add('has-media');
  }
  block.append(content);
}
