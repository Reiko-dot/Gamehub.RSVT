'use strict';

const EMOJIS = ['🌸','🌷','🌻','🌹','🌼','🌺','💐','🍄'];
const grid = document.getElementById('gameGrid');
const movesCountEl = document.getElementById('movesCount');
const timerEl = document.getElementById('timer');
const restartBtn = document.getElementById('restart');
const menuBtn = document.getElementById('menu');
const bestEl = document.getElementById('bestScore');
const winModal = document.getElementById('winModal');
const winTimeEl = document.getElementById('winTime');
const winMovesEl = document.getElementById('winMoves');
const bestMsg = document.getElementById('bestMessage');
const playAgainBtn = document.getElementById('playAgain');
const menuFromModal = document.getElementById('menuFromModal');

let deck = [];
let flipped = [];
let matched = 0;
let moves = 0;
let seconds = 0;
let timer = null;
let lock = false;

/* Best Score Handling */
function loadBest() {
  const data = JSON.parse(localStorage.getItem('memoryMeadowBest')) || null;
  if (!data) {
    bestEl.textContent = '—';
    return null;
  }
  bestEl.textContent = `${data.time} / ${data.moves}m`;
  return data;
}

function saveBest(newTime, newMoves) {
  const best = loadBest();
  if (!best || newTime < best.seconds || (newTime === best.seconds && newMoves < best.moves)) {
    const obj = { time: formatTime(newTime), seconds: newTime, moves: newMoves };
    localStorage.setItem('memoryMeadowBest', JSON.stringify(obj));
    loadBest();
    return true;
  }
  return false;
}

/* Utility */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/* Timer */
function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

/* Game Setup */
function createBoard() {
  const doubled = shuffle([...EMOJIS, ...EMOJIS]);
  grid.innerHTML = '';
  doubled.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back card-face">🌿</div>
        <div class="card-front card-face">${emoji}</div>
      </div>`;
    card.addEventListener('click', () => flip(card, emoji));
    grid.appendChild(card);
  });
  flipped = [];
  matched = 0;
  moves = 0;
  seconds = 0;
  timerEl.textContent = '00:00';
  movesCountEl.textContent = '0';
  stopTimer();
  loadBest();
}

/* Flip Logic */
async function flip(card, emoji) {
  if (lock || card.classList.contains('is-flipped') || card.classList.contains('matched')) return;
  if (moves === 0 && !timer) startTimer();

  card.classList.add('is-flipped');
  flipped.push({ card, emoji });

  if (flipped.length === 2) {
    lock = true;
    moves++;
    movesCountEl.textContent = moves;

    const [a, b] = flipped;
    if (a.emoji === b.emoji) {
      setTimeout(() => {
        a.card.classList.add('matched');
        b.card.classList.add('matched');
        setTimeout(() => {
          a.card.classList.add('sway');
          b.card.classList.add('sway');
        }, 400);
        flipped = [];
        matched += 2;
        lock = false;
        if (matched === EMOJIS.length * 2) finishGame();
      }, 400);
    } else {
      setTimeout(() => {
        a.card.classList.remove('is-flipped');
        b.card.classList.remove('is-flipped');
        flipped = [];
        lock = false;
      }, 900);
    }
  }
}

/* Finish */
function finishGame() {
  stopTimer();
  const beatBest = saveBest(seconds, moves);
  winTimeEl.textContent = formatTime(seconds);
  winMovesEl.textContent = moves;
  bestMsg.textContent = beatBest ? '🏆 New best record!' : '';
  winModal.setAttribute('aria-hidden', 'false');
}

/* Event Handlers */
restartBtn.addEventListener('click', createBoard);
playAgainBtn.addEventListener('click', () => {
  winModal.setAttribute('aria-hidden', 'true');
  createBoard();
});
menuBtn.addEventListener('click', () => (window.location.href = 'index.html'));
menuFromModal.addEventListener('click', () => (window.location.href = 'index.html'));

/* Init */
createBoard();