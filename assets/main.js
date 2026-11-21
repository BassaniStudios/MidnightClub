/* MidnightClub — main.js */

// ========== BOOT LOADER ==========
(function () {
  const loader = document.getElementById('boot-loader');
  if (!loader) return;

  // Hide loader after progress animation + small buffer
  const hide = () => {
    loader.classList.add('hidden');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 900);
  };

  // Wait for window load or max 2.2s
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    // Let the progress bar finish its animation
    setTimeout(hide, 400);
  };

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish);
    setTimeout(finish, 2200); // safety fallback
  }
})();

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// Dynamic year
document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// Gallery tabs
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.gallery-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
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

let currentTrack = 0;
let isPlaying = false;

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function loadTrack(index) {
  if (!TRACKS.length) return;
  const t = TRACKS[index];
  audio.src = t.src;
  trackNameEl.textContent = t.title;
  trackArtistEl.textContent = t.artist || 'MidnightClub';
  progressBar.style.width = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
}

function playTrack() {
  if (!TRACKS.length) return;
  audio.play();
  isPlaying = true;
  if (playBtn) playBtn.textContent = '❚❚';
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  if (playBtn) playBtn.textContent = '▶';
}

function togglePlay() {
  if (!TRACKS.length) return;
  isPlaying ? pauseTrack() : playTrack();
}

function nextTrack() {
  if (!TRACKS.length) return;
  currentTrack = (currentTrack + 1) % TRACKS.length;
  loadTrack(currentTrack);
  playTrack();
}

function prevTrack() {
  if (!TRACKS.length) return;
  currentTrack = (currentTrack - 1 + TRACKS.length) % TRACKS.length;
  loadTrack(currentTrack);
  playTrack();
}

// Init player UI
if (playerEl) {
  if (TRACKS.length === 0) {
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
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = pct + '%';
      currentTimeEl.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', nextTrack);
  }

  if (progressWrap) {
    progressWrap.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = progressWrap.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value / 100;
    });
    audio.volume = 0.7;
  }

  if (playerToggle) {
    playerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      playerEl.classList.toggle('collapsed');
      playerToggle.textContent = playerEl.classList.contains('collapsed') ? '▲' : '▼';
    });
  }

  const header = playerEl.querySelector('.player-header');
  if (header) {
    header.addEventListener('click', () => {
      playerEl.classList.toggle('collapsed');
      if (playerToggle) {
        playerToggle.textContent = playerEl.classList.contains('collapsed') ? '▲' : '▼';
      }
    });
  }
}
