// Controla os jogos e o som
let currentGame = null;
let score = 0;
let highScore = parseInt(localStorage.getItem("arcadeHS") || "0");
const scoreEl = document.getElementById("score");
const hsEl = document.getElementById("highScore");
hsEl.textContent = highScore;

function beep(freq, dur, type = "square", vol = 0.05) {
  if (!document.getElementById("soundToggle").checked) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = vol;
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

function updateScore(s) {
  score = s;
  scoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    hsEl.textContent = highScore;
    localStorage.setItem("arcadeHS", highScore);
  }
}

function stopGame() {
  if (currentGame) currentGame.stop();
  currentGame = null;
}

function startGame(id) {
  stopGame();
  document.querySelectorAll("canvas").forEach(c => c.hidden = true);
  document.getElementById(id).hidden = false;
  const game = { snake: SnakeGame, pong: PongGame, tetris: TetrisGame, mario: MarioGame }[id];
  currentGame = game;
  score = 0;
  scoreEl.textContent = "0";
  game.start(stopGame, updateScore, beep);
}

// alterna abas
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    startGame(btn.dataset.target);
  });
});

// reset recorde
document.getElementById("resetHS").onclick = () => {
  localStorage.removeItem("arcadeHS");
  hsEl.textContent = "0";
};

// inicia com Snake
startGame("snake");
