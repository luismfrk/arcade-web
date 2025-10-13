const SnakeGame = (()=>{
  let ctx, w, h, grid=20;
  let snake, dir, food, loopId, score, stopCb, scoreCb, beep;

  function rndCell(max){ return Math.floor(Math.random()*max); }
  function placeFood(){ food = { x: rndCell(w/grid), y: rndCell(h/grid) }; }
  function reset(){ score=0; snake=[{x:10,y:10}]; dir={x:1,y:0}; placeFood(); }

  function draw(){
    ctx.fillStyle="#0b1530";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#00e0a4";
    ctx.fillRect(food.x*grid, food.y*grid, grid, grid);
    ctx.fillStyle="#9ad0ff";
    snake.forEach(p=>ctx.fillRect(p.x*grid, p.y*grid, grid-1, grid-1));
  }

  function step(){
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if(head.x<0||head.y<0||head.x>=w/grid||head.y>=h/grid||snake.some((p,i)=>i&&p.x===head.x&&p.y===head.y)){
      gameOver(); return;
    }
    snake.unshift(head);
    if(head.x===food.x && head.y===food.y){ score+=10; scoreCb?.(score); beep(880,0.05,"triangle",0.07); placeFood(); }
    else snake.pop();
    draw();
  }

  function key(e){
    const k=e.key;
    if(k==="ArrowLeft" && dir.x!==1){ dir={x:-1,y:0}; }
    else if(k==="ArrowRight"&& dir.x!==-1){ dir={x:1,y:0}; }
    else if(k==="ArrowUp"   && dir.y!==1){ dir={x:0,y:-1}; }
    else if(k==="ArrowDown" && dir.y!==-1){ dir={x:0,y:1}; }
  }

  function gameOver(){ beep(160,0.2,"sawtooth",0.06); stop(); stopCb?.(score); }

  function start(onStop,onScore,beepFn){
    const cv = document.getElementById("snake");
    ctx = cv.getContext("2d"); w=cv.width; h=cv.height;
    stopCb=onStop; scoreCb=onScore; beep=beepFn;
    reset(); draw();
    window.addEventListener("keydown",key);
    loopId = setInterval(step, 90);
    return stop;
  }

  function stop(){
    clearInterval(loopId);
    window.removeEventListener("keydown",key);
  }

  return { start, stop };
})();
