const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const bestDisplay = document.getElementById("bestScore");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("startBtn");

const box = 20;
let snake = [];
let direction = null;
let food;
let score = 0;
let bestScore = localStorage.getItem("bestSnakeScore") ? parseInt(localStorage.getItem("bestSnakeScore")) : 0;
let gameInterval, timerInterval, startTime;
let gameRunning = false;

bestDisplay.textContent = `Best: ${bestScore}`;

// 🩷 Initialize game
function startGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  score = 0;
  food = randomFood();
  startTime = Date.now();
  gameRunning = true;

  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameInterval = setInterval(draw, 100);
  timerInterval = setInterval(updateTime, 1000);

  scoreDisplay.textContent = "Score: 0";
  timeDisplay.textContent = "Time: 00:00";
  startBtn.disabled = true;
  startBtn.textContent = "Playing...";
}

// 🍓 Random food position
function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

// 🕹️ Controls (arrows + WASD)
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if ((key === "arrowleft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
  if ((key === "arrowup" || key === "w") && direction !== "DOWN") direction = "UP";
  if ((key === "arrowright" || key === "d") && direction !== "LEFT") direction = "RIGHT";
  if ((key === "arrowdown" || key === "s") && direction !== "UP") direction = "DOWN";
});

// 🎨 Draw snake and food
function draw() {
  ctx.fillStyle = "#fffafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Food
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#aee7ff";
  ctx.fill();

  // Draw snake with rounded effect and slight gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#ffb6c1");
  gradient.addColorStop(1, "#ffd1dc");

  snake.forEach((part, i) => {
    ctx.beginPath();
    ctx.roundRect(part.x, part.y, box, box, 6);
    ctx.fillStyle = i === 0 ? "#ff9eb8" : gradient;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
  });

  // Movement
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Eat food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    food = randomFood();
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  // Collision check
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);
}

// 🚫 Collision helper
function collision(head, array) {
  return array.some((part) => head.x === part.x && head.y === part.y);
}

// ⏰ Timer
function updateTime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  timeDisplay.textContent = `Time: ${minutes}:${seconds}`;
}

// 💔 Game Over
function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameRunning = false;

  // Save best score
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestSnakeScore", bestScore);
    bestDisplay.textContent = `Best: ${bestScore}`;
  }

  // Overlay message
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
  ctx.fillStyle = "#ff8fab";
  ctx.font = "24px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("Game Over 💖", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "16px Poppins";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

  startBtn.disabled = false;
  startBtn.textContent = "▶️ Start Game";
}

// 🔁 Restart
function restartGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  if (gameRunning) endGame();
  startBtn.disabled = false;
  startBtn.textContent = "▶️ Start Game";
  scoreDisplay.textContent = "Score: 0";
  timeDisplay.textContent = "Time: 00:00";
  snake = [];
  direction = null;
}

// Start button
startBtn.addEventListener("click", startGame);

// 🫧 Background bubble animation
const bubbleCanvas = document.getElementById("bubbles");
const bctx = bubbleCanvas.getContext("2d");
bubbleCanvas.width = window.innerWidth;
bubbleCanvas.height = window.innerHeight;
const bubbles = [];

function createBubble() {
  bubbles.push({
    x: Math.random() * bubbleCanvas.width,
    y: bubbleCanvas.height + 10,
    radius: Math.random() * 6 + 4,
    speed: Math.random() * 1 + 0.3,
    alpha: Math.random() * 0.5 + 0.3,
  });
}

function updateBubbles() {
  if (bubbles.length < 60 && Math.random() < 0.3) createBubble();

  bctx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
  bubbles.forEach((b) => {
    b.y -= b.speed;
    bctx.beginPath();
    bctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    bctx.fillStyle = `rgba(255, 182, 193, ${b.alpha})`;
    bctx.fill();
  });
  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].y < -10) bubbles.splice(i, 1);
  }
  requestAnimationFrame(updateBubbles);
}
updateBubbles();
