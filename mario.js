const MarioGame = (() => {
  let ctx, w, h, keys = {};
  let player, platforms, coins, cameraX = 0;
  let gravity = 0.6, jumpPower = -12, onGround = false;
  let stopCb, scoreCb, beep, loopId, score = 0;
  const worldWidth = 2000; // mundo mais largo para rolagem

  // === Setup inicial ===
  function setup() {
    const cv = document.getElementById("mario");
    ctx = cv.getContext("2d");
    w = cv.width; h = cv.height;

    player = { x: 50, y: h - 80, w: 32, h: 40, vy: 0 };
    platforms = [
      { x: 0, y: h - 20, w: worldWidth, h: 20 },
      { x: 150, y: h - 100, w: 100, h: 15 },
      { x: 400, y: h - 150, w: 120, h: 15 },
      { x: 700, y: h - 200, w: 120, h: 15 },
      { x: 1000, y: h - 180, w: 100, h: 15 },
      { x: 1300, y: h - 140, w: 100, h: 15 },
      { x: 1600, y: h - 100, w: 100, h: 15 },
    ];

    // 🪙 moedas animadas
    coins = [];
    for (let i = 0; i < 20; i++) {
      const px = 100 + i * 90 + (Math.random() * 50);
      const py = h - 150 - (Math.random() * 100);
      coins.push({ x: px, y: py, r: 6, collected: false, frame: 0 });
    }
  }

  // === Desenhar cenário ===
  function draw() {
    // fundo com céu e chão
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#65c7ff");
    grad.addColorStop(1, "#0b1530");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // 🌳 colinas no fundo
    ctx.fillStyle = "#153060";
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      const hillX = i * 300;
      ctx.arc(hillX, h - 20, 120, 0, Math.PI, true);
      ctx.fill();
    }

    // 🧱 plataformas
    ctx.fillStyle = "#00e0a4";
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // 🪙 moedas animadas
    coins.forEach(c => {
      if (!c.collected) {
        const pulse = Math.sin(c.frame / 8) * 2;
        const color = `hsl(${(c.frame * 5) % 360},100%,50%)`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(c.x, c.y + pulse, c.r, 0, Math.PI * 2);
        ctx.fill();
        c.frame++;
      }
    });

    // 🍄 jogador
    const g2 = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.h);
    g2.addColorStop(0, "#ffb347");
    g2.addColorStop(1, "#ffcc33");
    ctx.fillStyle = g2;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.strokeRect(player.x, player.y, player.w, player.h);

    ctx.restore();

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "16px system-ui";
    ctx.fillText(`Moedas: ${score}`, 10, 22);
  }

  // === Atualizar física ===
  function update() {
    // gravidade
    player.vy += gravity;
    player.y += player.vy;
    player.x += (keys["ArrowRight"] ? 4 : 0) - (keys["ArrowLeft"] ? 4 : 0);

    // chão e plataformas
    onGround = false;
    for (const p of platforms) {
      if (player.x + player.w > p.x && player.x < p.x + p.w &&
        player.y + player.h > p.y && player.y + player.h < p.y + p.h) {
        player.y = p.y - player.h;
        player.vy = 0;
        onGround = true;
      }
    }

    // coletar moedas
    coins.forEach(c => {
      if (!c.collected &&
        player.x + player.w > c.x - c.r &&
        player.x < c.x + c.r &&
        player.y + player.h > c.y - c.r &&
        player.y < c.y + c.r) {
        c.collected = true;
        score++;
        beep(900, 0.05, "square", 0.06);
        scoreCb?.(score);
      }
    });

    // limites
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > worldWidth) player.x = worldWidth - player.w;

    // reiniciar se cair
    if (player.y > h) {
      beep(200, 0.2, "square", 0.1);
      score = 0;
      setup();
    }

    // câmera segue jogador
    cameraX = Math.max(0, player.x - w / 2);

    draw();
  }

  // === Controles ===
  function keyDown(e) {
    keys[e.key] = true;
    if ((e.key === "ArrowUp" || e.key === " ") && onGround) {
      player.vy = jumpPower;
      beep(700, 0.05, "triangle", 0.05);
    }
  }

  function keyUp(e) { keys[e.key] = false; }

  function loop() { update(); }

  // === iniciar/parar ===
  function start(onStop, onScore, beepFn) {
    stopCb = onStop; scoreCb = onScore; beep = beepFn;
    setup(); draw();
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    loopId = setInterval(loop, 20);
    return stop;
  }

  function stop() {
    clearInterval(loopId);
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  }

  return { start, stop };
})();
