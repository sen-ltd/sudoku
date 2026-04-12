/**
 * Lightweight confetti animation — canvas-based, no dependencies.
 */

const PARTICLE_COUNT = 120;
const GRAVITY = 0.003;
const DRAG = 0.97;
const COLORS = ['#f5c26b', '#7cc4ff', '#9ae6b4', '#ff9ec7', '#c4b5fd', '#fca5a5'];

export function launchConfetti(container) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h * 0.3 - h * 0.1,
    vx: (Math.random() - 0.5) * 0.02,
    vy: Math.random() * 0.01 + 0.005,
    size: Math.random() * 6 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1,
    opacity: 1,
  }));

  let frame = 0;
  const maxFrames = 180;

  function animate() {
    frame++;
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.vy *= DRAG;
      p.x += p.vx * w;
      p.y += p.vy * h;
      p.rotation += p.rotSpeed;

      if (frame > maxFrames * 0.6) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  }

  requestAnimationFrame(animate);
}
