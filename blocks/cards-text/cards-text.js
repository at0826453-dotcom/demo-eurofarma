function setupPagination(block, ul) {
  const nav = document.createElement('div');
  nav.className = 'cards-text-pagination';
  block.append(nav);

  const slides = () => [...ul.children];
  const step = () => {
    const [first, second] = slides();
    if (!first) return 1;
    if (second) return second.offsetLeft - first.offsetLeft || 1;
    return first.offsetWidth || 1;
  };
  const pageCount = () => {
    const perView = Math.max(1, Math.round((ul.clientWidth + 16) / step()));
    return Math.max(1, slides().length - perView + 1);
  };
  const current = () => Math.round(ul.scrollLeft / step());

  const update = () => {
    const active = current();
    [...nav.children].forEach((dot, i) => {
      const on = i === active;
      dot.classList.toggle('active', on);
      if (on) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const render = () => {
    const count = pageCount();
    block.classList.toggle('cards-text-scrollable', count > 1);
    if (nav.children.length !== count) {
      nav.replaceChildren(...Array.from({ length: count }, (_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'cards-text-dot';
        dot.dataset.index = i;
        dot.setAttribute('aria-label', `Ir para o card ${i + 1}`);
        return dot;
      }));
    }
    update();
  };

  nav.addEventListener('click', (e) => {
    const dot = e.target.closest('.cards-text-dot');
    if (!dot) return;
    ul.scrollTo({ left: Number(dot.dataset.index) * step(), behavior: 'smooth' });
  });

  let ticking = false;
  ul.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }, { passive: true });

  new ResizeObserver(render).observe(ul);
  render();
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const body = document.createElement('div');
    body.className = 'cards-text-body';
    // merge every authored cell into one body (authors may split title/description)
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    if (!body.textContent.trim()) return;
    const title = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (title) title.classList.add('cards-text-title');

    // group everything after the title into the scrollable description area
    const content = document.createElement('div');
    content.className = 'cards-text-content';
    [...body.childNodes].forEach((node) => {
      if (node === title) return;
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
        node.remove();
        return;
      }
      content.append(node);
    });
    if (content.childNodes.length) body.append(content);

    li.append(body);
    ul.append(li);
  });
  block.replaceChildren(ul);
  if (ul.children.length > 1) setupPagination(block, ul);
}
