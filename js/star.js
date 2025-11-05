const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

const sparkleCanvas = document.getElementById("sparkles");
const sctx = sparkleCanvas.getContext("2d");

let player, stars, gravity, jumpStrength, moveSpeed, friction;
let score = 0;
let bestScore = parseInt(localStorage.getItem("bestStarScore") || "0");
let timeLeft = 60;
let gameOver = false;
let gameStarted = false;
let timerInterval;
let keys = {};

function startGame() {
  player = { x: 180, y: 350, width: 28, height: 28, dy: 0, dx: 0 };
  stars = [];
  gravity = 0.35;
  jumpStrength = -6;
  moveSpeed = 0.45;
  friction = 0.9;
  score = 0;
  gameOver = false;
  gameStarted = false;
  timeLeft = 60;
  clearInterval(timerInterval);
  spawnStars();
  drawStartScreen();
  updateHUD();
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffd700";
  drawStar(player.x + 14, player.y + 14, 5, 14, 6);

  ctx.fillStyle = "#9faaff";
  ctx.font = "18px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("Press SPACE or click Start to begin!", canvas.width / 2, canvas.height / 2);
  ctx.fillText("Use A/D or ←/→ to move 💫", canvas.width / 2, canvas.height / 2 + 30);
}

function spawnStars() {
  for (let i = 0; i < 6; i++) {
    stars.push({
      x: Math.random() * (canvas.width - 20) + 10,
      y: Math.random() * 250 + 20,
      size: 8,
      collected: false,
    });
  }
}

function drawStar(x, y, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(x, y - outerRadius);
  ctx.closePath();
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#fff4b8";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStar(player.x + player.width / 2, player.y + player.height / 2, 5, 12, 5);

  for (let s of stars) {
    if (!s.collected) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 180, 0.9)";
      ctx.shadowColor = "#fff8b0";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

function update() {
  if (gameOver || !gameStarted) return;

  player.dy += gravity;

  if (keys["a"] || keys["arrowleft"]) player.dx -= moveSpeed;
  if (keys["d"] || keys["arrowright"]) player.dx += moveSpeed;

  player.dx *= friction;
  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    endGame(false);
    return;
  }

  for (let s of stars) {
    if (!s.collected &&
      player.x < s.x + s.size &&
      player.x + player.width > s.x &&
      player.y < s.y + s.size &&
      player.y + player.height > s.y
    ) {
      s.collected = true;
      score++;
      updateHUD();
    }
  }

  if (stars.every(s => s.collected)) spawnStars();

  draw();
  requestAnimationFrame(update);
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    updateHUD();
  } else {
    endGame(true);
  }
}

function updateHUD() {
  document.getElementById("scoreDisplay").textContent = `Score: ${score}`;
  document.getElementById("bestDisplay").textContent = `Best: ${bestScore}`;
  document.getElementById("timeDisplay").textContent = `Time: ${timeLeft}s`;
}

function endGame(timeout = false) {
  gameOver = true;
  clearInterval(timerInterval);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestStarScore", score);
  }

  setTimeout(() => {
    const message = timeout
      ? `⏰ Time’s up!\nFinal Score: ${score}`
      : `You fell! 💫 Final Score: ${score}`;
    alert(message);
    restartGame();
  }, 300);
}

function restartGame() {
  startGame();
}

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === "Space") {
    if (!gameStarted && !gameOver) {
      gameStarted = true;
      timerInterval = setInterval(updateTimer, 1000);
      update();
    }
    if (!gameOver) player.dy = jumpStrength;
  }
});

document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

document.getElementById("startBtn").addEventListener("click", () => {
  if (!gameStarted && !gameOver) {
    gameStarted = true;
    timerInterval = setInterval(updateTimer, 1000);
    update();
  }
  if (!gameOver) player.dy = jumpStrength;
});

// 🌌 Starry background
function resizeSparkles() {
  sparkleCanvas.width = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeSparkles);
resizeSparkles();

let sparkles = Array.from({ length: 60 }, () => ({
  x: Math.random() * sparkleCanvas.width,
  y: Math.random() * sparkleCanvas.height,
  r: Math.random() * 2 + 1,
  d: Math.random() * 0.5 + 0.2,
  alpha: Math.random() * 0.5 + 0.3,
}));

function drawSparkles() {
  sctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  for (let s of sparkles) {
    sctx.beginPath();
    sctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
    sctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    sctx.fill();
  }
}

function updateSparkles() {
  for (let s of sparkles) {
    s.y += s.d * 0.2;
    if (s.y > sparkleCanvas.height) {
      s.y = -5;
      s.x = Math.random() * sparkleCanvas.width;
    }
    s.alpha = 0.3 + Math.sin(Date.now() / 500 + s.x) * 0.2;
  }
}

function animateSparkles() {
  drawSparkles();
  updateSparkles();
  requestAnimationFrame(animateSparkles);
}

animateSparkles();
startGame();
