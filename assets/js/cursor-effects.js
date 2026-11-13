(() => {
  const STORAGE_KEY = "cursor-effects";
  const EFFECT_IDS = ["sparkles", "confetti", "comet", "fireflies", "bubbles", "orbit", "glyphs", "pixels", "aurora"];
  const GLYPHS = ["∑", "π", "λ", "∞", "∆", "∫", "μ", "Ω", "γ", "θ"];

  const state = {
    enabled: new Set(),
    particles: [],
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 },
    last: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    t: 0,
    orbitAngle: 0,
  };

  let canvas;
  let ctx;
  let menuOpen = false;

  const load = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      saved.filter((id) => EFFECT_IDS.includes(id)).forEach((id) => state.enabled.add(id));
    } catch (err) {
      state.enabled.clear();
    }
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.enabled]));
  };

  const spawn = (partial) => {
    state.particles.push({
      life: 1,
      decay: 0.02,
      x: state.mouse.x,
      y: state.mouse.y,
      vx: 0,
      vy: 0,
      size: 3,
      color: "#fff",
      shape: "circle",
      text: "",
      ...partial,
    });
    if (state.particles.length > 420) {
      state.particles.splice(0, state.particles.length - 420);
    }
  };

  const hueColor = (offset = 0) => `hsl(${(state.t * 80 + offset) % 360} 90% 60%)`;
  const rand = (min, max) => min + Math.random() * (max - min);

  const emitForMotion = (speed) => {
    const { x, y } = state.mouse;
    if (state.enabled.has("sparkles")) {
      spawn({
        x: x + rand(-8, 8),
        y: y + rand(-8, 8),
        vx: rand(-0.4, 0.4),
        vy: rand(-1.2, -0.2),
        size: rand(1.2, 3.2),
        decay: rand(0.018, 0.03),
        color: hueColor(rand(0, 80)),
        shape: "star",
      });
    }
    if (state.enabled.has("confetti") && speed > 0.6) {
      spawn({
        x,
        y,
        vx: rand(-2.4, 2.4),
        vy: rand(-3.5, -0.4),
        size: rand(3, 7),
        decay: 0.012,
        color: hueColor(rand(0, 280)),
        shape: "confetti",
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.25, 0.25),
      });
    }
    if (state.enabled.has("comet")) {
      spawn({
        x,
        y,
        vx: -state.mouse.vx * 0.08,
        vy: -state.mouse.vy * 0.08,
        size: Math.min(14, 4 + speed * 0.35),
        decay: 0.045,
        color: hueColor(),
        shape: "circle",
      });
    }
    if (state.enabled.has("bubbles") && Math.random() < 0.35) {
      spawn({
        x: x + rand(-10, 10),
        y: y + rand(-6, 6),
        vx: rand(-0.3, 0.3),
        vy: rand(-1.6, -0.6),
        size: rand(5, 12),
        decay: 0.008,
        color: "rgba(160, 220, 255, 0.7)",
        shape: "bubble",
      });
    }
    if (state.enabled.has("glyphs") && Math.random() < 0.22) {
      spawn({
        x: x + rand(-12, 12),
        y,
        vx: rand(-0.4, 0.4),
        vy: rand(0.6, 1.8),
        size: rand(10, 16),
        decay: 0.012,
        color: hueColor(140),
        shape: "text",
        text: GLYPHS[(Math.random() * GLYPHS.length) | 0],
      });
    }
    if (state.enabled.has("pixels")) {
      spawn({
        x: Math.round(x / 6) * 6,
        y: Math.round(y / 6) * 6,
        vx: 0,
        vy: 0,
        size: 6,
        decay: 0.04,
        color: hueColor(40),
        shape: "pixel",
      });
    }
  };

  const maintainCompanions = () => {
    if (state.enabled.has("fireflies") && state.t % 8 < 1) {
      spawn({
        x: state.mouse.x + rand(-28, 28),
        y: state.mouse.y + rand(-28, 28),
        vx: rand(-0.6, 0.6),
        vy: rand(-0.6, 0.6),
        size: rand(2, 4),
        decay: 0.01,
        color: "rgba(255, 214, 90, 0.95)",
        shape: "glow",
      });
    }
    if (state.enabled.has("orbit")) {
      state.orbitAngle += 0.08;
      for (let i = 0; i < 3; i += 1) {
        const angle = state.orbitAngle + (i * Math.PI * 2) / 3;
        const radius = 22 + i * 6;
        spawn({
          x: state.mouse.x + Math.cos(angle) * radius,
          y: state.mouse.y + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          size: 3.4 - i * 0.4,
          decay: 0.18,
          color: hueColor(i * 50),
          shape: "circle",
        });
      }
    }
    if (state.enabled.has("aurora")) {
      spawn({
        x: state.mouse.x,
        y: state.mouse.y,
        vx: Math.sin(state.t * 0.08) * 0.7,
        vy: -0.35,
        size: 18,
        decay: 0.03,
        color: hueColor(180),
        shape: "ribbon",
      });
    }
  };

  const drawParticle = (p) => {
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;
    if (p.shape === "star") {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.size);
      ctx.lineTo(p.x + p.size * 0.3, p.y);
      ctx.lineTo(p.x, p.y + p.size);
      ctx.lineTo(p.x - p.size * 0.3, p.y);
      ctx.closePath();
      ctx.fill();
    } else if (p.shape === "confetti") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot || 0);
      ctx.fillRect(-p.size * 0.35, -p.size * 0.7, p.size * 0.7, p.size * 1.4);
      ctx.restore();
    } else if (p.shape === "bubble") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = p.life * 0.25;
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === "text") {
      ctx.font = `${p.size}px Georgia, serif`;
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.shape === "pixel") {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.shape === "glow") {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      g.addColorStop(0, p.color);
      g.addColorStop(1, "rgba(255, 214, 90, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === "ribbon") {
      ctx.globalAlpha = p.life * 0.28;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.28, Math.sin(state.t * 0.1), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const tick = () => {
    state.t += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (state.enabled.size) {
      maintainCompanions();
    }
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.shape === "confetti") {
        p.vy += 0.12;
        p.rot += p.vr || 0;
      }
      if (p.shape === "bubble") {
        p.vx += Math.sin((state.t + p.x) * 0.02) * 0.02;
      }
      p.life -= p.decay;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
      } else {
        drawParticle(p);
      }
    }
    requestAnimationFrame(tick);
  };

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const syncMenu = () => {
    document.querySelectorAll("#fx-menu [data-fx]").forEach((input) => {
      input.checked = state.enabled.has(input.dataset.fx);
    });
  };

  const setMenuOpen = (open) => {
    menuOpen = open;
    const menu = document.getElementById("fx-menu");
    const toggle = document.getElementById("fx-toggle");
    if (!menu || !toggle) return;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const bindUi = () => {
    const toggle = document.getElementById("fx-toggle");
    const menu = document.getElementById("fx-menu");
    const clear = document.getElementById("fx-clear");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setMenuOpen(!menuOpen);
    });
    menu.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("click", () => setMenuOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    menu.querySelectorAll("[data-fx]").forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) state.enabled.add(input.dataset.fx);
        else state.enabled.delete(input.dataset.fx);
        save();
      });
    });
    if (clear) {
      clear.addEventListener("click", () => {
        state.enabled.clear();
        state.particles.length = 0;
        save();
        syncMenu();
      });
    }
    syncMenu();
  };

  const init = () => {
    load();
    canvas = document.createElement("canvas");
    canvas.id = "fx-layer";
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (event) => {
      state.mouse.vx = event.clientX - state.last.x;
      state.mouse.vy = event.clientY - state.last.y;
      state.mouse.x = event.clientX;
      state.mouse.y = event.clientY;
      const speed = Math.hypot(state.mouse.vx, state.mouse.vy);
      if (state.enabled.size) emitForMotion(speed);
      state.last.x = event.clientX;
      state.last.y = event.clientY;
    });
    bindUi();
    requestAnimationFrame(tick);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
