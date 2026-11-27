/* AROGYATI — advanced modalities. The section pins; scrolling brings each machine's reel up over the one before
   (the one underneath settles back and dims), and the copy on the left changes with it. A landscape film runs
   under a white veil behind everything. */
(() => {
  const d = document, sec = d.querySelector('.mdx'); if (!sec) return;
  const $$ = (s) => [...sec.querySelectorAll(s)];
  const cards = $$('.mdx-card'), items = $$('.mdx__item'), ticks = $$('.mdx__ticks i'), bg = sec.querySelector('.mdx__bg video');
  const N = cards.length, g = window.gsap, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const bn = sec.querySelector('.mdx__bname');
  const vids = cards.map((c) => c.querySelector('video'));
  const dims = cards.map((c) => { const i = d.createElement('i'); i.className = 'mdx-card__dim'; c.appendChild(i); return i; });
  const load = (v) => { if (v && !v.getAttribute('src')) v.src = v.dataset.src; };
  const play = (v) => { if (!v) return; load(v); const p = v.play(); if (p) p.catch(() => {}); };

  let cur = 0, vis = false;
  const setItem = (k) => {
    if (k === cur) return; const from = items[cur], to = items[k], dir = k > cur ? 1 : -1; cur = k;
    ticks.forEach((t, i) => t.classList.toggle('is-on', i === k));
    if (bn) { bn.querySelector('span').textContent = String(k + 1).padStart(2, '0'); const nb = bn.querySelector('b'); nb.textContent = to.querySelector('.mdx__name').textContent; if (g && !RM) g.fromTo(bn, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }); }
    items.forEach((it) => it.setAttribute('aria-hidden', String(it !== to)));
    if (g && !RM) {
      g.killTweensOf([from, to, ...from.children, ...to.children]);
      g.to(from.children, { y: -18 * dir, opacity: 0, filter: 'blur(6px)', duration: 0.35, stagger: 0.03, ease: 'power2.in', onComplete: () => { from.classList.remove('is-on'); g.set(from.children, { clearProps: 'all' }); } });
      to.classList.add('is-on');
      g.fromTo(to.children, { y: 26 * dir, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, delay: 0.2, ease: 'expo.out', clearProps: 'filter' });
    } else { from.classList.remove('is-on'); to.classList.add('is-on'); }
    if (vis) vids.forEach((v, i) => { if (i === k) play(v); else if (v) v.pause(); });
  };

  const frame = () => {
    const r = sec.getBoundingClientRect(), len = Math.max(1, sec.offsetHeight - innerHeight), p = clamp(-r.top / len), s = p * (N - 1);
    const t = cards.map((c, i) => (i === 0 ? 1 : ease(clamp((clamp(s - (i - 1)) - 0.12) / 0.66))));
    let k = 0;
    cards.forEach((c, i) => {
      let depth = 0; for (let j = i + 1; j < N; j++) depth += t[j];
      const ti = t[i], y = (1 - ti) * 104, rot = 0, sc = 1 - Math.min(depth, 1.5) * 0.07;
      c.style.transform = `translate3d(0,${y.toFixed(3)}%,0) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
      c.style.visibility = ti <= 0.001 ? 'hidden' : 'visible';
      dims[i].style.opacity = (Math.min(depth, 1.2) * 0.45).toFixed(3);
      if (ti > 0.5) k = i;
    });
    setItem(k);
  };
  let raf = 0;
  const loop = () => { raf = vis ? requestAnimationFrame(loop) : 0; frame(); };
  frame();
  new IntersectionObserver((es) => es.forEach((e) => {
    vis = e.isIntersecting;
    if (vis) { if (!raf) raf = requestAnimationFrame(loop); play(bg); play(vids[cur]); }
    else { if (bg) bg.pause(); vids.forEach((v) => v && v.pause()); }
  }), { threshold: 0.01 }).observe(sec);
  // fetch the first reel and the backdrop a little before the section arrives
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { load(bg); load(vids[0]); o.disconnect(); } }), { rootMargin: '800px 0px' }).observe(sec);
})();
