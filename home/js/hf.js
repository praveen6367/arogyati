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
  // services: the cards land in 3D; the carousel loops on its own (pausing while you hover, drag, swipe or use the arrows),
  // and each photo drifts inside its frame as the carousel moves and the page scrolls
  const sv = document.querySelector('.hfs');
  if (sv) {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tr = sv.querySelector('.hfs__track'), bar = sv.querySelector('.hfs__bar i'), bp = sv.querySelector('.hfs__btn--prev'), bn = sv.querySelector('.hfs__btn--next');
    const cards = [...tr.querySelectorAll('.hfs-g')], imgs = cards.map((c) => c.querySelector('.hfs-g__img')), N = cards.length / 2;
    let vis = false, hold = 0, over = false, tgt = null, raf = 0;
    new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; if (vis) { sv.classList.add('is-in'); if (!raf) raf = requestAnimationFrame(loop); } }), { threshold: 0.12 }).observe(sv);
    const stepW = () => cards[1].offsetLeft - cards[0].offsetLeft, setW = () => cards[N].offsetLeft - cards[0].offsetLeft;
    // seamless loop: the second half repeats the first, so jump back by one set once we pass it
    const wrap = () => {
      const sw = setW();
      if (tr.scrollLeft >= sw - 2) { tr.style.scrollSnapType = 'none'; tr.scrollLeft -= sw; if (tgt !== null) tgt -= sw; requestAnimationFrame(() => { tr.style.scrollSnapType = ''; }); }
    };
    const go = (d) => {
      const s0 = stepW(), sw = setW();
      if (d < 0 && (tgt !== null ? tgt : tr.scrollLeft) < s0 / 2) { tr.style.scrollSnapType = 'none'; tr.scrollLeft += sw; tgt = null; requestAnimationFrame(() => { tr.style.scrollSnapType = ''; }); }
      const from = tgt !== null ? tgt : tr.scrollLeft; tgt = (Math.round(from / s0) + d) * s0;
      tr.scrollTo({ left: tgt, behavior: 'smooth' }); clearTimeout(go.t); go.t = setTimeout(() => { tgt = null; wrap(); }, 750);
    };
    const pause = () => { hold = performance.now(); };
    bp.addEventListener('click', () => { pause(); go(-1); });
    bn.addEventListener('click', () => { pause(); go(1); });
    tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); pause(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); pause(); go(-1); } });
    tr.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') over = true; });
    tr.addEventListener('pointerleave', () => { over = false; });
    tr.addEventListener('touchstart', pause, { passive: true });
    let st = 0; tr.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { if (tgt === null) wrap(); }, 140); }, { passive: true });
    // drag with the mouse (touch scrolls natively)
    let dx = 0, sl = 0, down = false, moved = false;
    tr.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; dx = e.clientX; sl = tr.scrollLeft; pause(); });
    addEventListener('pointermove', (e) => { if (!down) return; const d = e.clientX - dx; if (Math.abs(d) > 4) { moved = true; tr.classList.add('is-drag'); } tr.scrollLeft = sl - d; });
    addEventListener('pointerup', () => { if (!down) return; down = false; pause(); if (moved) { const s0 = stepW(); tr.classList.remove('is-drag'); tgt = Math.round(tr.scrollLeft / s0) * s0; tr.scrollTo({ left: tgt, behavior: 'smooth' }); setTimeout(() => { tgt = null; wrap(); }, 750); } });
    tr.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    // auto advance every few seconds while the section is on screen and nobody is interacting
    setInterval(() => { if (!RM && vis && !over && !down && !document.hidden && performance.now() - hold > 5000) go(1); }, 3600);
    function loop() {
      raf = 0; if (!vis) return;
      const tb = tr.getBoundingClientRect(), mid = tb.left + tb.width / 2, sr = sv.getBoundingClientRect(), py = ((sr.top + sr.height / 2) / innerHeight - 0.5) * -8;
      cards.forEach((c, i) => { const r = c.getBoundingClientRect(); if (r.right < tb.left - 50 || r.left > tb.right + 50) return; const n = Math.max(-1.4, Math.min(1.4, (r.left + r.width / 2 - mid) / tb.width)); imgs[i].style.transform = `translate3d(${(-n * 7).toFixed(2)}%,${py.toFixed(2)}%,0) scale(1.2)`; });
      const sw = setW(), w = Math.max(10, Math.min(100, (tr.clientWidth / sw) * 100)), f = sw > 0 ? (tr.scrollLeft % sw) / sw : 0;
      bar.style.setProperty('--w', w.toFixed(1) + '%'); bar.style.setProperty('--x', ((f * 100) / w * 100).toFixed(1) + '%');
      raf = requestAnimationFrame(loop);
    }
  }
})();
