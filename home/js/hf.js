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
  // where does it hurt: pick an area on the body or in the list; the reel and the name follow; it cycles until someone picks
  const hp = document.querySelector('.hp');
  if (hp) {
    const D = JSON.parse(document.getElementById('hp-data').textContent);
    const spots = [...hp.querySelectorAll('.hp-spot')], rows = [...hp.querySelectorAll('.hp-row')], vids = [...hp.querySelectorAll('.hp__vids video')];
    const idx = hp.querySelector('.hp__idx b'), area = hp.querySelector('.hp__area'), cond = hp.querySelector('.hp__cond'), cb = hp.querySelector('.hp__cap b'), cs = hp.querySelector('.hp__cap small');
    const snd = hp.querySelector('.hp__snd'), prog = hp.querySelector('.hp__prog i');
    rows.forEach((r, i) => r.parentElement.style.setProperty('--i', i));
    let cur = -1, vis = false, user = false, muted = true, t0 = 0;
    const G = window.gsap;
    const show = (k) => {
      if (k === cur) return; cur = k; t0 = performance.now();
      spots.forEach((s2, i) => s2.classList.toggle('is-on', i === k)); rows.forEach((r, i) => r.classList.toggle('is-on', i === k));
      const d = D[k], set = () => { idx.textContent = String(k + 1).padStart(2, '0'); area.textContent = d.n; cond.textContent = d.c; cb.textContent = d.cb; cs.textContent = d.cs; };
      if (G) { G.to([area, cond, cb, cs], { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in', overwrite: true, onComplete: () => { set(); G.fromTo([area, cond, cb, cs], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out' }); } }); } else set();
      vids.forEach((v, i) => {
        const on = i === k;
        if (on) { if (!v.getAttribute('src')) { v.poster = v.dataset.poster; v.src = v.dataset.src; } v.muted = muted; v.classList.add('is-on'); if (vis) { const p = v.play(); if (p) p.catch(() => {}); } }
        else { v.classList.remove('is-on'); v.pause(); }
      });
    };
    const pick = (k) => { user = true; show(k); };
    spots.forEach((s2, i) => s2.addEventListener('click', () => pick(i)));
    rows.forEach((r, i) => { r.addEventListener('click', () => pick(i)); r.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) pick(i); }); });
    snd.addEventListener('click', () => { muted = !muted; snd.setAttribute('aria-pressed', String(!muted)); snd.setAttribute('aria-label', muted ? 'Unmute reel' : 'Mute reel'); vids.forEach((v) => { v.muted = muted; }); user = true; const v = vids[cur]; if (v && !muted) { const p = v.play(); if (p) p.catch(() => {}); } });
    new IntersectionObserver((es) => es.forEach((e) => {
      vis = e.isIntersecting;
      if (vis) { hp.classList.add('is-in'); if (cur < 0) show(0); const v = vids[cur]; if (v) { const p = v.play(); if (p) p.catch(() => {}); } }
      else vids.forEach((v) => v.pause());
    }), { threshold: 0.2 }).observe(hp);
    // until someone picks, step through the areas; the line under the reel shows the time left
    const CYCLE = 6500;
    (function tick() {
      if (vis && cur >= 0) {
        const f = Math.min(1, (performance.now() - t0) / CYCLE);
        prog.style.setProperty('--p', user ? 0 : f.toFixed(3));
        if (!user && f >= 1 && !document.hidden) show((cur + 1) % D.length);
      }
      requestAnimationFrame(tick);
    })();
  }
  /* header logo: dark over light sections, white over the film and photos. Reads what is actually under the logo. */
  const head = document.querySelector('.az-head'), logo = head && head.querySelector('.az-head__logo');
  if (head && logo) {
    const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m || (m[3] !== undefined && +m[3] < 0.5)) return -1; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
    const light = () => {
      const r = logo.getBoundingClientRect(), x = r.left + r.width / 2, y = Math.max(8, logo.offsetTop + r.height / 2 + 14);
      for (const el of document.elementsFromPoint(x, y)) {
        if (head.contains(el)) continue;
        for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
          if (e.dataset && e.dataset.head) return e.dataset.head === 'light';
          if (e.getBoundingClientRect().width < innerWidth * 0.4) continue; // buttons, chips and small cards passing under the logo don't count
          if (/^(VIDEO|IMG|CANVAS|PICTURE)$/.test(e.tagName) && getComputedStyle(e).opacity > 0.5) return e.tagName === 'CANVAS';
          const L = lum(getComputedStyle(e).backgroundColor); if (L >= 0) return L > 0.6;
        }
        break;
      }
      const Lb = lum(getComputedStyle(document.body).backgroundColor); return Lb < 0 ? true : Lb > 0.6; // nothing opaque behind the logo: the page itself is light
    };
    let tick = false;
    const upd = () => { tick = false; head.classList.toggle('on-light', light()); };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); setTimeout(upd, 300);
  }
})();
