/* AROGYATI homepage motion + interaction. Scoped to /home — never loaded by the deck. */
(() => {
  const d = document, h = d.documentElement;
  const $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const RM = h.classList.contains('az-rm'), LITE = h.classList.contains('az-lite');
  const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const g = window.gsap;
  if (!g || !window.ScrollTrigger) { h.classList.remove('az-motion'); return; }
  g.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create('az', '.65,.05,.17,1');
  const OUT = 'expo.out';

  /* ---------- smooth scroll (desktop pointers only) ---------- */
  let lenis = null;
  if (!RM && FINE && !LITE && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    g.ticker.add((t) => lenis.raf(t * 1000));
    g.ticker.lagSmoothing(0);
  }

  /* ---------- header ---------- */
  const head = $('.az-head'), burger = $('.az-burger'), menu = $('#az-menu');
  let lastY = 0, menuOpen = false;
  const onScroll = (y) => {
    head.classList.toggle('is-condensed', y > 40);
    if (!menuOpen) head.classList.toggle('is-hidden', y > lastY && y > 240);
    lastY = y;
  };
  if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  function setMenu(v) {
    menuOpen = v; d.body.classList.toggle('az-menu-open', v);
    burger.setAttribute('aria-expanded', v); burger.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !v); head.classList.remove('is-hidden');
    if (lenis) v ? lenis.stop() : lenis.start();
    if (v) setTimeout(() => { const a = $('a', menu); a && a.focus({ preventScroll: true }); }, 300);
  }
  burger.addEventListener('click', () => setMenu(!menuOpen));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });

  /* anchor links */
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = id === '#top' ? 0 : $(id); if (t === null) return;
    e.preventDefault(); if (menuOpen) setMenu(false);
    if (lenis) lenis.scrollTo(t, { offset: t === 0 ? 0 : -72, duration: 1.4 });
    else if (t === 0) scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    else t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }));

  /* active section in nav */
  $$('.az-nav a').forEach((a) => {
    const sec = $(a.getAttribute('href')); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
  });

  /* ---------- body map ---------- */
  const AREAS = JSON.parse($('#az-areas').textContent);
  const areaEl = $('[data-az-area]'), condList = $('[data-az-conds]');
  function setArea(k, anim) {
    const a = AREAS[k]; if (!a) return;
    $$('.az-spot').forEach((s) => s.classList.toggle('is-active', s.dataset.area === k));
    $$('.az-areas button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.area === k));
    areaEl.textContent = a.n; condList.textContent = '';
    a.c.forEach((c) => { const li = d.createElement('li'); li.className = 'az-chip'; li.textContent = c; condList.appendChild(li); });
    if (anim && !RM) g.fromTo([areaEl, ...condList.children], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: OUT, overwrite: true });
  }
  $$('.az-spot').forEach((s) => {
    s.addEventListener('click', () => setArea(s.dataset.area, true));
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setArea(s.dataset.area, true); } });
    if (FINE) s.addEventListener('mouseenter', () => setArea(s.dataset.area, true));
  });
  $$('.az-areas button').forEach((b) => b.addEventListener('click', () => setArea(b.dataset.area, true)));
  setArea('neck', false);

  /* ---------- team accordion ---------- */
  $$('.az-member__btn').forEach((b) => b.addEventListener('click', () => {
    const m = b.parentElement, open = !m.classList.contains('is-open');
    m.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open);
    setTimeout(() => ScrollTrigger.refresh(), 760);
  }));

  /* ---------- testimonials ---------- */
  const qs = $$('.az-quote'), qCount = $('[data-az-qcount]');
  let qi = 0, qTimer = null, qVisible = false;
  function showQ(n) {
    const prev = qs[qi]; qi = (n + qs.length) % qs.length; const cur = qs[qi];
    qCount.textContent = String(qi + 1).padStart(2, '0') + ' / ' + String(qs.length).padStart(2, '0');
    if (prev === cur) return;
    if (RM) { prev.classList.remove('is-on'); cur.classList.add('is-on'); return; }
    g.to(prev, { autoAlpha: 0, y: -24, duration: 0.5, ease: 'power2.in', onComplete: () => prev.classList.remove('is-on') });
    cur.classList.add('is-on');
    g.fromTo(cur, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 1, delay: 0.3, ease: OUT });
  }
  const qPlay = () => { clearInterval(qTimer); if (!RM && qVisible) qTimer = setInterval(() => showQ(qi + 1), 7000); };
  $('[data-az-next]').addEventListener('click', () => { showQ(qi + 1); qPlay(); });
  $('[data-az-prev]').addEventListener('click', () => { showQ(qi - 1); qPlay(); });

  /* pause loops off-screen */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.target.classList.contains('az-marquee')) e.target.classList.toggle('is-paused', !e.isIntersecting);
    if (e.target.hasAttribute('data-az-quotes')) { qVisible = e.isIntersecting; qVisible ? qPlay() : clearInterval(qTimer); }
  }));
  io.observe($('.az-marquee')); io.observe($('[data-az-quotes]'));

  /* ---------- motion ---------- */
  const motion = () => {
    if (RM) return;
    const mm = g.matchMedia();

    /* travelling orb — glides to a new spot per section (the deck's morph idea) */
    const orb = $('.az-orb');
    if (!LITE) {
      const setOrb = (v, dur) => {
        const [x, y, s] = v.split(',').map(Number);
        g.to(orb, { x: (x / 100) * innerWidth - orb.offsetWidth / 2, y: (y / 100) * innerHeight - orb.offsetHeight / 2, scale: s, duration: dur, ease: 'az', overwrite: true });
      };
      const secs = $$('[data-az-orb]');
      setOrb(secs[0].dataset.azOrb, 0);
      secs.forEach((sec) => ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => st.isActive && setOrb(sec.dataset.azOrb, 1.8) }));
    } else {
      g.set(orb, { x: innerWidth * 0.45, y: -innerHeight * 0.1 });
    }

    /* fade-ups */
    ScrollTrigger.batch('[data-az-fade]', { start: 'top 90%', once: true, onEnter: (els) => g.to(els, { opacity: 1, y: 0, duration: 1.1, ease: OUT, stagger: 0.08, overwrite: true }) });

    /* split headings */
    $$('[data-az-split]').forEach((el) => {
      const sp = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'az-split-line', aria: 'none' });
      g.from(sp.lines, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: OUT, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    /* mission words scrub */
    $$('[data-az-words]').forEach((el) => {
      const sp = SplitText.create(el, { type: 'words', wordsClass: 'az-w', aria: 'none' });
      g.fromTo(sp.words, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true } });
    });

    /* clip-path image reveals + parallax */
    $$('[data-az-clip]').forEach((el) => {
      g.fromTo(el, { clipPath: 'inset(16% 12% 16% 12% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', duration: 1.6, ease: 'az', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      const img = $('img', el);
      if (img && !LITE) g.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* curved sheets flatten as each dark section arrives */
    $$('[data-az-sheet]').forEach((el) => g.fromTo(el, { borderTopLeftRadius: '50vw 9vw', borderTopRightRadius: '50vw 9vw' },
      { borderTopLeftRadius: '2.5vw 2.5vw', borderTopRightRadius: '2.5vw 2.5vw', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true } }));

    /* hero drifts as you leave it */
    if (!LITE) {
      g.to('.az-hero__copy', { yPercent: -18, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.az-hero', start: 'top top', end: 'bottom top', scrub: true } });
      g.to('.az-hero__media img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.az-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* services: sticky stack, earlier cards recede */
    const cards = $$('.az-card');
    if (!LITE) cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      g.to(c, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
      const img = $('.az-card__media img', c);
      if (img) g.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 20%', scrub: true } });
    });

    /* technology rail: pinned horizontal on desktop, native swipe elsewhere */
    const tech = $('.az-tech'), rail = $('.az-tech__rail'), bar = $('.az-tech__progress i');
    const native = () => {
      tech.classList.add('is-native');
      rail.addEventListener('scroll', () => g.set(bar, { scaleX: rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth) }), { passive: true });
    };
    if (LITE) native();
    else {
      mm.add('(min-width: 1024px)', () => {
        tech.classList.remove('is-native');
        const dist = () => Math.max(0, rail.scrollWidth - innerWidth);
        const tw = g.to(rail, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: tech, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => g.set(bar, { scaleX: s.progress }) } });
        return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); g.set(rail, { x: 0 }); };
      });
      mm.add('(max-width: 1023px)', native);
    }

    /* history: drawn path + milestones light up */
    const line = $('.az-hist__line');
    if (line) {
      const len = line.getTotalLength();
      g.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.az-hist__wrap', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    }
    $$('.az-hist__item').forEach((it, i) => ScrollTrigger.create({ trigger: '.az-hist__wrap', start: () => `top+=${i * 40} 70%`, onEnter: () => it.classList.add('is-on'), onLeaveBack: () => it.classList.remove('is-on') }));

    /* counters (only real numbers) */
    $$('[data-az-count]').forEach((el) => {
      const to = +el.dataset.azCount, pad = +(el.dataset.azPad || 0), o = { v: 0 };
      el.textContent = pad ? '0'.repeat(pad) : '0';
      g.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = String(Math.round(o.v)).padStart(pad, '0'); } });
    });

    /* footer wordmark rises */
    g.from('.az-foot__word span', { yPercent: 100, duration: 1.3, stagger: 0.05, ease: OUT, scrollTrigger: { trigger: '.az-foot__word', start: 'top 98%', once: true } });

    /* cursor + magnetic buttons (fine pointers only) */
    if (FINE && !LITE) {
      const cur = $('.az-cursor'), qx = g.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }), qy = g.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      addEventListener('mousemove', (e) => { cur.classList.add('is-on'); qx(e.clientX); qy(e.clientY); }, { passive: true });
      d.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
      d.addEventListener('mouseover', (e) => cur.classList.toggle('is-hover', !!e.target.closest('a,button,[role="button"]')));
      $$('[data-az-magnetic]').forEach((el) => {
        el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); g.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.32, duration: 0.6, ease: 'power3.out' }); });
        el.addEventListener('mouseleave', () => g.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,.45)' }));
      });
    }
  };

  /* ---------- preloader + hero intro ---------- */
  function preloader() {
    return new Promise((res) => {
      const pre = $('.az-pre');
      if (RM || h.classList.contains('az-seen') || !pre) { pre && pre.remove(); return res(); }
      try { sessionStorage.setItem('az-seen', '1'); } catch (e) {}
      const svg = $('.az-pre-svg');
      const tl = g.timeline({ onComplete: () => pre.remove() });
      tl.from($$('.az-lg-l path', svg), { y: 26, opacity: 0, duration: 0.9, stagger: 0.045, ease: OUT })
        .from($('.az-lg-f', svg), { scale: 0, transformOrigin: '50% 100%', duration: 1, ease: 'back.out(1.7)' }, 0.3)
        .from($('.az-lg-t', svg), { opacity: 0, y: 6, duration: 0.6, ease: OUT }, 0.65)
        .to('.az-pre__bar i', { scaleX: 1, duration: 1.15, ease: 'az' }, 0)
        .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'az' }, '+=0.15')
        .add(res, '<0.15');
      pre.addEventListener('click', () => tl.progress(1));
    });
  }
  function heroIntro() {
    if (RM) return;
    const title = $('[data-az-hero-title]'), media = $('[data-az-hero-media]');
    g.set(title, { opacity: 1 });
    const sp = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'az-split-line', aria: 'none' });
    g.timeline()
      .from(sp.lines, { yPercent: 112, duration: 1.3, stagger: 0.12, ease: OUT }, 0)
      .fromTo(media, { clipPath: 'inset(100% 0% 0% 0% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', duration: 1.5, ease: 'az' }, 0.05)
      .from($('img', media), { scale: 1.3, duration: 2, ease: OUT }, 0.05)
      .fromTo('[data-az-intro]', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: OUT }, 0.35)
      .from(head, { yPercent: -100, duration: 1, ease: OUT }, 0.25);
  }

  const start = () => {
    motion();
    preloader().then(heroIntro);
    window.__azReady = true;
    addEventListener('load', () => ScrollTrigger.refresh());
  };
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(start);
})();
