const PongGame = (()=>{
  let ctx,w,h,ball,p1,p2,score,stopCb,scoreCb,beep,anim;

  function reset(){
    score=0;
    ball={x:50,y:50,vx:3,vy:2,r:7};
    p1={x:10,y:50,w:10,h:70,vy:0};
    p2={x:0,y:50,w:10,h:70,vy:0};
  }

  function resize(){
    const cv = document.getElementById("pong");
    ctx=cv.getContext("2d"); w=cv.width; h=cv.height;
    p2.x = w-20;
  }

  function draw(){
    ctx.fillStyle="#0b1530"; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="rgba(255,255,255,.2)";
    ctx.setLineDash([8,8]);
    ctx.beginPath(); ctx.moveTo(w/2,0); ctx.lineTo(w/2,h); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle="#9ad0ff"; ctx.fillRect(p1.x,p1.y,p1.w,p1.h);
    ctx.fillStyle="#00e0a4"; ctx.fillRect(p2.x,p2.y,p2.w,p2.h);
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="20px system-ui"; ctx.fillText(`Pontos: ${score}`, 10, 24);
  }

  function step(){
    const target = ball.y - (p1.h/2);
    p1.y += Math.sign(target - p1.y) * 3;
    p1.y = Math.max(0, Math.min(h-p1.h, p1.y));
    p2.y += p2.vy;
    p2.y = Math.max(0, Math.min(h-p2.h, p2.y));
    ball.x += ball.vx; ball.y += ball.vy;
    if(ball.y-ball.r<=0 || ball.y+ball.r>=h){ ball.vy*=-1; beep(600,0.05,"square",0.05); }
    if(ball.x-ball.r<=p1.x+p1.w && ball.y>p1.y && ball.y<p1.y+p1.h && ball.vx<0){ ball.vx*=-1.05; beep(720,0.04,"triangle",0.06); }
    if(ball.x+ball.r>=p2.x && ball.y>p2.y && ball.y<p2.y+p2.h && ball.vx>0){ ball.vx*=-1.05; score++; scoreCb?.(score); beep(800,0.05,"triangle",0.07); }
    if(ball.x> w+40){ gameOver(); return; }
    if(ball.x< -40){ reset(); resize(); }
    draw();
    anim = requestAnimationFrame(step);
  }

  function key(e){
    if(e.type==="keydown"){
      if(e.key==="ArrowUp") p2.vy = -6;
      if(e.key==="ArrowDown") p2.vy = 6;
    }else{
      if(e.key==="ArrowUp" || e.key==="ArrowDown") p2.vy = 0;
    }
  }

  function gameOver(){ beep(200,0.25,"sawtooth",0.05); stop(); stopCb?.(score); }

  function start(onStop,onScore,beepFn){
    reset(); resize(); stopCb=onStop; scoreCb=onScore; beep=beepFn;
    window.addEventListener("keydown",key);
    window.addEventListener("keyup",key);
    step();
    return stop;
  }

  function stop(){
    cancelAnimationFrame(anim);
    window.removeEventListener("keydown",key);
    window.removeEventListener("keyup",key);
  }

  return { start, stop };
})();
