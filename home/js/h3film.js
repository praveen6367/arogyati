/* AROGYATI — home 3: the Matrix Rhythm Therapy film. Loads only as you approach it, plays muted while in view,
   sound on request; on desktop it opens from a framed card to full screen as it reaches the top of the page. */
(() => {
  const s = document.querySelector('.h3-film'); if (!s) return;
  const fr = s.querySelector('.h3-film__frame'), v = s.querySelector('video'), snd = s.querySelector('.h3-film__snd'), sl = snd && snd.querySelector('span');
  const tm = s.querySelector('.h3-film__t'), pr = s.querySelector('.h3-film__p');
  const MOB = innerWidth < 900, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let loaded = false;
  const load = () => { if (loaded) return; loaded = true; v.src = MOB ? v.dataset.srcSd : v.dataset.srcHd; };
  const fmt = (x) => { x = Math.max(0, x | 0); return String((x / 60) | 0).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) load(); }), { rootMargin: '900px 0px' }).observe(s);
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && e.intersectionRatio > 0.25) { load(); const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
  }), { threshold: [0, 0.25, 0.6] }).observe(fr);
  v.addEventListener('timeupdate', () => {
    if (tm) tm.textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration || 75);
    if (pr) pr.style.setProperty('--pr', v.duration ? (v.currentTime / v.duration).toFixed(4) : 0);
  });
  // mute / unmute: the button, or a click anywhere on the film
  const toggle = () => {
    v.muted = !v.muted; const on = !v.muted;
    snd.setAttribute('aria-pressed', String(on)); snd.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video'); sl.textContent = on ? 'Sound on' : 'Sound off';
    if (on) { load(); const p = v.play(); if (p) p.catch(() => {}); }
  };
  if (snd) snd.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  fr.addEventListener('click', (e) => { if (snd && !e.target.closest('.h3-film__bar')) toggle(); });
  const g = window.gsap, ST = window.ScrollTrigger;
  if (!MOB && g && ST && !RM) {
    ST.create({ trigger: s, start: 'top 92%', end: 'top top', scrub: true, onUpdate: (st) => {
      const k = st.progress, e = k * k * (3 - 2 * k);
      fr.style.setProperty('--i', (9 * (1 - e)).toFixed(2) + '%'); fr.style.setProperty('--ix', (12 * (1 - e)).toFixed(2) + '%');
      fr.style.setProperty('--r', (22 * (1 - e)).toFixed(1) + 'px'); fr.style.setProperty('--s', (1.12 - 0.12 * e).toFixed(4));
      fr.style.setProperty('--u', Math.max(0, (k - 0.75) / 0.25).toFixed(3));
    } });
  } else { fr.style.setProperty('--i', '0%'); fr.style.setProperty('--ix', '0%'); fr.style.setProperty('--s', '1'); fr.style.setProperty('--u', '1'); }
})();
