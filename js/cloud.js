const canvas = document.getElementById("cloudCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

// Game objects
let basket = { x: width / 2 - 30, y: height - 40, width: 60, height: 20, speed: 6 };
let clouds = [];
let raindrops = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0;
let timeLeft = 50;
let gameOver = false;
let timerInterval;

document.getElementById("bestScore").textContent = bestScore;

// Movement
let leftPressed = false;
let rightPressed = false;

// Controls (Arrows + WASD)
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") leftPressed = true;
  if (e.key === "ArrowRight" || e.key === "d") rightPressed = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a") leftPressed = false;
  if (e.key === "ArrowRight" || e.key === "d") rightPressed = false;
});

// Spawn clouds and raindrops
function spawnObjects() {
  if (Math.random() < 0.03) {
    clouds.push({ x: Math.random() * (width - 30), y: -30, radius: 15 });
  }
  if (Math.random() < 0.02) {
    raindrops.push({ x: Math.random() * (width - 10), y: -20, radius: 7 });
  }
}

// Update positions and collisions
function updateObjects() {
  if (gameOver) return;

  // Move basket
  if (leftPressed && basket.x > 0) basket.x -= basket.speed;
  if (rightPressed && basket.x + basket.width < width) basket.x += basket.speed;

  // Move objects
  clouds.forEach(c => c.y += 2);
  raindrops.forEach(r => r.y += 3);

  // Catch clouds
  clouds = clouds.filter(c => {
    if (
      c.y + c.radius > basket.y &&
      c.y - c.radius < basket.y + basket.height &&
      c.x + c.radius > basket.x &&
      c.x - c.radius < basket.x + basket.width
    ) {
      score++;
      document.getElementById("score").textContent = score;
      return false;
    }
    return c.y < height;
  });

  // Hit raindrop = Game Over
  raindrops = raindrops.filter(r => {
    if (
      r.y + r.radius > basket.y &&
      r.y - r.radius < basket.y + basket.height &&
      r.x + r.radius > basket.x &&
      r.x - r.radius < basket.x + basket.width
    ) {
      endGame("Oh no! You got soaked!");
      return false;
    }
    return r.y < height;
  });
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, width, height);

  // Basket
  ctx.fillStyle = "#ffc6e5";
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
  ctx.strokeStyle = "#ff9bde";
  ctx.strokeRect(basket.x, basket.y, basket.width, basket.height);

  // Clouds
  clouds.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff3ff";
    ctx.fill();
    ctx.strokeStyle = "#7ec8ff";
    ctx.stroke();
  });

  // Raindrops
  raindrops.forEach(r => {
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#7ec8ff";
    ctx.fill();
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(0, height / 2 - 60, width, 120);
    ctx.fillStyle = "#7a84ff";
    ctx.font = "24px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", width / 2, height / 2 - 10);
    ctx.font = "18px Poppins";
    ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + 20);
  }
}

// Game loop
function gameLoop() {
  if (!gameOver) {
    spawnObjects();
    updateObjects();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    draw();
  }
}

// Timer countdown
function startTimer() {
  timeLeft = 50;
  document.getElementById("timer").textContent = timeLeft;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft;
    } else {
      endGame("⏰ Time's up!");
    }
  }, 1000);
}

// End game logic
function endGame(message) {
  gameOver = true;
  clearInterval(timerInterval);

  // Update best score
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    document.getElementById("bestScore").textContent = bestScore;
  }

  // Show overlay message
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillRect(0, height / 2 - 60, width, 120);
  ctx.fillStyle = "#7a84ff";
  ctx.font = "24px Poppins";
  ctx.textAlign = "center";
  ctx.fillText(message, width / 2, height / 2);
}

// Restart
function restartGame() {
  clearInterval(timerInterval);
  basket = { x: width / 2 - 30, y: height - 40, width: 60, height: 20, speed: 6 };
  clouds = [];
  raindrops = [];
  score = 0;
  timeLeft = 50;
  gameOver = false;
  document.getElementById("score").textContent = 0;
  document.getElementById("timer").textContent = 50;
  gameLoop();
  startTimer();
}

document.getElementById("restartBtn").addEventListener("click", restartGame);

// Start game
restartGame();
