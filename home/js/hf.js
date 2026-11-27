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
  // services: the cards rise in; the carousel moves by arrows, drag or swipe, with a progress line
  const sv = document.querySelector('.hfs');
  if (sv) {
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { sv.classList.add('is-in'); o.disconnect(); } }), { threshold: 0.12 }).observe(sv);
    const tr = sv.querySelector('.hfs__track'), bar = sv.querySelector('.hfs__bar i'), bp = sv.querySelector('.hfs__btn--prev'), bn = sv.querySelector('.hfs__btn--next');
    const step = () => { const c = tr.querySelector('.hfs-g'); return c ? c.offsetWidth + parseFloat(getComputedStyle(tr).columnGap || 16) : 300; };
    const upd = () => {
      const max = tr.scrollWidth - tr.clientWidth, f = max > 0 ? tr.scrollLeft / max : 0, w = Math.max(12, Math.min(100, (tr.clientWidth / tr.scrollWidth) * 100));
      bar.style.setProperty('--w', w.toFixed(1) + '%'); bar.style.setProperty('--x', ((f * (100 - w)) / w * 100).toFixed(1) + '%');
      bp.disabled = tr.scrollLeft < 4; bn.disabled = tr.scrollLeft > max - 4;
    };
    tr.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    let tgt = null;
    const go = (d) => { const s0 = step(), max = tr.scrollWidth - tr.clientWidth, from = tgt !== null ? tgt : tr.scrollLeft; tgt = Math.max(0, Math.min(max, (Math.round(from / s0) + d) * s0)); tr.scrollTo({ left: tgt, behavior: 'smooth' }); clearTimeout(go.t); go.t = setTimeout(() => { tgt = null; }, 700); };
    bp.addEventListener('click', () => go(-1));
    bn.addEventListener('click', () => go(1));
    tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); bn.click(); } if (e.key === 'ArrowLeft') { e.preventDefault(); bp.click(); } });
    // drag with the mouse (touch scrolls natively)
    let dx = 0, sl = 0, down = false, moved = false;
    tr.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; dx = e.clientX; sl = tr.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const d = e.clientX - dx; if (Math.abs(d) > 4) { moved = true; tr.classList.add('is-drag'); } tr.scrollLeft = sl - d; });
    addEventListener('pointerup', () => { if (!down) return; down = false; if (moved) { const s0 = step(); tr.classList.remove('is-drag'); tr.scrollTo({ left: Math.round(tr.scrollLeft / s0) * s0, behavior: 'smooth' }); } });
    tr.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
})();
