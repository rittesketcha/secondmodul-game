let playerName = '';
let gameRunning = false;
let batteryLevel = 50;
let elapsedTime = 0;
let intervalId;

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

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

nameInput.addEventListener('input', () => {
  startBtn.disabled = nameInput.value.trim() === '';
});

startBtn.addEventListener('click', () => {
  playerName = nameInput.value;
  startGame();
});

restartBtn.addEventListener('click', () => {
  restartGame();
});

restartBtnLose.addEventListener('click', () => {
  restartGame();
});

function startGame() {
  switchScreen(welcomeScreen, gameScreen);
  displayName.textContent = playerName;
  gameRunning = true;
  batteryLevel = 50;
  elapsedTime = 0;
  updateHUD();
  intervalId = setInterval(gameLoop, 1000);
}

function gameLoop() {
  if (!gameRunning) return;
  elapsedTime++;
  batteryLevel -= 1;
  updateHUD();

  if (batteryLevel <= 0) {
    endGame(false);
  }
}

function updateHUD() {
  let mins = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  let secs = String(elapsedTime % 60).padStart(2, '0');
  timeDisplay.textContent = `${mins}:${secs}`;
  powerDisplay.textContent = `Power: ${batteryLevel}%`;
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
