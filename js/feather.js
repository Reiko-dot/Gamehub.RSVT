const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const gameOverScreen = document.getElementById("game-over-screen");
const restartButton = document.getElementById("restart-button");
const finalScoreDisplay = document.getElementById("final-score");
const bestScoreStartDisplay = document.getElementById("best-score-start");
const bestScoreEndDisplay = document.getElementById("best-score-end");
const gameOverMessage = document.getElementById("game-over-message");

let gameActive = false;
let score = 0;
let bestScore = parseInt(localStorage.getItem("featherFloatBestScore") || "0");
let feather, obstacles;

const GRAVITY = 0.25;
const LIFT = -5;
const OBSTACLE_SPEED = 2.5;
const OBSTACLE_INTERVAL = 90;

// Feather setup
feather = {
  x: 100,
  y: canvas.height / 2,
  width: 20,
  height: 40,
  velocity: 0,
  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;
    if (this.y < this.height / 2) {
      this.y = this.height / 2;
      this.velocity = 0;
    }
  },
  lift() {
    this.velocity = LIFT;
  },
  draw() {
    const gradient = ctx.createLinearGradient(this.x - 10, this.y - 20, this.x + 10, this.y + 20);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, "#ffd6f6");
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "#d2b5f5";
    ctx.lineWidth = 1.3;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 20);
    ctx.quadraticCurveTo(this.x + 12, this.y, this.x, this.y + 20);
    ctx.quadraticCurveTo(this.x - 12, this.y, this.x, this.y - 20);
    ctx.fill();
    ctx.stroke();

    // Little feather line
    ctx.strokeStyle = "#e3bdfc";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 18);
    ctx.lineTo(this.x, this.y + 18);
    ctx.stroke();
  },
};

// Pastel color options
const colors = ["#ffc8dd", "#ffafcc", "#bde0fe", "#a2d2ff", "#fff0b3"];

function createObstacle() {
  const gapHeight = 130;
  const topHeight = Math.floor(Math.random() * 150) + 50;
  const color = colors[Math.floor(Math.random() * colors.length)];
  return {
    x: canvas.width,
    width: 60,
    topHeight,
    bottomY: topHeight + gapHeight,
    color,
    passed: false,
    draw() {
      ctx.fillStyle = this.color;
      // soft rounded pastel poles
      ctx.beginPath();
      ctx.roundRect(this.x, 0, this.width, this.topHeight, 8);
      ctx.roundRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY, 8);
      ctx.fill();
    },
    update() {
      this.x -= OBSTACLE_SPEED;
    },
  };
}

function checkCollision() {
  if (feather.y + feather.height / 2 > canvas.height) {
    gameOver("You drifted too low 💫");
    return true;
  }
  for (const obs of obstacles) {
    const right = feather.x + feather.width / 2;
    const left = feather.x - feather.width / 2;
    const top = feather.y - feather.height / 2;
    const bottom = feather.y + feather.height / 2;
    if (right > obs.x && left < obs.x + obs.width) {
      if (top < obs.topHeight || bottom > obs.bottomY) {
        gameOver("You touched a pastel pole 💕");
        return true;
      }
    }
  }
  return false;
}

function updateScore() {
  for (const obs of obstacles) {
    if (obs.x + obs.width < feather.x && !obs.passed) {
      score++;
      obs.passed = true;
    }
  }
}

function gameLoop(frame = 0) {
  if (!gameActive) return;

  // background
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#fff9ff");
  sky.addColorStop(1, "#ffeefb");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  feather.update();
  feather.draw();

  if (frame % OBSTACLE_INTERVAL === 0) {
    obstacles.push(createObstacle());
  }

  obstacles.forEach(o => {
    o.update();
    o.draw();
  });
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  if (checkCollision()) return;

  updateScore();

  ctx.fillStyle = "#7e6b8f";
  ctx.font = "20px Poppins";
  ctx.fillText(`Drift: ${score}`, 10, 30);
  ctx.fillText(`Best: ${bestScore}`, 10, 55);

  requestAnimationFrame(() => gameLoop(frame + 1));
}

function showStartScreen() {
  gameActive = false;
  canvas.style.display = "none";
  gameOverScreen.style.display = "none";
  startMenu.style.display = "flex";
  bestScoreStartDisplay.textContent = bestScore;
}

function startGame() {
  gameActive = true;
  score = 0;
  feather.y = canvas.height / 2;
  feather.velocity = 0;
  obstacles = [];
  startMenu.style.display = "none";
  gameOverScreen.style.display = "none";
  canvas.style.display = "block";
  requestAnimationFrame(gameLoop);
}

function gameOver(msg) {
  gameActive = false;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("featherFloatBestScore", bestScore);
  }
  finalScoreDisplay.textContent = score;
  bestScoreEndDisplay.textContent = bestScore;
  gameOverMessage.textContent = msg;
  canvas.style.display = "none";
  gameOverScreen.style.display = "flex";
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (gameActive) feather.lift();
    else if (startMenu.style.display === "flex") startGame();
  }
});
canvas.addEventListener("mousedown", () => { if (gameActive) feather.lift(); });
canvas.addEventListener("touchstart", () => { if (gameActive) feather.lift(); });

showStartScreen();
