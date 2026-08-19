/**
 * app.js — Kelime Pratik
 * Mod 1: Kelime Eşleştirme  (data/words.json)
 * Mod 2: Düzensiz Fiiller   (data/verbs.json)
 */

const WORDS_URL  = 'data/words.json';
const VERBS_URL  = 'data/verbs.json';
const PAIR_COUNT = 5;

const CELEBRATIONS = [
  { emoji: '🎉', title: 'Mükemmel!',  sub: 'Devam et, harika gidiyorsun!' },
  { emoji: '⭐', title: 'Süper!',      sub: 'Beyin kasları güçleniyor!' },
  { emoji: '🔥', title: 'Harika!',     sub: '5 kelime daha tamam!' },
  { emoji: '💪', title: 'Bravo!',      sub: 'Böyle devam et!' },
  { emoji: '🚀', title: 'Muhteşem!',   sub: 'Kelimeleri ezberledin!' },
];

/* ================================================
   Per-mode state
   ================================================ */
const state = {
  words: {
    allItems:   [],
    pool:       [],
    poolIndex:  0,
    roundNum:   1,
    score:      0,
    totalMatch: 0,
    leftCol:      () => document.getElementById('w-leftCol'),
    rightCol:     () => document.getElementById('w-rightCol'),
    scoreEl:      () => document.getElementById('w-scoreVal'),
    roundEl:      () => document.getElementById('w-roundVal'),
    totalEl:      () => document.getElementById('w-totalVal'),
    progressFill: () => document.getElementById('w-progressFill'),
    progressText: () => document.getElementById('w-progressText'),
    getLeft:  item => item.en,
    getRight: item => item.tr,
  },
  verbs: {
    allItems:   [],
    pool:       [],
    poolIndex:  0,
    roundNum:   1,
    score:      0,
    totalMatch: 0,
    leftCol:      () => document.getElementById('v-leftCol'),
    rightCol:     () => document.getElementById('v-rightCol'),
    scoreEl:      () => document.getElementById('v-scoreVal'),
    roundEl:      () => document.getElementById('v-roundVal'),
    totalEl:      () => document.getElementById('v-totalVal'),
    progressFill: () => document.getElementById('v-progressFill'),
    progressText: () => document.getElementById('v-progressText'),
    getLeft:  item => item.v1,
    getRight: item => item.v2,
  },
};

/* ---- Shared selection state ---- */
let currentMode = 'words';
let locked      = false;
let selLeft     = null;
let selRight    = null;
let leftItems   = [];
let rightItems  = [];

/* ================================================
   Menu / Mode Switching
   ================================================ */
function goToMenu() {
  currentMode = null;
  locked      = false;
  selLeft     = null;
  selRight    = null;
  leftItems   = [];
  rightItems  = [];

  document.getElementById('mainMenu').style.display  = '';
  document.getElementById('modeWords').style.display = 'none';
  document.getElementById('modeVerbs').style.display = 'none';
}

function switchMode(mode) {
  currentMode = mode;

  document.getElementById('mainMenu').style.display  = 'none';
  document.getElementById('modeWords').style.display = mode === 'words' ? '' : 'none';
  document.getElementById('modeVerbs').style.display = mode === 'verbs' ? '' : 'none';

  locked     = false;
  selLeft    = null;
  selRight   = null;
  leftItems  = [];
  rightItems = [];

  const s = state[mode];
  if (s.allItems.length >= PAIR_COUNT) {
    loadRound(mode);
  }
}

/* ================================================
   Bootstrap
   ================================================ */
async function init() {
  /* Words */
  try {
    const res = await fetch(WORDS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const words = await res.json();
    if (!Array.isArray(words) || words.length < PAIR_COUNT) throw new Error('Yeterli kelime bulunamadı.');
    state.words.allItems = words;
    state.words.pool     = shuffle(words);
    updateStats('words');
    /* Round loaded on demand when user picks this mode from menu */
  } catch (err) {
    showError('words', `Kelimeler yüklenemedi: ${err.message}`);
  }

  /* Verbs */
  try {
    const res = await fetch(VERBS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const verbs = await res.json();
    if (!Array.isArray(verbs) || verbs.length < PAIR_COUNT) throw new Error('Yeterli fiil bulunamadı.');
    state.verbs.allItems = verbs;
    state.verbs.pool     = shuffle(verbs);
    updateStats('verbs');
    /* Round will be loaded when the user switches to verbs mode */
  } catch (err) {
    showError('verbs', `Fiiller yüklenemedi: ${err.message}`);
  }
}

/* ================================================
   Round Management
   ================================================ */
function loadRound(mode) {
  const s = state[mode];

  if (s.poolIndex + PAIR_COUNT > s.pool.length) {
    s.pool      = shuffle(s.allItems);
    s.poolIndex = 0;
  }

  const pairs = s.pool.slice(s.poolIndex, s.poolIndex + PAIR_COUNT);
  s.poolIndex += PAIR_COUNT;

  selLeft    = null;
  selRight   = null;
  leftItems  = [];
  rightItems = [];

  s.leftCol().innerHTML  = '';
  s.rightCol().innerHTML = '';

  shuffle(pairs).forEach(pair => {
    const btn = createButton(s.getLeft(pair));
    btn.addEventListener('click', () => handleSelect(mode, 'left', pair, btn));
    s.leftCol().appendChild(btn);
    leftItems.push({ pair, btn, matched: false });
  });

  shuffle(pairs).forEach(pair => {
    const btn = createButton(s.getRight(pair));
    btn.addEventListener('click', () => handleSelect(mode, 'right', pair, btn));
    s.rightCol().appendChild(btn);
    rightItems.push({ pair, btn, matched: false });
  });

  s.roundEl().textContent = s.roundNum;
  updateStats(mode);
}

/* ================================================
   Selection & Matching
   ================================================ */
function handleSelect(mode, side, pair, btn) {
  if (locked || currentMode !== mode) return;

  const items = side === 'left' ? leftItems : rightItems;
  const item  = items.find(i => i.pair === pair);
  if (!item || item.matched) return;

  if (side === 'left') {
    if (selLeft === item) { deselect(item); selLeft = null; return; }
    if (selLeft) deselect(selLeft);
    selLeft = item;
  } else {
    if (selRight === item) { deselect(item); selRight = null; return; }
    if (selRight) deselect(selRight);
    selRight = item;
  }

  item.btn.classList.add('word-btn--selected');
  if (selLeft && selRight) evaluate(mode);
}

function deselect(item) {
  item.btn.classList.remove('word-btn--selected');
}

function evaluate(mode) {
  locked = true;
  const L = selLeft;
  const R = selRight;

  deselect(L);
  deselect(R);

  if (L.pair === R.pair) {
    onCorrect(mode, L, R);
  } else {
    onWrong(L, R);
  }
}

function onCorrect(mode, L, R) {
  L.btn.classList.add('word-btn--correct');
  R.btn.classList.add('word-btn--correct');

  const s             = state[mode];
  const capturedLeft  = leftItems;

  s.score      += 10;
  s.totalMatch += 1;
  updateStats(mode);

  setTimeout(() => {
    if (currentMode !== mode) { locked = false; return; }

    L.btn.classList.add('word-btn--eliminated');
    R.btn.classList.add('word-btn--eliminated');
    L.matched = true;
    R.matched = true;
    selLeft   = null;
    selRight  = null;

    if (capturedLeft.every(i => i.matched)) {
      s.roundNum++;
      setTimeout(() => {
        if (currentMode !== mode) { locked = false; return; }
        showCelebration(mode);
      }, 350);
    } else {
      locked = false;
    }
  }, 550);
}

function onWrong(L, R) {
  L.btn.classList.add('word-btn--incorrect');
  R.btn.classList.add('word-btn--incorrect');

  setTimeout(() => {
    L.btn.classList.remove('word-btn--incorrect');
    R.btn.classList.remove('word-btn--incorrect');
    selLeft  = null;
    selRight = null;
    locked   = false;
  }, 600);
}

/* ================================================
   Celebration Overlay
   ================================================ */
function showCelebration(mode) {
  const m  = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `
    <div class="overlay__card">
      <div class="overlay__emoji">${m.emoji}</div>
      <div class="overlay__title">${m.title}</div>
      <div class="overlay__sub">${m.sub}</div>
    </div>`;
  document.body.appendChild(ov);

  setTimeout(() => {
    ov.remove();
    if (currentMode === mode) {
      loadRound(mode);
      locked = false;
    }
  }, 1300);
}

/* ================================================
   UI Helpers
   ================================================ */
function createButton(text) {
  const btn = document.createElement('button');
  btn.className   = 'word-btn';
  btn.textContent = text;
  return btn;
}

function updateStats(mode) {
  const s        = state[mode];
  const total    = s.allItems.length;
  if (total === 0) return;
  const cyclePos = s.totalMatch % total;

  s.scoreEl().textContent = s.score;
  s.totalEl().textContent = s.totalMatch;

  const pct = (cyclePos === 0 && s.totalMatch > 0)
    ? 100
    : (cyclePos / total) * 100;

  s.progressFill().style.width = pct + '%';
  s.progressText().textContent =
    (cyclePos === 0 && s.totalMatch > 0 ? total : cyclePos) + ' / ' + total;
}

function showError(mode, msg) {
  const s   = state[mode];
  const div = document.createElement('p');
  div.className   = 'status-message status-message--error';
  div.textContent = msg;
  const board = s.leftCol().closest('.board');
  if (board) board.replaceWith(div);
}

/* ================================================
   Utility
   ================================================ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---- Start ---- */
init();

