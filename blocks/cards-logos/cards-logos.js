import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    // a row may hold one or several logo cells
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (!picture) return;
      const li = document.createElement('li');
      li.className = 'cards-logos-logo';
      const link = cell.querySelector('a');
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        if (link.title) a.title = link.title;
        a.append(picture);
        li.append(a);
      } else {
        li.append(picture);
      }
      ul.append(li);
    });
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }])));
  block.replaceChildren(ul);
}
