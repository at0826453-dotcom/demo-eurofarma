import { createOptimizedPicture } from '../../scripts/aem.js';

let carouselId = 0;

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.carousel-coverflow-slide')];
  const count = slides.length;
  if (!count) return;
  const active = ((index % count) + count) % count;
  block.dataset.activeSlide = active;

  slides.forEach((slide, i) => {
    let offset = i - active;
    // shortest circular distance so neighbours wrap around
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    slide.dataset.offset = offset;
    slide.classList.toggle('is-active', offset === 0);
    slide.classList.toggle('is-prev', offset === -1);
    slide.classList.toggle('is-next', offset === 1);
    slide.classList.toggle('is-hidden', Math.abs(offset) > 1);
    slide.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
    slide.querySelectorAll('a, button, input, select, textarea').forEach((el) => {
      if (offset === 0) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-coverflow-indicator button').forEach((btn, i) => {
    if (i === active) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function bindEvents(block) {
  const go = (delta) => setActive(block, Number(block.dataset.activeSlide || 0) + delta);
  block.querySelector('.carousel-coverflow-prev')?.addEventListener('click', () => go(-1));
  block.querySelector('.carousel-coverflow-next')?.addEventListener('click', () => go(1));
  block.querySelectorAll('.carousel-coverflow-indicator button').forEach((btn, i) => {
    btn.addEventListener('click', () => setActive(block, i));
  });
  block.querySelectorAll('.carousel-coverflow-slide').forEach((slide) => {
    slide.addEventListener('click', () => {
      const offset = Number(slide.dataset.offset || 0);
      if (offset !== 0) go(offset);
    });
  });
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // basic swipe support
  let startX = null;
  const track = block.querySelector('.carousel-coverflow-slides');
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX = null;
  });
}

function createSlide(row, index, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-coverflow-slide';
  slide.dataset.slideIndex = index;
  slide.id = `carousel-coverflow-${id}-slide-${index}`;

  [...row.children].forEach((cell) => {
    if (cell.querySelector('picture') && cell.textContent.trim() === '') {
      cell.className = 'carousel-coverflow-slide-image';
    } else {
      cell.className = 'carousel-coverflow-slide-content';
    }
    slide.append(cell);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading?.id) slide.setAttribute('aria-labelledby', heading.id);
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture'));
  const isSingle = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.setAttribute('tabindex', '0');

  const container = document.createElement('div');
  container.className = 'carousel-coverflow-slides-container';
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-coverflow-slides';
  container.append(slidesWrapper);

  let indicators;
  if (!isSingle) {
    const nav = document.createElement('div');
    nav.className = 'carousel-coverflow-navigation-buttons';
    nav.innerHTML = `
      <button type="button" class="carousel-coverflow-prev" aria-label="Previous slide"></button>
      <button type="button" class="carousel-coverflow-next" aria-label="Next slide"></button>
    `;
    container.append(nav);

    const indicatorsNav = document.createElement('nav');
    indicatorsNav.setAttribute('aria-label', 'Carousel slide controls');
    indicators = document.createElement('ol');
    indicators.className = 'carousel-coverflow-indicators';
    indicatorsNav.append(indicators);
    block.dataset.hasIndicators = 'true';
    block.append(container, indicatorsNav);
  } else {
    block.append(container);
  }

  rows.forEach((row, i) => {
    slidesWrapper.append(createSlide(row, i, id));
    if (indicators) {
      const li = document.createElement('li');
      li.className = 'carousel-coverflow-indicator';
      li.innerHTML = `<button type="button" aria-label="Show slide ${i + 1} of ${rows.length}"></button>`;
      indicators.append(li);
    }
    row.remove();
  });

  slidesWrapper.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }])));

  // start on the first slide (source behaviour); neighbours wrap around
  setActive(block, 0);
  if (!isSingle) bindEvents(block);
}
