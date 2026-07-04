(function () {
  const canvas = document.getElementById('fire-canvas');
  const ctx = canvas.getContext('2d');
  const coverB = document.getElementById('cover-b');
  const coverC = document.getElementById('cover-c');
  const textZh = document.getElementById('text-zh');
  const enterHint = document.getElementById('enter-hint');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let particles = [];
  let step = 0;                 // 0=初始(B), 1=已到C
  let bottomFire = true;        // 底部火焰：初始就开启
  let fireBoost = false;        // 点击后加速

  const colors = [
    '#fff4b8', '#ffd166', '#ff9f1c', '#ff6b35',
    '#d62828', '#8a1a06',
    '#5a1203', '#3d0c02', '#241010', '#1a0a0a'
  ];

  class Particle {
    constructor(x, y, opts = {}) {
      this.x = x;
      this.y = y;
      this.vx = opts.vx != null ? opts.vx : (Math.random() - 0.5) * 0.6;
      this.vy = opts.vy != null ? opts.vy : -Math.random() * 1.2 - 0.4;
      this.size = opts.size != null ? opts.size : Math.random() * 2.5 + 1;
      this.life = 1;
      this.decay = opts.decay != null ? opts.decay : Math.random() * 0.02 + 0.012;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy -= 0.01;
      this.vx *= 0.98;
      this.life -= this.decay;
      this.size *= 0.99;
    }
    draw() {
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(this.size, 0.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let mouseMoving = false;
  let moveTimer = null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseMoving = true;

    for (let i = 0; i < 4; i++) {
      particles.push(new Particle(
        mouseX + (Math.random() - 0.5) * 12,
        mouseY + (Math.random() - 0.5) * 12,
        { size: Math.random() * 3.5 + 1.5, decay: Math.random() * 0.025 + 0.018 }
      ));
    }

    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => { mouseMoving = false; }, 120);
  });

  function spawnMouseIdleFire() {
    if (mouseMoving) return;
    if (Math.random() < 0.6) {
      particles.push(new Particle(
        mouseX + (Math.random() - 0.5) * 5,
        mouseY + (Math.random() - 0.5) * 5,
        { size: Math.random() * 1.6 + 0.6, decay: Math.random() * 0.03 + 0.025 }
      ));
    }
  }

  function spawnBottomFire() {
    if (!bottomFire) return;
    const count = fireBoost ? 12 : 6;
    const speedMul = fireBoost ? 1.8 : 1;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      particles.push(new Particle(x, canvas.height + 5, {
        vx: (Math.random() - 0.5) * 0.4,
        vy: (-Math.random() * 2 - 1) * speedMul,
        size: Math.random() * 3 + 1.5,
        decay: Math.random() * 0.01 + 0.006
      }));
    }
  }

  // 点击：B → C（只需一次点击）
  function nextStep() {
    if (step === 0) {
      coverB.classList.add('hidden');
      coverC.classList.remove('hidden');
      fireBoost = true;
      setTimeout(() => {
        textZh.classList.remove('hidden');
        textZh.classList.add('reveal');
        if (enterHint) {
          enterHint.classList.remove('hidden');
          enterHint.classList.add('reveal');
        }
      }, 800);
      step = 1;
    }
  }

  document.addEventListener('click', nextStep);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    spawnMouseIdleFire();
    spawnBottomFire();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.life <= 0 || p.size <= 0.1) particles.splice(i, 1);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
})();