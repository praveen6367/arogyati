/* AROGYATI — About: vision and mission. The section pins; a field of particles gathers into a heart for the
   vision ("to serve society"), then flows and regathers into the Arogyati name for the mission. The cursor pushes
   the particles aside; they drift back. 2D canvas, no WebGL needed. */
/* team cards: on phones the long bios open with a button */
document.querySelectorAll('.tmf__more').forEach((b) => b.addEventListener('click', () => { const c = b.closest('.tmf'), o = !c.classList.contains('is-open'); c.classList.toggle('is-open', o); b.setAttribute('aria-expanded', String(o)); b.textContent = o ? 'Show less' : 'Read full bio'; if (window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 50); }));
(() => {
  const d = document, sec = d.querySelector('.avm'); if (!sec) return;
  const cv = sec.querySelector('.avm__cv'), ctx = cv.getContext('2d'), items = [...sec.querySelectorAll('.avm__item')], ticks = [...sec.querySelectorAll('.avm__ticks i')];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches, g = window.gsap;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const N = innerWidth < 600 ? 1700 : innerWidth < 900 ? 2800 : 3200;
  let W = 0, H = 0, DPR = 1, shapes = [[], []], P = [], cur = 0, vis = false, mx = -1e4, my = -1e4;

  // sample a drawing into N target points (with the drawing's own colour at each point)
  const sampleCanvas = (draw) => {
    const s = 360, c = d.createElement('canvas'); c.width = s; c.height = s; const x = c.getContext('2d'); draw(x, s);
    const im = x.getImageData(0, 0, s, s).data, pts = [];
    for (let y = 0; y < s; y += 2) for (let xx = 0; xx < s; xx += 2) { const i = (y * s + xx) * 4; if (im[i + 3] > 140) pts.push([xx / s - 0.5, y / s - 0.5, im[i], im[i + 1], im[i + 2]]); }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return Array.from({ length: N }, (_, i) => pts[i % pts.length]);
  };
  const heart = (x, s) => {
    const gr = x.createLinearGradient(0, 0, s, s); gr.addColorStop(0, '#E8705C'); gr.addColorStop(1, '#406CB4');
    x.fillStyle = gr; x.beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) { const px = 16 * Math.pow(Math.sin(t), 3), py = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); const X = s / 2 + px * s * 0.026, Y = s * 0.47 - py * s * 0.026; if (t === 0) x.moveTo(X, Y); else x.lineTo(X, Y); }
    x.fill();
  };
  const logo = (svgEl) => new Promise((res) => {
    const src = svgEl ? svgEl.outerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"') : null;
    if (!src) { res(null); return; }
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null);
    // brand colours for the particles: the leaf/letters group green, the text group blue (replace the existing fills, never add a second one)
    const svg = src.replace(/(class="az-lg-l"[^>]*?)fill="[^"]*"/g, '$1fill="#4F8A3F"').replace(/(class="az-lg-t"[^>]*?)fill="[^"]*"/g, '$1fill="#406CB4"');
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

  const resize = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  const scaleOf = () => (shapesWide[cur] ? W * 0.98 : Math.min(W, H) * 0.86);
  const shapesWide = [false, true];
  const target = (i) => { const s = shapes[cur][i], k = scaleOf(); return [W / 2 + s[0] * k * (shapesWide[cur] ? 1.4 : 1), H / 2 + s[1] * k * (shapesWide[cur] ? 1.4 : 1)]; };

  const setItem = (k) => {
    if (k === cur) return; const from = items[cur], to = items[k], dir = k > cur ? 1 : -1; cur = k;
    ticks.forEach((t, i) => t.classList.toggle('is-on', i === k));
    items.forEach((it) => it.setAttribute('aria-hidden', String(it !== to)));
    // scatter, then regather into the new shape
    P.forEach((p) => { const a = Math.random() * 6.283, f = 6 + Math.random() * 14; p.vx += Math.cos(a) * f; p.vy += Math.sin(a) * f - 4 * dir; p.delay = Math.random() * 0.5; });
    if (g && !RM) {
      g.to(from.children, { y: -18 * dir, opacity: 0, filter: 'blur(6px)', duration: 0.35, stagger: 0.03, ease: 'power2.in', onComplete: () => { from.classList.remove('is-on'); g.set(from.children, { clearProps: 'all' }); } });
      to.classList.add('is-on');
      g.fromTo(to.children, { y: 26 * dir, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95, stagger: 0.07, delay: 0.2, ease: 'expo.out', clearProps: 'filter' });
    } else { from.classList.remove('is-on'); to.classList.add('is-on'); }
  };

  const init = async () => {
    resize();
    const svg = d.querySelector('.az-head__logo svg'), im = await logo(svg);
    shapes[0] = sampleCanvas(heart);
    shapes[1] = im ? sampleCanvas((x, s) => { const r = im.width / im.height || 4, w = s * 0.96, h = w / r; x.drawImage(im, (s - w) / 2, (s - h) / 2, w, h); x.clearRect(0, (s - h) / 2 + h * 0.76, s, h); }) : shapes[0];
    P = shapes[0].map((s, i) => { const [tx, ty] = target(i); return { x: W / 2 + (Math.random() - 0.5) * W, y: H / 2 + (Math.random() - 0.5) * H, vx: 0, vy: 0, tx, ty, r: 0.7 + Math.random() * 1.1, ph: Math.random() * 6.283, delay: Math.random() * 0.8 }; });
    requestAnimationFrame(loop);
  };
  let last = 0;
  const loop = (now) => {
    requestAnimationFrame(loop);
    const r = sec.getBoundingClientRect(), len = Math.max(1, sec.offsetHeight - innerHeight), p = clamp(-r.top / len);
    setItem(p < 0.5 ? 0 : 1);
    if (!vis) return;
    const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0.016); last = t;
    ctx.clearRect(0, 0, W, H);
    const sh = shapes[cur], k = scaleOf(), wide = 1;
    for (let i = 0; i < P.length; i++) {
      const q = P[i], s = sh[i];
      if (q.delay > 0) { q.delay -= dt; }
      const tx = W / 2 + s[0] * k * wide + Math.sin(t * 0.9 + q.ph) * 1.6, ty = H / 2 + s[1] * k * wide + Math.cos(t * 0.8 + q.ph) * 1.6;
      const pull = q.delay > 0 ? 0.004 : 0.06;
      q.vx += (tx - q.x) * pull; q.vy += (ty - q.y) * pull;
      if (FINE) { const dx = q.x - mx, dy = q.y - my, dd = dx * dx + dy * dy; if (dd < 9000) { const f = (1 - dd / 9000) * 3.2; const l = Math.sqrt(dd) || 1; q.vx += (dx / l) * f; q.vy += (dy / l) * f; } }
      q.vx *= 0.86; q.vy *= 0.86; q.x += q.vx; q.y += q.vy;
      ctx.fillStyle = `rgba(${s[2]},${s[3]},${s[4]},${0.55 + 0.45 * Math.sin(t * 1.3 + q.ph) * 0.5 + 0.2})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill();
    }
  };
  addEventListener('resize', resize);
  if (FINE) { cv.addEventListener('pointermove', (e) => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; }, { passive: true }); cv.addEventListener('pointerleave', () => { mx = my = -1e4; }); }
  new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; }), { threshold: 0 }).observe(sec);
  let started = false;
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting && !started) { started = true; o.disconnect(); init(); } }), { rootMargin: '600px 0px' }).observe(sec);
})();
