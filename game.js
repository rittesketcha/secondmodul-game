let playerName = '';
let gameRunning = false;
let paused = false;
let batteryLevel = 50;
let elapsedTime = 0;
let intervalId;
let obstacles = [];
let batteries = [];
let drone = { x: 50, y: 300, width: 50, height: 50 };

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const loseScreen = document.getElementById('lose-screen');

const nameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const restartBtnLose = document.getElementById('restart-btn-lose');

const displayName = document.getElementById('display-name');
const timeDisplay = document.getElementById('time');
const powerDisplay = document.getElementById('power');
const resultText = document.getElementById('result-text');

nameInput.addEventListener('input', () => {
  startBtn.disabled = nameInput.value.trim() === '';
});

startBtn.addEventListener('click', () => {
  playerName = nameInput.value;
  startGame();
});

restartBtn.addEventListener('click', restartGame);
restartBtnLose.addEventListener('click', restartGame);

document.addEventListener('keydown', handleControls);

function startGame() {
  switchScreen(welcomeScreen, gameScreen);
  displayName.textContent = `Игрок: ${playerName}`;
  gameRunning = true;
  batteryLevel = 50;
  elapsedTime = 0;
  paused = false;
  obstacles = [];
  batteries = [];
  drone.y = canvas.height / 2 - drone.height / 2;
  intervalId = setInterval(() => {
    if (!paused) {
      elapsedTime++;
      batteryLevel--;
      updateHUD();
      if (batteryLevel <= 0) endGame(false);
    }
  }, 1000);
  requestAnimationFrame(update);
}

function updateHUD() {
  const mins = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  const secs = String(elapsedTime % 60).padStart(2, '0');
  timeDisplay.textContent = `${mins}:${secs}`;
  powerDisplay.textContent = `Power: ${batteryLevel}%`;
}

function handleControls(e) {
  if (!gameRunning) return;

  if (e.key === 'Escape') {
    paused = !paused;
    if (!paused) requestAnimationFrame(update);
    return;
  }

  if (paused) return;

  if (e.key === 'w' || e.key === 'W') {
    drone.y = Math.max(0, drone.y - 40);
  } else if (e.key === 's' || e.key === 'S') {
    drone.y = Math.min(canvas.height - drone.height, drone.y + 40);
  }
}

function update() {
  if (!gameRunning || paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDrone();
  drawObstacles();
  drawBatteries();

  if (obstacles.length === 0 || canvas.width - obstacles[obstacles.length - 1].x >= 300) {
    spawnWallAndBattery();
  }

  for (let obs of obstacles) {
    if (checkCollision(drone, obs)) return endGame(false);
  }

  for (let i = batteries.length - 1; i >= 0; i--) {
    if (checkCollision(drone, batteries[i])) {
      batteryLevel = Math.min(100, batteryLevel + 5);
      batteries.splice(i, 1);
      updateHUD();
    }
  }

  requestAnimationFrame(update);
}

function drawDrone() {
  ctx.fillStyle = 'red';
  ctx.fillRect(drone.x, drone.y, drone.width, drone.height);
}

function drawObstacles() {
  ctx.fillStyle = 'brown';
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= 2;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
}

function drawBatteries() {
  ctx.fillStyle = 'yellow';
  for (let i = 0; i < batteries.length; i++) {
    const bat = batteries[i];
    bat.x -= 2;
    ctx.fillRect(bat.x, bat.y, bat.width, bat.height);
  }
  batteries = batteries.filter(bat => bat.x + bat.width > 0);
}

function spawnWallAndBattery() {
  const wallWidth = 50;
  const wallHeight = Math.floor(Math.random() * 400) + 100; // 100–500px
  const attachTop = Math.random() < 0.5;

  const newWall = {
    x: canvas.width,
    y: attachTop ? 0 : canvas.height - wallHeight,
    width: wallWidth,
    height: wallHeight
  };
  obstacles.push(newWall);

  // Если это не первая стена — между текущей и предыдущей можно разместить батарейку
  if (obstacles.length >= 2) {
    const lastWall = obstacles[obstacles.length - 2];
    const gapStartY = lastWall.y === 0 ? lastWall.height : 0;
    const gapEndY = lastWall.y === 0 ? canvas.height : canvas.height - lastWall.height;

    const currentWallY = newWall.y;
    const currentWallHeight = newWall.height;
    const currentAttachTop = newWall.y === 0;

    // Вычисляем перекрытие по вертикали
    let freeTop = Math.max(
      lastWall.y === 0 ? lastWall.height : 0,
      currentAttachTop ? newWall.height : 0
    );
    let freeBottom = Math.min(
      lastWall.y === 0 ? canvas.height : canvas.height - lastWall.height,
      currentAttachTop ? canvas.height : canvas.height - newWall.height
    );

    const availableHeight = freeBottom - freeTop;
    const batteryHeight = 30;

    if (availableHeight > batteryHeight + 10) {
      const batteryY = freeTop + Math.floor(Math.random() * (availableHeight - batteryHeight));
      batteries.push({
        x: canvas.width - 150, // центр между двумя стенами (~150px назад)
        y: batteryY,
        width: 30,
        height: 30
      });
    }
  }
}



function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function endGame(won) {
  gameRunning = false;
  clearInterval(intervalId);
  if (won) {
    switchScreen(gameScreen, resultScreen);
    resultText.textContent = `Имя: ${playerName}, Время: ${timeDisplay.textContent}`;
  } else {
    switchScreen(gameScreen, loseScreen);
  }
}

function restartGame() {
  switchScreen(resultScreen, welcomeScreen);
  switchScreen(loseScreen, welcomeScreen);
}

function switchScreen(from, to) {
  from.classList.remove('active');
  to.classList.add('active');
}
