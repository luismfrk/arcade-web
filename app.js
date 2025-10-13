const tabs = document.querySelectorAll(".tab");
const canvases = {
  snake: document.getElementById("snake"),
  pong:  document.getElementById("pong"),
  tetris:document.getElementById("tetris"),
};
const scoreEl = document.getElementById("score");
const highEl  = document.getElementById("highScore");
const resetHS = document.getElementById("resetHS");
const controlsEl = document.getElementById("controls");
const soundToggle = document.getElementById("soundToggle");

const AC = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AC();
let soundOn = true;
soundToggle.addEventListener("change", e => soundOn = e.target.checked);

function beep(freq=440, dur=0.07, type="square", gain=0.05){
  if(!soundOn) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}

function getKey(game){ return `arcade_hs_${game}`; }
function getHS(game){ return +(localStorage.getItem(getKey(game)) || 0); }
function setHS(game, v){ localStorage.setItem(getKey(game), String(v)); }

let currentGame = "snake";
function updateScoreUI(score=0){
  scoreEl.textContent = score;
  highEl.textContent  = getHS(currentGame);
}
resetHS.onclick = () => {
  ["snake","pong","tetris"].forEach(g => localStorage.removeItem(getKey(g)));
  updateScoreUI(0);
};

tabs.forEach(tab=>{
  tab.onclick=()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(canvases).forEach(c=>c.hidden=true);
    const id = tab.dataset.target;
    currentGame = id;
    canvases[id].hidden=false;
    stopAll();
    startGame(id);
  };
});

const help = {
  snake: `
    <div><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd></div>
    <small>Toque/arraste no mobile.</small>
  `,
  pong: `
    <div><kbd>W</kbd>/<kbd>S</kbd> (Esq) &nbsp; • &nbsp; <kbd>↑</kbd>/<kbd>↓</kbd> (Dir)</div>
    <small>1 jogador vs CPU.</small>
  `,
  tetris: `
    <div><kbd>←</kbd> <kbd>→</kbd> mover • <kbd>↑</kbd> girar • <kbd>↓</kbd> cair</div>
    <small>Espaço: queda rápida</small>
  `
};
function setControls(game){ controlsEl.innerHTML = help[game]; }

let stopFns = {};
function startGame(id){
  updateScoreUI(0);
  setControls(id);
  const onScore = (s)=>{
    updateScoreUI(s);
    if(s>getHS(id)){ setHS(id,s); updateScoreUI(s); }
  };
  const onStop = (finalScore)=> {
    if(finalScore>getHS(id)){ setHS(id,finalScore); }
    updateScoreUI(finalScore);
  };
  if(id==="snake") stopFns.snake = SnakeGame.start(onStop,onScore,beep);
  if(id==="pong")  stopFns.pong  = PongGame.start(onStop,onScore,beep);
  if(id==="tetris")stopFns.tetris= TetrisGame.start(onStop,onScore,beep);
}
function stopAll(){
  Object.values(stopFns).forEach(fn=>fn && fn());
  stopFns = {};
}

canvases.snake.hidden=false;
setControls("snake");
updateScoreUI(0);
startGame("snake");

document.querySelectorAll("canvas").forEach(cv=>{
  let paused=false;
  cv.addEventListener("pointerdown", ()=>{
    const game = currentGame;
    if(!stopFns[game]) return;
    if(!paused){
      stopFns[game](); paused=true; stopFns[game]=null;
    }else{
      startGame(game); paused=false;
    }
  });
});
