/* AROGYATI — Technology: the machine cards rise in, their photos settle from a slight zoom. */
(() => {
  const g = window.gsap, ST = window.ScrollTrigger; if (!g || !ST || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.mchs')) return;
  g.from('.mchs__h2, .mchs__lede', { y: 30, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.mchs', start: 'top 75%', once: true } });
  ST.batch('[data-mch]', { start: 'top 86%', once: true, onEnter: (els) => { g.from(els, { y: 70, opacity: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out', clearProps: 'transform,opacity' }); els.forEach((el) => g.fromTo(el.querySelector('img'), { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'expo.out' })); } });
  g.from('.mchs__note', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.mchs__note', start: 'top 92%', once: true } });
})();
