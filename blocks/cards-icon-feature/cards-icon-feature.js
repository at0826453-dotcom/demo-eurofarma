import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture, .icon') && div.textContent.trim() === '') div.className = 'cards-icon-feature-icon';
      else div.className = 'cards-icon-feature-body';
    });
    if (li.textContent.trim() || li.querySelector('picture, .icon')) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }])));
  block.replaceChildren(ul);
}
