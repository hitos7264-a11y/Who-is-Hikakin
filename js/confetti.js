/* =====================================================================
   confetti.js - 純Canvas紙吹雪（外部CDN不要）
   ===================================================================== */
(function() {
  const COLORS = ["#d4af37", "#e8c968", "#c5392e", "#f7f3ec", "#a8862a", "#6b8e4e"];

  function ensureCanvas() {
    let c = document.getElementById("confetti-canvas");
    if (!c) {
      c = document.createElement("canvas");
      c.id = "confetti-canvas";
      document.body.appendChild(c);
    }
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    return c;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function fireConfetti(opts = {}) {
    const canvas = ensureCanvas();
    const ctx = canvas.getContext("2d");
    const count = opts.count || 140;
    const originX = canvas.width / 2;
    const originY = opts.originY || canvas.height * 0.35;

    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = rand(-Math.PI, 0); // 上方向に飛ばす
      const speed = rand(6, 14);
      particles.push({
        x: originX + rand(-30, 30),
        y: originY + rand(-10, 10),
        vx: Math.cos(angle) * speed * rand(0.6, 1.2),
        vy: Math.sin(angle) * speed * rand(0.8, 1.2),
        gravity: rand(0.18, 0.32),
        size: rand(6, 12),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: rand(0, Math.PI * 2),
        spin: rand(-0.3, 0.3),
        shape: Math.random() < 0.5 ? "rect" : "circle",
        life: 1.0
      });
    }

    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      particles.forEach(p => {
        p.vy += p.gravity;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.life -= 0.006;
        if (p.life > 0 && p.y < canvas.height + 40) {
          alive++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });
      frame++;
      if (alive > 0 && frame < 500) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    tick();
  }

  // 朱色リング波紋（不正解時の墨にじみとは別演出）
  function fireRingPulse(x, y, color) {
    const canvas = ensureCanvas();
    const ctx = canvas.getContext("2d");
    let radius = 10;
    let alpha = 0.7;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.strokeStyle = color || "#c5392e";
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      radius += 8;
      alpha -= 0.025;
      if (alpha > 0) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    tick();
  }

  window.addEventListener("resize", () => {
    const c = document.getElementById("confetti-canvas");
    if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
  });

  window.fireConfetti = fireConfetti;
  window.fireRingPulse = fireRingPulse;
})();
