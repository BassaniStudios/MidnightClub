/* MIDNIGHTCLUB — FiveM photo album
   Discovers both .jpg and .png variants, including repeated numbers. */
(() => {
  const grid = document.getElementById('fivem-album-grid');
  const status = document.getElementById('fivem-gallery-status');
  const count = document.getElementById('fivem-photo-count');
  const dialog = document.getElementById('gallery-lightbox');
  if (!grid || !dialog) return;

  const ROOT = 'https://ik.imagekit.io/bassanistudio/BOVARY%20WEBSITE/';
  const MAX_INDEX = 2000;
  const MIN_SCAN = 330;
  const EMPTY_TAIL = 45;
  const BATCH_SIZE = 8;
  const photos = [];
  const filmstrip = document.getElementById('lightbox-filmstrip');
  const mainImage = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  const counter = dialog.querySelector('.lightbox-counter');
  const closeBtn = dialog.querySelector('.lightbox-close');
  const prevBtn = dialog.querySelector('.lightbox-prev');
  const nextBtn = dialog.querySelector('.lightbox-next');
  let activeIndex = 0;
  let lastFocus = null;

  const urlFor = (number, ext) => `${ROOT}homebound%20%28${number}%29.${ext}`;
  const probe = (number, ext) => new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const finish = ok => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok ? { number, ext, url: urlFor(number, ext) } : null);
    };
    const timer = setTimeout(() => finish(false), 12000);
    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = () => finish(false);
    image.src = urlFor(number, ext);
  });

  function renderPhoto(photo, index) {
    const card = document.createElement('div');
    card.className = 'gallery-item fivem-photo-card';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'lightbox-trigger fivem-photo-trigger';
    trigger.setAttribute('aria-label', `Open FiveM meet photo ${index + 1}`);
    const img = document.createElement('img');
    img.src = `${photo.url}?tr=w-700,f-auto,q-78`;
    img.alt = `FiveM meet photo ${photo.number} (${photo.ext.toUpperCase()})`;
    img.loading = 'lazy';
    img.decoding = 'async';
    const zoom = document.createElement('span');
    zoom.className = 'gallery-zoom';
    zoom.setAttribute('aria-hidden', 'true');
    zoom.textContent = '＋';
    trigger.append(img, zoom);
    trigger.addEventListener('click', () => open(index, trigger));
    card.appendChild(trigger);
    grid.appendChild(card);
  }

  function updateCount(done = false) {
    count.textContent = done ? `${photos.length} PHOTOS` : `${photos.length} PHOTOS FOUND`;
  }

  async function discover() {
    let number = 1;
    let emptyTail = 0;
    while (number <= MAX_INDEX && (number <= MIN_SCAN || emptyTail < EMPTY_TAIL)) {
      const batch = [];
      for (let i = 0; i < BATCH_SIZE && number <= MAX_INDEX; i++, number++) batch.push(number);
      const results = await Promise.all(batch.map(async n => {
        const variants = await Promise.all([probe(n, 'jpg'), probe(n, 'png')]);
        return variants.filter(Boolean);
      }));
      let foundInBatch = 0;
      results.forEach(found => {
        found.forEach(photo => {
          photos.push(photo);
          renderPhoto(photo, photos.length - 1);
          foundInBatch++;
        });
      });
      emptyTail = foundInBatch ? 0 : emptyTail + batch.length;
      updateCount();
      if (status) {
        status.querySelector('span:last-child').textContent =
          `Scanning the album… ${Math.min(number - 1, MAX_INDEX)} file numbers checked`;
      }
    }

    updateCount(true);
    if (status) {
      status.classList.add('is-complete');
      status.innerHTML = photos.length
        ? `<span class="album-check" aria-hidden="true">✓</span><span>Album ready · ${photos.length} photos available</span>`
        : '<span>No photos could be found. Please check the ImageKit album access and file names.</span>';
    }
  }

  function buildFilmstrip() {
    filmstrip.replaceChildren();
    photos.forEach((photo, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filmstrip-thumb';
      button.setAttribute('aria-label', `Preview photo ${index + 1}`);
      const img = document.createElement('img');
      img.src = `${photo.url}?tr=w-180,h-110,c-at_max,f-auto,q-65`;
      img.alt = '';
      img.loading = 'lazy';
      button.appendChild(img);
      button.addEventListener('click', () => show(index));
      filmstrip.appendChild(button);
    });
  }

  function show(index) {
    if (!photos.length) return;
    activeIndex = (index + photos.length) % photos.length;
    const photo = photos[activeIndex];
    mainImage.src = photo.url;
    mainImage.alt = `FiveM meet photo ${photo.number}`;
    caption.textContent = `FIVEM MEETS · PHOTO ${photo.number}`;
    counter.textContent = `${activeIndex + 1} / ${photos.length}`;
    filmstrip.querySelectorAll('.filmstrip-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === activeIndex);
      if (i === activeIndex) thumb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
  }

  function open(index, trigger) {
    lastFocus = trigger || document.activeElement;
    if (!filmstrip.childElementCount) buildFilmstrip();
    show(index);
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function close() {
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    mainImage.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(activeIndex - 1));
  nextBtn.addEventListener('click', () => show(activeIndex + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  document.addEventListener('keydown', event => {
    if (!dialog.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') show(activeIndex - 1);
    else if (event.key === 'ArrowRight') show(activeIndex + 1);
  });

  if (window.location.hash.toLowerCase() === '#fivem') {
    const fivemTab = document.getElementById('tab-fivem');
    if (fivemTab) fivemTab.click();
  }

  discover().catch(error => {
    console.error('FiveM album discovery failed:', error);
    if (status) status.textContent = 'Unable to load the photo album. Please try again later.';
  });
})();
