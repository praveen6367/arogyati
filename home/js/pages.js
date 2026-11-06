/* AROGYATI inner pages — page-specific motion. Header, menu, Lenis and shared sections come from home.js. */
(() => {
  const d = document, h = d.documentElement, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const start = () => {
    const g = window.gsap; if (!g || !window.ScrollTrigger) return;
    const OUT = 'expo.out';

    /* hero: title rises word by word inside masks, media opens from an inset frame */
    const h1 = $('[data-ph-h1]');
    if (h1) {
      const wrapWords = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = d.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((w) => {
              if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(d.createTextNode(w)); return; }
              const o = d.createElement('span'); o.className = 'ph-w'; const i = d.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) wrapWords(n);
        });
      };
      wrapWords(h1);
      if (!RM) {
        g.from($$('.ph-w > span', h1), { yPercent: 110, duration: 1.2, stagger: 0.06, ease: OUT, delay: 0.15 });
        g.from('[data-ph-in]', { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: OUT, delay: 0.45 });
        g.from('.ph__crumb', { opacity: 0, duration: 0.8, delay: 0.1 });
        const m = $('[data-ph-media]');
        if (m) {
          g.fromTo(m, { clipPath: 'inset(18% 14% 18% 14% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', duration: 1.6, ease: OUT, delay: 0.2 });
          g.fromTo($('img', m), { scale: 1.25 }, { scale: 1, duration: 2, ease: OUT, delay: 0.2 });
          g.to($('img', m), { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.ph', start: 'top top', end: 'bottom top', scrub: true } });
        }
      }
    }

    if (!RM) {
      ScrollTrigger.batch('[data-pg-in]', { start: 'top 88%', once: true, onEnter: (els) => g.from(els, { y: 28, opacity: 0, duration: 1, stagger: 0.08, ease: OUT }) });
      ScrollTrigger.batch('[data-pg-card]', { start: 'top 90%', once: true, onEnter: (els) => g.from(els, { y: 50, opacity: 0, duration: 1.1, stagger: 0.09, ease: OUT }) });
      $$('[data-pg-clip]').forEach((el) => {
        g.fromTo(el, { clipPath: 'inset(12% 10% 12% 10% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: true } });
        const im = $('img', el); if (im) g.fromTo(im, { yPercent: -6 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      ScrollTrigger.batch('.sx-row', { start: 'top 92%', once: true, onEnter: (els) => g.from(els, { y: 40, opacity: 0, duration: 1, stagger: 0.07, ease: OUT }) });
    }

    /* services index: image preview follows the cursor (desktop only) */
    const peek = $('.sx__peek');
    if (peek && FINE && !RM) {
      const pi = $('img', peek), qx = g.quickTo(peek, 'x', { duration: 0.6, ease: 'power3' }), qy = g.quickTo(peek, 'y', { duration: 0.6, ease: 'power3' });
      let on = false;
      $$('.sx-row').forEach((r) => {
        r.addEventListener('mouseenter', () => { if (pi.getAttribute('src') !== r.dataset.img) pi.src = r.dataset.img; if (!on) { on = true; g.to(peek, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }); } });
      });
      $('.sx__list').addEventListener('mouseleave', () => { on = false; g.to(peek, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power3.in', overwrite: 'auto' }); });
      $('.sx__list').addEventListener('mousemove', (e) => { qx(e.clientX + 40); qy(e.clientY); });
      $$('.sx-row').forEach((r) => { const im = new Image(); im.src = r.dataset.img; });
    }

    /* aims light up one by one as the list scrolls through the middle of the screen */
    const am = $('[data-am]');
    if (am) {
      const items = $$('li', am);
      if (RM) items.forEach((i) => i.classList.add('is-on'));
      else ScrollTrigger.create({ trigger: am, start: 'top 75%', end: 'bottom 45%', scrub: true, onUpdate: (s) => { const n = Math.round(s.progress * items.length); items.forEach((it, k) => it.classList.toggle('is-on', k < n)); } });
    }
  };
  if (d.readyState === 'complete') start(); else addEventListener('load', start);
})();
