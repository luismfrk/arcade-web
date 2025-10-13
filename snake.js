const SnakeGame = (()=>{
  let ctx, w, h, grid=20;
  let snake, dir, food, loopId, score, stopCb, scoreCb, beep;

  function rndCell(max){ return Math.floor(Math.random()*max); }
  function placeFood(){
    food = { x: rndCell(w/grid), y: rndCell(h/grid) };
  }
  function reset(){
    score=0;
    snake=[{x:10,y:10}];
    dir={x:1,y:0};
    placeFood();
  }

  function draw(){
    ctx.fillStyle="#0b1530";
    ctx.fillRect(0,0,w,h);

    ctx.fillStyle="#00e0a4";
    ctx.beginPath();
    ctx.roundRect(food.x*grid+2, food.y*grid+2, grid-4, grid-4, 5);
    ctx.fill();

    ctx.fillStyle="#9ad0ff";
    snake.forEach((p,i)=>{
      ctx.beginPath();
      ctx.roundRect(p.x*grid+1, p.y*grid+1, grid-2, grid-2, 6);
      ctx.fill();
      if(i===0){
        ctx.fillStyle="#fff";
        ctx.fillRect(p.x*grid+6, p.y*grid+6, 3,3);
        ctx.fillRect(p.x*grid+grid-9, p.y*grid+6, 3,3);
        ctx.fillStyle="#9ad0ff";
      }
    });

    ctx.strokeStyle="rgba(248, 220, 63, 1)";
    ctx.lineWidth=1;
    for(let x=grid; x<w; x+=grid){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for(let y=grid; y<h; y+=grid){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  }

  function step(){
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if(head.x<0||head.y<0||head.x>=w/grid||head.y>=h/grid){ gameOver(); return; }
    if(snake.some((p,i)=>i&&p.x===head.x&&p.y===head.y)){ gameOver(); return; }

    snake.unshift(head);

    if(head.x===food.x && head.y===food.y){
      score+=10; scoreCb?.(score); beep(880,0.06,"triangle",0.07);
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function key(e){
    const k=e.key;
    if(k==="ArrowLeft" && dir.x!==1){ dir={x:-1,y:0}; }
    else if(k==="ArrowRight"&& dir.x!==-1){ dir={x:1,y:0}; }
    else if(k==="ArrowUp"   && dir.y!==1){ dir={x:0,y:-1}; }
    else if(k==="ArrowDown" && dir.y!==-1){ dir={x:0,y:1}; }
  }

  function gameOver(){
    beep(160,0.2,"sawtooth",0.06);
    stop();
    stopCb?.(score);
  }

  function start(onStop,onScore,beepFn){
    const cv = document.getElementById("snake");
    ctx = cv.getContext("2d"); w=cv.width; h=cv.height;
    stopCb=onStop; scoreCb=onScore; beep=beepFn;
    reset(); draw();
    window.addEventListener("keydown",key);
    loopId = setInterval(step, 90);
    addTouchControls(cv);
    return stop;
  }

  function stop(){
    clearInterval(loopId);
    window.removeEventListener("keydown",key);
  }

  function addTouchControls(cv) {
    let startX=0, startY=0;
    cv.addEventListener("touchstart", e=>{
      const t=e.touches[0];
      startX=t.clientX; startY=t.clientY;
    });
    cv.addEventListener("touchmove", e=>{
      const t=e.touches[0];
      const dx=t.clientX - startX;
      const dy=t.clientY - startY;
      if(Math.abs(dx)>Math.abs(dy)){
        if(dx>20 && dir.x!==-1){ dir={x:1,y:0}; }
        else if(dx<-20 && dir.x!==1){ dir={x:-1,y:0}; }
      } else {
        if(dy>20 && dir.y!==-1){ dir={x:0,y:1}; }
        else if(dy<-20 && dir.y!==1){ dir={x:0,y:-1}; }
      }
      startX=t.clientX; startY=t.clientY;
    });
  }

  return { start, stop };
})();
