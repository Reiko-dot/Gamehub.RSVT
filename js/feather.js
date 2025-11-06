// --- Setup & Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');
const finalScoreDisplay = document.getElementById('final-score');
const gameOverMessage = document.getElementById('game-over-message');
const bestScoreStartDisplay = document.getElementById('best-score-start');
const bestScoreEndDisplay = document.getElementById('best-score-end');

let gameActive = false;
let score = 0;
let bestScore = localStorage.getItem('featherFloatBestScore')
  ? parseInt(localStorage.getItem('featherFloatBestScore'))
  : 0;
let feather;
let obstacles = [];

// --- Game Settings ---
const GRAVITY = 0.3;
const LIFT = -6;
const OBSTACLE_SPEED = 2;
const OBSTACLE_INTERVAL = 150;

// --- Feather definition ---
feather = {
  x: 60,
  y: canvas.height / 2,
  width: 20,
  height: 40,
  velocity: 0,
  draw() {
    // Feather shape with soft gradient
    const gradient = ctx.createLinearGradient(this.x, this.y - this.height / 2, this.x, this.y + this.height / 2);
    gradient.addColorStop(0, '#fef6ff');
    gradient.addColorStop(1, '#dcb0ff');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#b088f9';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2);
    ctx.quadraticCurveTo(this.x + this.width / 2, this.y, this.x, this.y + this.height / 2);
    ctx.quadraticCurveTo(this.x - this.width / 2, this.y, this.x, this.y - this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Feather stem
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.height / 2);
    ctx.lineTo(this.x, this.y + this.height / 2);
    ctx.strokeStyle = '#c5a3ff';
    ctx.stroke();
  },
  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;
    if (this.y - this.height / 2 < 0) {
      this.y = this.height / 2;
      this.velocity = 0;
    }
  },
  lift() {
    this.velocity = LIFT;
  }
};

// --- Pastel obstacle poles (like Flappy Bird) ---
function createObstacle() {
  const gapHeight = 150;
  const minHeight = 50;
  const maxTopPipeHeight = canvas.height - minHeight - gapHeight - minHeight;
  const topHeight = Math.floor(Math.random() * maxTopPipeHeight) + minHeight;

  // 🎨 Nice pastel colors
  const colors = ['#ffc8dd', '#bde0fe', '#caffbf', '#ffd6a5', '#e0aaff'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    x: canvas.width,
    width: 60,
    topHeight,
    bottomY: topHeight + gapHeight,
    color,
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, 0, this.width, this.topHeight);
      ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
    },
    update() {
      this.x -= OBSTACLE_SPEED;
    }
  };
}

// --- Collision detection ---
function checkCollision() {
  if (feather.y + feather.height / 2 > canvas.height) {
    gameOver('You let the feather fall to the ground.');
    return true;
  }

  for (const obs of obstacles) {
    const featherRight = feather.x + feather.width / 2;
    const featherLeft = feather.x - feather.width / 2;
    const featherTop = feather.y - feather.height / 2;
    const featherBottom = feather.y + feather.height / 2;
    const obsRight = obs.x + obs.width;
    const obsLeft = obs.x;

    if (featherRight > obsLeft && featherLeft < obsRight) {
      if (featherTop < obs.topHeight || featherBottom > obs.bottomY) {
        gameOver('You touched the pastel pole — try again!');
        return true;
      }
    }
  }
  return false;
}

// --- Score update ---
function updateScore() {
  obstacles.forEach(obs => {
    if (obs.x + obs.width < feather.x && !obs.passed) {
      score++;
      obs.passed = true;
    }
  });
}

// --- Main game loop ---
function gameLoop() {
  if (!gameActive) return;

  // Background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fef6ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Feather
  feather.update();
  feather.draw();

  // Obstacles
  if (gameLoop.frame % OBSTACLE_INTERVAL === 0) {
    obstacles.push(createObstacle());
  }
  gameLoop.frame++;

  obstacles.forEach(obs => {
    obs.update();
    obs.draw();
  });

  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

  // Collision & scoring
  if (checkCollision()) return;
  updateScore();

  // UI
  ctx.fillStyle = '#b088f9';
  ctx.font = '20px Poppins, Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Drift: ${score}`, 10, 30);
  ctx.fillText(`Best: ${bestScore}`, 10, 60);

  requestAnimationFrame(gameLoop);
}
gameLoop.frame = 0;

// --- Screen management ---
function showStartScreen() {
  gameActive = false;
  canvas.style.display = 'none';
  gameOverScreen.style.display = 'none';
  startMenu.style.display = 'flex';

  bestScore = localStorage.getItem('featherFloatBestScore')
    ? parseInt(localStorage.getItem('featherFloatBestScore'))
    : 0;
  bestScoreStartDisplay.textContent = bestScore;
}

function startGame() {
  gameActive = true;
  score = 0;
  feather.y = canvas.height / 2;
  feather.velocity = 0;
  obstacles = [];
  gameLoop.frame = 0; // ✅ important reset

  startMenu.style.display = 'none';
  gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';

  requestAnimationFrame(gameLoop);
}

function gameOver(message) {
  gameActive = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('featherFloatBestScore', bestScore);
  }

  finalScoreDisplay.textContent = score;
  gameOverMessage.textContent = message;
  bestScoreEndDisplay.textContent = bestScore;

  canvas.style.display = 'none';
  gameOverScreen.style.display = 'flex';
}

// --- Controls ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

function handleInput(e) {
  if (e.code === 'Space' || e.type === 'mousedown' || e.type === 'touchstart') {
    if (gameActive) {
      feather.lift();
    } else if (startMenu.style.display === 'flex') {
      startGame();
    }
  }
}
document.addEventListener('keydown', handleInput);
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', handleInput);

// --- Initialize ---
showStartScreen();
