export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const label = cells[0];
    if (!label || !label.textContent.trim()) {
      row.remove();
      return;
    }
    const summary = document.createElement('summary');
    summary.className = 'accordion-divided-item-label';
    summary.append(...label.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-divided-item-body';
    cells.slice(1).forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-divided-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
