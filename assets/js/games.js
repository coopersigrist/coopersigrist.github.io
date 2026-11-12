(() => {
  const canvas = document.getElementById("photon-game");
  const status = document.getElementById("photon-status");
  const resetBtn = document.getElementById("photon-reset");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const state = {
    running: true,
    score: 0,
    player: { x: 120, y: 210, r: 12, a: 0 },
    photons: [],
    clouds: [],
    t: 0,
  };

  const rand = (min, max) => min + Math.random() * (max - min);

  const reset = () => {
    state.running = true;
    state.score = 0;
    state.t = 0;
    state.photons = [];
    state.clouds = [];
    state.player.x = canvas.width * 0.2;
    state.player.y = canvas.height * 0.5;
    status.textContent = "Score 0";
  };

  const spawnPhoton = () => {
    state.photons.push({
      x: canvas.width + 12,
      y: rand(24, canvas.height - 24),
      r: 6,
      vx: rand(-4.2, -2.6),
    });
  };

  const spawnCloud = () => {
    const r = rand(16, 28);
    const bumps = [];
    for (let i = 0; i < 7; i += 1) bumps.push(0.75 + Math.random() * 0.45);
    state.clouds.push({
      x: canvas.width + 28,
      y: rand(30, canvas.height - 30),
      r,
      vx: rand(-3.2, -1.6),
      spin: rand(-0.03, 0.03),
      a: rand(0, Math.PI * 2),
      bumps,
    });
  };

  const hit = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r * 0.82;

  const drawAsteroid = (rock) => {
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(rock.a);
    ctx.fillStyle = "#8a8174";
    ctx.beginPath();
    rock.bumps.forEach((scale, i) => {
      const angle = (i / rock.bumps.length) * Math.PI * 2;
      const x = Math.cos(angle) * rock.r * scale;
      const y = Math.sin(angle) * rock.r * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawShip = () => {
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.fillStyle = state.running ? "#d7ecff" : "#ff8b8b";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const tick = () => {
    state.t += 1;
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "#070b18");
    g.addColorStop(1, "#161022");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.running) {
      if (state.t % 28 === 0) spawnPhoton();
      if (state.t % 46 === 0) spawnCloud();

      state.photons.forEach((p) => {
        p.x += p.vx;
      });
      state.clouds.forEach((c) => {
        c.x += c.vx;
        c.y += Math.sin((state.t + c.x) * 0.03) * 0.45;
        c.a += c.spin;
      });
      state.photons = state.photons.filter((p) => p.x > -20);
      state.clouds = state.clouds.filter((c) => c.x > -40);

      for (let i = state.photons.length - 1; i >= 0; i -= 1) {
        if (hit(state.player, state.photons[i])) {
          state.photons.splice(i, 1);
          state.score += 1;
          status.textContent = `Score ${state.score}`;
        }
      }
      if (state.clouds.some((c) => hit(state.player, c))) {
        state.running = false;
        status.textContent = `Hit an asteroid — final score ${state.score}`;
      }
    }

    state.photons.forEach((p) => {
      ctx.fillStyle = "#ffe27a";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    state.clouds.forEach(drawAsteroid);
    drawShip();
    requestAnimationFrame(tick);
  };

  canvas.addEventListener("mousemove", (event) => {
    if (!state.running) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const nx = Math.min(canvas.width - 12, Math.max(12, (event.clientX - rect.left) * scaleX));
    const ny = Math.min(canvas.height - 12, Math.max(12, (event.clientY - rect.top) * scaleY));
    state.player.a = Math.atan2(ny - state.player.y, nx - state.player.x);
    state.player.x = nx;
    state.player.y = ny;
  });

  if (resetBtn) resetBtn.addEventListener("click", reset);
  reset();
  requestAnimationFrame(tick);
})();
