const TetrisGame = (()=>{
  const W=10, H=20, SCALE=24;
  let ctx, grid, piece, nextTick, score, stopCb, scoreCb, beep, timer, running;

  const SHAPES = {
    I:[[1,1,1,1]], O:[[1,1],[1,1]], T:[[0,1,0],[1,1,1]],
    S:[[0,1,1],[1,1,0]], Z:[[1,1,0],[0,1,1]],
    J:[[1,0,0],[1,1,1]], L:[[0,0,1],[1,1,1]]
  };
  const COLORS = { I:"#20e3ff", O:"#ffd300", T:"#c77dff", S:"#00e0a4", Z:"#ff5d73", J:"#5cb6ff", L:"#ffa94d" };

  function newGrid(){ return Array.from({length:H},()=>Array(W).fill(0)); }
  function randomPiece(){
    const keys = Object.keys(SHAPES);
    const k = keys[Math.floor(Math.random()*keys.length)];
    return { k, m: SHAPES[k].map(r=>[...r]), x:3, y:0, c: COLORS[k] };
  }
  function rotate(m){
    const rows=m.length, cols=m[0].length;
    const res = Array.from({length:cols},()=>Array(rows).fill(0));
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) res[c][rows-1-r]=m[r][c];
    return res;
  }
  function collide(g,p){
    for(let r=0;r<p.m.length;r++)
      for(let c=0;c<p.m[0].length;c++)
        if(p.m[r][c]){
          const x=p.x+c, y=p.y+r;
          if(x<0||x>=W||y>=H||(y>=0&&g[y][x])) return true;
        }
    return false;
  }
  function merge(g,p){
    for(let r=0;r<p.m.length;r++)
      for(let c=0;c<p.m[0].length;c++)
        if(p.m[r][c]){
          const y=p.y+r, x=p.x+c;
          if(y>=0) g[y][x]=p.c;
        }
  }
  function clearLines(){
    let cleared=0;
    for(let y=H-1;y>=0;y--){
      if(grid[y].every(v=>v!==0)){
        grid.splice(y,1); grid.unshift(Array(W).fill(0));
        cleared++; y++;
      }
    }
    if(cleared){
      score += 100*cleared; scoreCb?.(score);
      beep(900,0.05,"triangle",0.06);
    }
  }
  function draw(){
    const cv=document.getElementById("tetris");
    ctx=cv.getContext("2d");
    ctx.fillStyle="#0b1530"; ctx.fillRect(0,0,cv.width,cv.height);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(grid[y][x]) drawCell(x,y,grid[y][x]);
    for(let r=0;r<piece.m.length;r++) for(let c=0;c<piece.m[0].length;c++)
      if(piece.m[r][c]) drawCell(piece.x+c,piece.y+r,piece.c);
  }
  function drawCell(x,y,color){
    ctx.fillStyle=color; ctx.fillRect(x*SCALE,y*SCALE,SCALE,SCALE);
    ctx.strokeStyle="rgba(255,255,255,.12)";
    ctx.strokeRect(x*SCALE,y*SCALE,SCALE,SCALE);
  }
  function drop(){
    piece.y++;
    if(collide(grid,piece)){
      piece.y--; merge(grid,piece); clearLines();
      piece=randomPiece(); if(collide(grid,piece)){ gameOver(); return; }
    }
    draw();
  }
  function key(e){
    if(!running) return;
    if(e.key==="ArrowLeft" && !collide(grid,{...piece,x:piece.x-1})) piece.x--;
    else if(e.key==="ArrowRight"&& !collide(grid,{...piece,x:piece.x+1})) piece.x++;
    else if(e.key==="ArrowDown") drop();
    else if(e.key==="ArrowUp"){
      const rot=rotate(piece.m);
      if(!collide(grid,{...piece,m:rot})) piece.m=rot;
    } else if(e.key===" "){ while(!collide(grid,{...piece,y:piece.y+1})) piece.y++; drop(); }
    draw();
  }
  function gameOver(){ beep(220,0.25,"sawtooth",0.05); stop(); stopCb?.(score); }
  function start(onStop,onScore,beepFn){
    grid=newGrid(); piece=randomPiece(); score=0; running=true;
    stopCb=onStop; scoreCb=onScore; beep=beepFn;
    draw(); window.addEventListener("keydown",key);
    timer=setInterval(drop,600); return stop;
  }
  function stop(){ running=false; window.removeEventListener("keydown",key); clearInterval(timer); }

  return { start, stop };
})();
