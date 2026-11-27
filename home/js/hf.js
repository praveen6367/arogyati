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
  // services: the cards rise in as the panel comes into view
  const sv = document.querySelector('.hfs');
  if (sv) new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { sv.classList.add('is-in'); o.disconnect(); } }), { threshold: 0.12 }).observe(sv);
})();
