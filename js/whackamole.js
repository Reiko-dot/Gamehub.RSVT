const grid = document.getElementById('grid');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('start-btn');

    let score = 0;
    let timeLeft = 30;
    let gameInterval, moleInterval, activeHole = null;

    // Create 9 holes
    for (let i = 0; i < 9; i++) {
      const hole = document.createElement('div');
      hole.classList.add('hole');
      hole.addEventListener('click', () => {
        if (hole === activeHole) {
          score++;
          scoreDisplay.textContent = score;
          hole.textContent = '💥';
          hole.classList.remove('mole');
          activeHole = null;
        }
      });
      grid.appendChild(hole);
    }

    function randomHole() {
      const holes = document.querySelectorAll('.hole');
      holes.forEach(h => {
        h.textContent = '';
        h.classList.remove('mole');
      });
      const index = Math.floor(Math.random() * holes.length);
      const mole = holes[index];
      mole.textContent = '🐹';
      mole.classList.add('mole');
      activeHole = mole;
    }

    function startGame() {
      score = 0;
      timeLeft = 30;
      scoreDisplay.textContent = score;
      timeDisplay.textContent = timeLeft;
      startBtn.disabled = true;
      gameInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
      }, 1000);
      moleInterval = setInterval(randomHole, 700);
    }

    function endGame() {
      clearInterval(gameInterval);
      clearInterval(moleInterval);
      document.querySelectorAll('.hole').forEach(h => {
        h.textContent = '';
        h.classList.remove('mole');
      });
      activeHole = null;
      startBtn.disabled = false;
      alert(`⏰ Time’s up! Final score: ${score}`);
    }

    startBtn.addEventListener('click', startGame);
  