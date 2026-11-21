/* MidnightClub — main.js */

// ========== BOOT LOADER ==========
(function () {
  const loader = document.getElementById('boot-loader');
  if (!loader) return;

  const hide = () => {
    loader.classList.add('hidden');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 900);
  };

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    setTimeout(hide, 250);
  };

  if (document.readyState === 'complete') finish();
  else {
    window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 2200);
  }
})();

// ========== MOBILE NAVIGATION ==========
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  if (!nav.id) nav.id = 'site-nav';
  nav.querySelectorAll('a').forEach(link => {
    if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  menuToggle.setAttribute('aria-controls', nav.id);
  menuToggle.setAttribute('aria-expanded', 'false');

  const closeMenu = () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    menuToggle.textContent = '☰';
  };
  const openMenu = () => {
    nav.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
    menuToggle.textContent = '✕';
  };

  menuToggle.addEventListener('click', () => {
    menuToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (menuToggle.getAttribute('aria-expanded') === 'true' && !nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });
}

// Dynamic year
 document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// ========== PAGE TRANSITIONS ==========
// A short fade for same-site navigation. External links and modified clicks are untouched.
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.hash) return;
    if (destination.pathname === window.location.pathname && !destination.hash) return;

    event.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = destination.href; }, 160);
  });
});


// ========== GALLERY TABS ==========
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('keydown', event => {
    const tabs = Array.from(document.querySelectorAll('.gallery-tab'));
    const current = tabs.indexOf(tab);
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.gallery-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.gallery-section').forEach(section => section.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const section = document.getElementById('gallery-' + target);
    if (section) section.classList.add('active');
  });
});

/* ========== MUSIC PLAYER ========== */
const TRACKS = [
  {
    title: "Se Me Nota (Agarrame)",
    artist: "Chimbala x Omega",
    src: "https://ik.imagekit.io/MidnightClub/WEBSITE%20MIDNIGHT/musics/Chimbala%20x%20Omega%20-%20Se%20Me%20Nota%20-%20(Agarrame)%20-%20(Video%20Oficial)%20-%20ChimbalaHD.mp3"
  },
  {
    title: "I'm About",
    artist: "Chemical Surf feat. Malker",
    src: "https://ik.imagekit.io/MidnightClub/WEBSITE%20MIDNIGHT/musics/Chemical%20Surf%20feat.%20Malker%20-%20I'm%20About%20-%20Chemical%20Surf.mp3?updatedAt=1795139575383"
  }
];

const playerEl = document.getElementById('music-player');
const audio = document.getElementById('audio-el');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressWrap = document.getElementById('progress-wrap');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const trackNameEl = document.getElementById('track-name');
const trackArtistEl = document.getElementById('track-artist');
const volumeSlider = document.getElementById('volume-slider');
const playerToggle = document.getElementById('player-toggle');
const playerEmpty = document.getElementById('player-empty');
const playerBodyContent = document.getElementById('player-body-content');
const playerStatus = document.getElementById('player-status');

let currentTrack = 0;
let isPlaying = false;


function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return minutes + ':' + (remainder < 10 ? '0' : '') + remainder;
}


function setPlayerStatus(message) {
  if (playerStatus) playerStatus.textContent = message;
}


function setPlayButton(playing) {
  isPlaying = playing;
  if (!playBtn) return;
  playBtn.textContent = playing ? '❚❚' : '▶';
  playBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  playBtn.setAttribute('title', playing ? 'Pause music' : 'Play music');
}


function loadTrack(index) {
  if (!TRACKS.length || !audio) return;
  currentTrack = (index + TRACKS.length) % TRACKS.length;
  const track = TRACKS[currentTrack];
  audio.src = track.src;
  audio.load();
  if (trackNameEl) trackNameEl.textContent = track.title;
  if (trackArtistEl) trackArtistEl.textContent = track.artist || 'MidnightClub';
  if (progressBar) progressBar.style.width = '0%';
  if (progressWrap) { progressWrap.setAttribute('aria-valuenow', '0'); progressWrap.setAttribute('aria-valuemax', '0'); progressWrap.setAttribute('aria-valuetext', '0:00'); }
  if (currentTimeEl) currentTimeEl.textContent = '0:00';
  if (durationEl) durationEl.textContent = '0:00';
  setPlayerStatus('Track ready. Press play to listen.');
}


async function playTrack() {
  if (!TRACKS.length || !audio) return;
  setPlayerStatus('Loading audio…');
  try {
    await audio.play();
    setPlayButton(true);
    setPlayerStatus('Now playing: ' + TRACKS[currentTrack].title);
  } catch (error) {
    setPlayButton(false);
    setPlayerStatus('Playback could not start. Check your connection or try again.');
    console.warn('Midnight Radio playback failed:', error);
  }
}


function pauseTrack() {
  if (!audio) return;
  audio.pause();
  setPlayButton(false);
  setPlayerStatus('Paused.');
}

function togglePlay() {
  if (!TRACKS.length || !audio) return;
  if (audio.paused) playTrack(); else pauseTrack();
}
function nextTrack() {
  if (!TRACKS.length) return;
  loadTrack(currentTrack + 1);
  playTrack();
}
function prevTrack() {
  if (!TRACKS.length) return;
  loadTrack(currentTrack - 1);
  playTrack();
}
function seekFromPointer(event) {
  if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0 || !progressWrap) return;
  const rect = progressWrap.getBoundingClientRect();
  const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  audio.currentTime = fraction * audio.duration;
}
function seekFromKeyboard(event) {
  if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const steps = event.shiftKey ? 15 : 5;
  if (event.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - steps);
  else if (event.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + steps);
  else if (event.key === 'Home') audio.currentTime = 0;
  else if (event.key === 'End') audio.currentTime = audio.duration;
  else return;
  event.preventDefault();
}


if (playerEl) {
  if (!TRACKS.length) {
    if (playerEmpty) playerEmpty.style.display = 'block';
    if (playerBodyContent) playerBodyContent.style.display = 'none';
  } else {
    if (playerEmpty) playerEmpty.style.display = 'none';
    if (playerBodyContent) playerBodyContent.style.display = 'block';
    loadTrack(0);
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);

  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const percent = Math.max(0, Math.min(100, (audio.currentTime / audio.duration) * 100));
      if (progressBar) progressBar.style.width = percent + '%';
      if (progressWrap) { progressWrap.setAttribute('aria-valuenow', String(Math.floor(audio.currentTime))); progressWrap.setAttribute('aria-valuetext', formatTime(audio.currentTime) + ' of ' + formatTime(audio.duration)); }
      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
      if (progressWrap) { progressWrap.setAttribute('aria-valuemax', String(Math.floor(audio.duration || 0))); progressWrap.setAttribute('aria-valuetext', '0:00 of ' + formatTime(audio.duration)); }
    });
    audio.addEventListener('waiting', () => setPlayerStatus('Buffering audio…'));
    audio.addEventListener('playing', () => {
      setPlayButton(true);
      setPlayerStatus('Now playing: ' + TRACKS[currentTrack].title);
    });
    audio.addEventListener('pause', () => {
      if (!audio.ended) setPlayButton(false);
    });
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('error', () => {
      setPlayButton(false);
      setPlayerStatus('Unable to load this track. Try another track or check your connection.');
    });
  }

  if (progressWrap) {
    progressWrap.addEventListener('click', seekFromPointer);
    progressWrap.addEventListener('keydown', seekFromKeyboard);
  }
  if (volumeSlider && audio) {
    audio.volume = Number(volumeSlider.value) / 100;
    volumeSlider.addEventListener('input', () => {
      audio.volume = Number(volumeSlider.value) / 100;
    });
  }

  if (playerToggle) {
    playerToggle.addEventListener('click', event => {
      event.stopPropagation();
      const collapsed = playerEl.classList.toggle('collapsed');
      playerToggle.textContent = collapsed ? '▲' : '▼';
      playerToggle.setAttribute('aria-expanded', String(!collapsed));
      playerToggle.setAttribute('aria-label', collapsed ? 'Expand music player' : 'Collapse music player');
    });
  }
}


/* ========== CINEMATIC REVEALS ========== */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.section-head, .card, .panel, .feature-band, .gallery-item, .event-empty, .highlight-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  targets.forEach((el, index) => {
    el.classList.add('js-reveal');
    el.style.transitionDelay = Math.min(index % 5, 4) * 65 + 'ms';
    observer.observe(el);
  });
})();

/* ========== GALLERY LIGHTBOX ========== */
(() => {
  const dialog = document.getElementById('gallery-lightbox');
  if (!dialog) return;
  const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!triggers.length) return;
  const image = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  const counter = dialog.querySelector('.lightbox-counter');
  const closeBtn = dialog.querySelector('.lightbox-close');
  const prevBtn = dialog.querySelector('.lightbox-prev');
  const nextBtn = dialog.querySelector('.lightbox-next');
  let activeIndex = 0;
  let previousFocus = null;
  const visibleTriggers = () => triggers.filter(item => item.getClientRects().length && item.closest('.gallery-section.active'));
  const list = () => visibleTriggers();
  function show(index) {
    const items = list();
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    const item = items[activeIndex];
    const thumb = item.querySelector('img');
    image.src = item.dataset.full || item.href;
    image.alt = thumb?.alt || 'MidnightClub gallery photo';
    caption.textContent = thumb?.alt || '';
    counter.textContent = (activeIndex + 1) + ' / ' + items.length;
  }
  function open(index) {
    previousFocus = document.activeElement;
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
    image.removeAttribute('src');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  triggers.forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    open(list().indexOf(trigger));
  }));
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(activeIndex - 1));
  nextBtn.addEventListener('click', () => show(activeIndex + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  document.addEventListener('keydown', event => {
    if (!dialog.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') show(activeIndex - 1);
    else if (event.key === 'ArrowRight') show(activeIndex + 1);
    else if (event.key === 'Tab') {
      const controls = [closeBtn, prevBtn, nextBtn];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();

/* ========== EVENT BOARD FILTERS ========== */
document.querySelectorAll('[data-event-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.eventFilter;
    const board = button.closest('.event-board');
    if (!board) return;
    board.querySelectorAll('[data-event-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    board.querySelectorAll('[data-event-state]').forEach(card => {
      const states = (card.dataset.eventState || '').split(/\s+/);
      card.hidden = filter !== 'all' && !states.includes(filter);
    });
  });
});

/* ========== SHARE PAGE ========== */
document.querySelectorAll('[data-share-page]').forEach(button => {
  button.addEventListener('click', async () => {
    const shareData = { title: document.title, text: document.querySelector('meta[name="description"]')?.content || 'MidnightClub', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        const original = button.textContent;
        button.textContent = 'Link copied ✓';
        setTimeout(() => { button.textContent = original; }, 1800);
      } else {
        window.prompt('Copy this page link:', shareData.url);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.warn('Share unavailable:', error);
    }
  });
});
