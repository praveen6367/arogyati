/* AROGYATI — home final: the Matrix Rhythm Therapy film as a full-screen hero. Autoplays muted on a loop,
   sound on request (button or a click on the film), pauses when scrolled away, light source on phones. */
(() => {
  const s = document.querySelector('.hf-hero'); if (!s) return;
  const v = s.querySelector('video'), snd = s.querySelector('.hf-snd'), sl = snd && snd.querySelector('span'), pr = s.querySelector('.hf-hero__p');
  const MOB = innerWidth < 900;
  v.src = MOB ? v.dataset.srcSd : v.dataset.srcHd; v.muted = true;
  const play = () => { const p = v.play(); if (p) p.catch(() => {}); };
  play();
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) play(); else v.pause(); }), { threshold: 0.15 }).observe(s);
  v.addEventListener('timeupdate', () => { if (pr && v.duration) pr.style.setProperty('--pr', (v.currentTime / v.duration).toFixed(4)); });
  const toggle = () => {
    v.muted = !v.muted; const on = !v.muted;
    snd.setAttribute('aria-pressed', String(on)); snd.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video'); sl.textContent = on ? 'Sound on' : 'Sound off';
    if (on) play();
  };
  if (snd) snd.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  v.addEventListener('click', toggle);
  // services: the cards land in 3D, then the rail drifts slowly and continuously (it eases to a stop under the cursor);
  // drag or swipe it, or step with the arrows; each photo drifts inside its frame, cards fade at the edges
  const sv = document.querySelector('.hfs');
  if (sv) {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, MOBW = innerWidth < 900;
    // the same reveal as the homepage's services panel: it opens from an inset frame, the hills settle,
    // the title sharpens out of a frost word by word, the side copy rises in
    const G = window.gsap, STg = window.ScrollTrigger, SPL = window.SplitText;
    if (G && STg) {
      const pnl = sv.querySelector('.hfs__panel'), LITE = MOBW;
      if (!RM) {
        G.fromTo(pnl, { clipPath: 'inset(7% 5% 7% 5% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', ease: 'none', scrollTrigger: { trigger: pnl, start: 'top bottom', end: 'top 15%', scrub: true } });
        G.fromTo(sv.querySelector('.hfs__bg img'), { scale: 1.22, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: pnl, start: 'top bottom', end: 'bottom top', scrub: true } });
        const tt = sv.querySelector('.hfs__h2'), side = sv.querySelectorAll('.hfs__side > *');
        const tl = G.timeline({ scrollTrigger: { trigger: pnl, start: 'top 62%', once: true } });
        if (SPL && tt) { const sp = SPL.create(tt, { type: 'words' }); tl.from(sp.words, { opacity: 0, y: 20, ...(LITE ? {} : { filter: 'blur(10px)' }), duration: 1, stagger: 0.05, ease: 'expo.out', clearProps: 'filter' }, 0); }
        tl.from(side, { opacity: 0, y: 16, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 0.2);
      }
    }
    const tr = sv.querySelector('.hfs__track'), rail = sv.querySelector('.hfs__rail'), bar = sv.querySelector('.hfs__bar i'), bp = sv.querySelector('.hfs__btn--prev'), bn = sv.querySelector('.hfs__btn--next');
    const cards = [...rail.querySelectorAll('.hfs-g')], imgs = cards.map((c) => c.querySelector('.hfs-g__img')), N = cards.length / 3;
    const SPEED = MOBW ? 18 : 26;                               // px per second
    let vis = false, raf = 0, last = 0, x = 0, gain = 0, hold = 0, over = false, tw = null, drag = null, moved = false, ready = false;
    const stepW = () => cards[1].offsetLeft - cards[0].offsetLeft, setW = () => cards[N].offsetLeft - cards[0].offsetLeft;
    new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; if (vis) { sv.classList.add('is-in'); setTimeout(() => { ready = true; sv.classList.add('is-live'); }, 1700); if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } } }), { threshold: 0.1 }).observe(sv);
    const pause = (ms = 2500) => { hold = performance.now() + ms; };
    const glide = (d) => { pause(); const s0 = stepW(), sw = setW(); let from = tw ? tw.to : x; if (Math.round(from / s0) * s0 + d * s0 < 0) { x += sw; from += sw; } tw = { from: x, to: Math.round(from / s0) * s0 + d * s0, t0: performance.now(), dur: 750 }; };
    bp.addEventListener('click', () => glide(-1)); bn.addEventListener('click', () => glide(1));
    tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); glide(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); glide(-1); } });
    tr.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') over = true; });
    tr.addEventListener('pointerleave', () => { over = false; });
    tr.addEventListener('pointerdown', (e) => { drag = { sx: e.clientX, sy: e.clientY, x0: x, id: e.pointerId, horiz: e.pointerType === 'mouse' }; moved = false; tw = null; pause(); });
    addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.horiz) { if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) drag.horiz = true; else if (Math.abs(dy) > 8) { drag = null; return; } else return; }
      if (Math.abs(dx) > 4) { moved = true; tr.classList.add('is-drag'); }
      x = drag.x0 - dx;
    });
    const end = () => { if (!drag) return; drag = null; tr.classList.remove('is-drag'); pause(); };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    tr.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    const ease = (k) => 1 - Math.pow(1 - k, 3);
    function loop(now) {
      raf = 0; if (!vis) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const sw = setW();
      if (tw) { const k = Math.min(1, (now - tw.t0) / tw.dur); x = tw.from + (tw.to - tw.from) * ease(k); if (k >= 1) tw = null; }
      else if (!drag) { const want = !RM && ready && now > hold && !document.hidden ? 1 : 0; gain += (want - gain) * Math.min(1, dt * 2.5); x += SPEED * gain * dt; }
      if (sw > 0 && !drag && !tw) { if (x >= sw) x -= sw; else if (x < 0) x += sw; }
      if (sw > 0 && drag) { if (x >= 2 * sw) { x -= sw; drag.x0 -= sw; } else if (x < 0) { x += sw; drag.x0 += sw; } }
      rail.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      const tb = tr.getBoundingClientRect(), mid = tb.left + tb.width / 2, pad = MOBW ? 16 : Math.min(60, Math.max(26, innerWidth * 0.038)), sr = sv.getBoundingClientRect(), py = ((sr.top + sr.height / 2) / innerHeight - 0.5) * -8;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        if (r.right < tb.left - 40 || r.left > tb.right + 40) return;
        const n = Math.max(-1.4, Math.min(1.4, (r.left + r.width / 2 - mid) / tb.width));
        imgs[i].style.transform = `translate3d(${(-n * 7).toFixed(2)}%,${py.toFixed(2)}%,0) scale(1.2)`;
      });
      const w = Math.max(10, Math.min(100, (tr.clientWidth / sw) * 100)), f = sw > 0 ? (((x % sw) + sw) % sw) / sw : 0;
      bar.style.setProperty('--w', w.toFixed(1) + '%'); bar.style.setProperty('--x', ((f * 100) / w * 100).toFixed(1) + '%');
      raf = requestAnimationFrame(loop);
    }
  }
})();
