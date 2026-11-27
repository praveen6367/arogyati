/* AROGYATI — Services: the service cards rise in as you reach them; the reels row plays what is in view (muted),
   with a sound toggle per reel, arrows, drag and a progress line on each film. */
(() => {
  const d = document, g = window.gsap, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- service cards ---------- */
  const grid = d.querySelector('.svx__grid');
  if (grid && g && window.ScrollTrigger && !RM) {
    g.from('.svx__h2, .svx__lede', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.svx', start: 'top 75%', once: true } });
    window.ScrollTrigger.batch('[data-svx-card]', { start: 'top 88%', once: true, onEnter: (els) => g.from(els, { y: 60, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', clearProps: 'transform,opacity' }) });
  }

  /* ---------- reels ---------- */
  const sec = d.querySelector('.rlx'); if (!sec) return;
  const track = sec.querySelector('.rlx__track'), cards = [...sec.querySelectorAll('.rlx-card')];
  const vids = cards.map((c) => c.querySelector('video'));
  // the row starts in line with the heading and runs off the right edge
  const head = sec.querySelector('.rlx__head'); const pad = () => track.style.setProperty('--rlx-pad', `${Math.round(head.getBoundingClientRect().left + parseFloat(getComputedStyle(head).paddingLeft || 0))}px`);
  pad(); addEventListener('resize', pad);
  let soundOn = -1, secVis = false;
  const load = (v) => { if (!v.getAttribute('src')) v.src = v.dataset.src; };
  const play = (v) => { load(v); const p = v.play(); if (p) p.catch(() => {}); };
  const inView = new Set();
  const sync = () => vids.forEach((v, i) => { if (secVis && inView.has(i) && !RM) play(v); else v.pause(); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { const i = cards.indexOf(e.target); if (e.intersectionRatio > 0.6) inView.add(i); else inView.delete(i); }) || sync(), { root: track, threshold: [0, 0.6, 1] });
  cards.forEach((c) => io.observe(c));
  new IntersectionObserver((es) => es.forEach((e) => { secVis = e.isIntersecting; sync(); }), { threshold: 0.15 }).observe(sec);
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { vids.slice(0, 4).forEach(load); o.disconnect(); } }), { rootMargin: '600px 0px' }).observe(sec);
  // one reel with sound at a time
  cards.forEach((c, i) => {
    const b = c.querySelector('.rlx-snd'), bar = c.querySelector('.rlx-card__bar b'), v = vids[i];
    const setSound = (on) => { vids.forEach((x, j) => { x.muted = !(on && j === i); cards[j].classList.toggle('is-sound', on && j === i); cards[j].querySelector('.rlx-snd').setAttribute('aria-pressed', String(on && j === i)); }); soundOn = on ? i : -1; if (on) play(v); };
    b.addEventListener('click', (e) => { e.stopPropagation(); setSound(soundOn !== i); });
    c.addEventListener('click', () => { if (dragged) return; setSound(soundOn !== i); });
    v.addEventListener('timeupdate', () => { if (v.duration) bar.style.transform = `scaleX(${(v.currentTime / v.duration).toFixed(4)})`; });
  });
  // arrows: one card at a time
  const step = () => { const c = cards[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300; };
  sec.querySelector('.rlx__arw--prev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  sec.querySelector('.rlx__arw--next').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  // drag with the mouse (touch scrolls natively)
  let down = false, sx = 0, sl = 0, dragged = false;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; dragged = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
  addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) dragged = true; track.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-drag'); setTimeout(() => { dragged = false; }, 0); });
  if (g && window.ScrollTrigger && !RM) {
    g.from('.rlx__h2, .rlx__nav', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 75%', once: true } });
    g.from(cards, { y: 80, opacity: 0, rotate: (i) => (i % 2 ? 2 : -2), duration: 1.3, stagger: 0.07, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: sec, start: 'top 70%', once: true } });
  }
})();
