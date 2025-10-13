const SnakeGame = (() => {
  let ctx, w, h, grid = 20;
  let snake, dir, food, loopId, score, stopCb, scoreCb, beep;
  let hue = 0; 


  function rndCell(max) { return Math.floor(Math.random() * max); }
  function placeFood() { food = { x: rndCell(w / grid), y: rndCell(h / grid) }; }
  function reset() { score = 0; snake = [{ x: 10, y: 10 }]; dir = { x: 1, y: 0 }; placeFood(); }


  function draw() {
    ctx.fillStyle = "#0b1530";
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(
      food.x * grid + grid / 2,
      food.y * grid + grid / 2,
      3,
      food.x * grid + grid / 2,
      food.y * grid + grid / 2,
      grid / 2
    );
    g2.addColorStop(0, "#fff");
    g2.addColorStop(1, `hsl(${(hue + 60) % 360}, 100%, 50%)`);
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(food.x * grid + grid / 2, food.y * grid + grid / 2, grid / 2.4, 0, Math.PI * 2);
    ctx.fill();

    snake.forEach((p, i) => {
      const color1 = `hsl(${(hue + i * 10) % 360}, 100%, 55%)`;
      const color2 = `hsl(${(hue + i * 10 + 40) % 360}, 100%, 40%)`;

      const gradient = ctx.createLinearGradient(
        p.x * grid, p.y * grid,
        p.x * grid + grid, p.y * grid + grid
      );
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      ctx.fillStyle = gradient;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(p.x * grid, p.y * grid, grid - 1, grid - 1, 5);
      ctx.fill();
      ctx.stroke();

   
      if (i === 0) {
        ctx.shadowColor = color1;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }

 
  function step() {
    hue = (hue + 3) % 360; 
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

   
    if (
      head.x < 0 || head.y < 0 ||
      head.x >= w / grid || head.y >= h / grid ||
      snake.some((p, i) => i && p.x === head.x && p.y === head.y)
    ) {
      gameOver();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreCb?.(score);
      beep(880, 0.05, "triangle", 0.07);
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  
  function key(e) {
    const k = e.key;
    if (k === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
    else if (k === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
    else if (k === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
    else if (k === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
  }


  function gameOver() {
    beep(160, 0.2, "sawtooth", 0.06);
    stop();
    stopCb?.(score);
  }

  
  function start(onStop, onScore, beepFn) {
    const cv = document.getElementById("snake");
    ctx = cv.getContext("2d");
    w = cv.width; h = cv.height;
    stopCb = onStop; scoreCb = onScore; beep = beepFn;
    reset(); draw();
    window.addEventListener("keydown", key);
    loopId = setInterval(step, 90);
    return stop;
  }

  function stop() {
    clearInterval(loopId);
    window.removeEventListener("keydown", key);
  }

  return { start, stop };
})();
