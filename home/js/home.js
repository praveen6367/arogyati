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

  /* active section in nav + sliding lime indicator (follows hover, settles on the active section) */
  const nav = $('.az-nav'), ind = $('.az-nav__ind'), navLinks = $$('.az-nav a');
  let activeLink = null;
  const moveInd = (a) => {
    navLinks.forEach((l) => l.classList.toggle('is-ind', l === a));
    if (!a) { g.to(ind, { opacity: 0, duration: 0.3, overwrite: true }); return; }
    if (+g.getProperty(ind, 'opacity') < 0.05) g.set(ind, { x: a.offsetLeft, width: a.offsetWidth });
    g.to(ind, { x: a.offsetLeft, width: a.offsetWidth, opacity: 1, duration: RM ? 0 : 0.6, ease: OUT, overwrite: true });
  };
  navLinks.forEach((a) => {
    if (FINE) a.addEventListener('mouseenter', () => moveInd(a));
    const sec = $(a.getAttribute('href')); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => { if (s.isActive) activeLink = a; else if (activeLink === a) activeLink = null; moveInd(activeLink); } });
  });
  nav.addEventListener('mouseleave', () => moveInd(activeLink));

  /* ---------- hero: 3D card arc state ---------- */
  ScrollTrigger.create({ trigger: '.hx', start: 'bottom 80px', onEnter: () => head.classList.add('on-light'), onLeaveBack: () => head.classList.remove('on-light') });
  const hx = $('.hx'), ring = $('.hx__ring'), hcards = $$('.hx-card');
  const arc = { ry: 0, speed: 6, boost: 0, R: 0 };
  const radius = () => Math.min(innerWidth * 0.62, 1050);
  const STEP = 360 / hcards.length;
  let cw = 260;
  const laneY = () => { const cp = $('.hx__copy'), ct = $('.hx__ctas'); return Math.round(cp.offsetTop + ct.offsetTop + ct.offsetHeight + 40 + cw * 0.45); };
  const applyR = () => hcards.forEach((c, i) => { c.style.transform = `rotateY(${(i * STEP).toFixed(2)}deg) translateZ(${(-arc.R).toFixed(1)}px)`; });
  const layout = () => { arc.R = radius(); cw = Math.max(220, Math.min(360, Math.round(arc.R * (STEP * Math.PI / 180) - 20))); hcards.forEach((c) => c.style.setProperty('--cw', cw + 'px')); hx.style.setProperty('--lane-y', laneY() + 'px'); applyR(); };
  const applyRing = () => { ring.style.transform = `translateZ(${(arc.R * 0.55).toFixed(1)}px) rotateY(${arc.ry.toFixed(2)}deg)`; };
  const ARC3D = !LITE && innerWidth >= 900;
  /* the photo fills all the space under the button (never overlapping it) and sits on the bottom edge */
  const sizePerson = () => {
    const cp = $('.hx__copy'), ct = $('.hx__ctas'), ps = $('.hx__person');
    const ctaB = cp.offsetTop + ct.offsetTop + ct.offsetHeight, Hh = hx.offsetHeight;
    const hgt = Math.max(280, Math.min(Hh - ctaB - 22, Hh * 0.78));
    ps.style.width = Math.round(Math.min(hgt * 1.1492, innerWidth * 0.98)) + 'px';
  };
  sizePerson(); addEventListener('resize', sizePerson); d.fonts && d.fonts.ready.then(sizePerson);
  if (ARC3D) { layout(); applyRing(); }

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

    /* HERO — cards orbit on a 3D arc, mouse parallax, then a pinned scroll where the lime orb floods the screen
       and hands off to the lime marquee (the deck's morph continuity) */
    if (ARC3D) {
      let hxOn = true;
      ScrollTrigger.create({ trigger: hx, start: 'top bottom', end: 'bottom top', onToggle: (s) => { hxOn = s.isActive; } });
      g.ticker.add((t, dt) => { if (!hxOn) return; arc.ry -= (arc.speed + arc.boost) * Math.min(dt, 50) / 1000; arc.boost *= 0.94; applyRing(); });
      addEventListener('resize', () => { layout(); applyRing(); });
    }
    mm.add('(min-width: 900px)', () => {
      if (LITE) return;
      /* scroll: copy lifts into the sky, cards spread out, the couple rides off to the right */
      const tl = g.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hx, start: 'top top', end: '+=120%', pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => { arc.boost = Math.min(arc.boost + Math.abs(s.getVelocity()) / 500, 90); } } });
      tl.to('.hx__copy', { yPercent: -60, opacity: 0, duration: 0.4 }, 0)
        .to('.hx__sky', { yPercent: 8, scale: 1.08, duration: 1 }, 0)
        .to(arc, { R: () => radius() * 1.6, duration: 0.6, onUpdate: applyR }, 0)
        .to(hcards, { opacity: 0, duration: 0.35 }, 0.3)
        .to('.hx__person', { scale: 1.06, transformOrigin: '50% 100%', duration: 0.8 }, 0)
        .to('.hx__flood', { opacity: 1, duration: 0.12 }, 0.88);
    });

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
      const svg = $('.az-pre-svg'), pct = $('[data-az-pct]'), o = { v: 0 };
      const tl = g.timeline({ onComplete: () => pre.remove() });
      tl.from($$('.az-lg-l path', svg), { y: 26, opacity: 0, duration: 0.9, stagger: 0.045, ease: OUT })
        .from($('.az-lg-f', svg), { scale: 0, transformOrigin: '50% 100%', duration: 1, ease: 'back.out(1.7)' }, 0.3)
        .from($('.az-lg-t', svg), { opacity: 0, y: 6, duration: 0.6, ease: OUT }, 0.65)
        .to('.az-pre__bar i', { scaleX: 1, duration: 1.45, ease: 'az' }, 0)
        .to(o, { v: 100, duration: 1.45, ease: 'az', onUpdate: () => { pct.textContent = Math.round(o.v); } }, 0)
        .to('.az-pre__logo,.az-pre__bar,.az-pre__pct,.az-pre__skip', { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' }, '+=0.05')
        .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'az' }, '-=0.2')
        .add(res, '<');
      pre.addEventListener('click', () => tl.progress(1));
    });
  }
  function heroIntro() {
    if (RM) return;
    const title = $('[data-hx-title]');
    const blur = (n) => (LITE ? {} : { filter: `blur(${n}px)` });
    g.set(title, { opacity: 1 });
    const sp = SplitText.create(title, { type: 'words,chars', charsClass: 'hx-ch' });
    const tl = g.timeline();
    tl.fromTo('.hx__sky img', { scale: 1.12 }, { scale: 1, duration: 2.4, ease: OUT }, 0)
      .fromTo('.hx__person picture', { yPercent: 14, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.6, ease: OUT }, 0.3)
      .fromTo(sp.chars, { yPercent: 70, opacity: 0, ...blur(14) }, { yPercent: 0, opacity: 1, ...blur(0), duration: 1.2, stagger: 0.035, ease: OUT, clearProps: 'filter' }, 0.25)
      .fromTo(hcards, { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.04 }, 0.45)
      .fromTo(arc, { speed: 26 }, { speed: 6, duration: 2.6, ease: 'power3.out' }, 0.45)
      .fromTo('[data-hx-intro]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: OUT }, 0.6)
      .fromTo('.az-head__bar', { yPercent: -130, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: OUT }, 0.4);
    $$('[data-hx-count]').forEach((el) => {
      const c = { v: 0 }, to = +el.dataset.hxCount; el.textContent = '0';
      tl.to(c, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(c.v); } }, 0.9);
    });
  }

  const start = () => {
    sizePerson(); if (ARC3D) { layout(); applyRing(); }
    motion();
    ScrollTrigger.sort();
    preloader().then(heroIntro);
    window.__azReady = true;
    addEventListener('load', () => ScrollTrigger.refresh());
  };
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(start);
})();
