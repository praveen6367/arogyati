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

  $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });
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
  const hx = $('.hx'), ring = $('.hx__ring'), hcards = $$('.hx__ring .hx-card');
  const arc = { ry: 0, speed: 6, boost: 0, R: 0 };
  const radius = () => Math.min(innerWidth * 0.62, 1050);
  const STEP = 360 / hcards.length;
  let cw = 260;
  const laneY = () => { const cp = $('.hx__copy'), ct = $('.hx__ctas'); return Math.round(cp.offsetTop + ct.offsetTop + ct.offsetHeight + 40 + cw * 0.45); };
  const applyR = () => hcards.forEach((c, i) => { c.style.transform = `rotateY(${(i * STEP).toFixed(2)}deg) translateZ(${(-arc.R).toFixed(1)}px)`; });
  const layout = () => { arc.R = radius(); cw = Math.max(220, Math.min(360, Math.round(arc.R * (STEP * Math.PI / 180) - 20))); hcards.forEach((c) => c.style.setProperty('--cw', cw + 'px')); hx.style.setProperty('--lane-y', laneY() + 'px'); applyR(); };
  const applyRing = () => { ring.style.transform = `translateZ(${(arc.R * 0.55).toFixed(1)}px) rotateY(${arc.ry.toFixed(2)}deg)`; };
  const ARC3D = false;
  /* the photo fills all the space under the button (never overlapping it) and sits on the bottom edge */
  const sizePerson = () => {
    const cp = $('.hx__copy'), ct = $('.hx__ctas'), ps = $('.hx__person');
    const ctaB = cp.offsetTop + ct.offsetTop + ct.offsetHeight, Hh = hx.offsetHeight;
    const hgt = Math.max(280, Math.min(Hh - ctaB - 22, Hh * 0.78));
    ps.style.width = Math.round(Math.min(hgt * 1.1492, innerWidth * 0.98)) + 'px';
  };
  sizePerson(); addEventListener('resize', sizePerson); d.fonts && d.fonts.ready.then(sizePerson);
  if (ARC3D) { layout(); applyRing(); }

  /* ---------- CONDITIONS: the row crossing the screen centre becomes active (IntersectionObserver, no scroll handlers) ---------- */
  {
    const cd = $('.cd4'), AR = $('#cd-areas') ? JSON.parse($('#cd-areas').textContent) : null;
    if (cd && AR) {
      const rows = $$('.cd4-row', cd), vid = $('[data-cd-vid]', cd), pin = $('.cd4__pin', cd);
      const rT = $('[data-cd-rt]', cd), rS = $('[data-cd-rs]', cd), rL = $('[data-cd-rl]', cd), cap = $('.cd4__cap', cd);
      let cur = rows[0].dataset.area, curV = AR[cur].v, inView = false, hoverLock = 0;
      const set = (k) => {
        if (!AR[k] || k === cur) return; cur = k; const a = AR[k];
        rows.forEach((r) => r.classList.toggle('is-on', r.dataset.area === k));
        if (pin) g.to(pin, { attr: { cx: a.x, cy: a.y }, duration: RM ? 0 : 0.8, ease: 'power3.inOut', overwrite: true });
        const txt = () => { rT.innerHTML = a.t; rS.innerHTML = a.s; rL.href = `https://www.instagram.com/p/${a.v}/`; };
        if (RM) txt(); else g.timeline({ overwrite: true }).to(cap, { y: 10, opacity: 0, duration: 0.18, ease: 'power2.in' }).add(txt).to(cap, { y: 0, opacity: 1, duration: 0.5, ease: OUT });
        if (a.v !== curV) {
          curV = a.v;
          const swap = () => { vid.poster = `/home/assets/reels/${a.v}.webp`; vid.src = `/home/assets/reels/${a.v}.mp4`; if (inView) vid.play().catch(() => {}); };
          if (RM) swap(); else g.timeline().to(vid, { opacity: 0, scale: 1.04, duration: 0.22, onComplete: swap }).to(vid, { opacity: 1, scale: 1, duration: 0.7, ease: OUT, delay: 0.08 });
        }
      };
      /* lightbox: the real Instagram reel (full length, with sound), loaded only on open */
      const lb = $('[data-cd-lb]'), lbf = $('[data-cd-lbf]');
      const openLb = () => {
        if (!lb) return; const a = AR[cur];
        $('[data-cd-lba]').textContent = a.n; $('[data-cd-lbt]').innerHTML = a.t; $('[data-cd-lbs]').innerHTML = a.s; $('[data-cd-lbig]').href = `https://www.instagram.com/p/${a.v}/`;
        lbf.innerHTML = `<video src="/home/assets/reels/${a.v}.mp4" poster="/home/assets/reels/${a.v}.webp" muted autoplay loop playsinline></video><iframe src="https://www.instagram.com/p/${a.v}/embed/" title="${a.t.replace(/<[^>]+>/g, '')}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        const fr = $('iframe', lbf); fr.addEventListener('load', () => lbf.classList.add('is-ready'), { once: true });
        vid.pause(); if (lenis) lenis.stop();
        if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
        if (!RM) g.fromTo('.cd-lb__in', { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: OUT });
      };
      const closeLb = () => { if (!lb || !lb.open) return; lb.close ? lb.close() : lb.removeAttribute('open'); };
      if (lb) {
        lb.addEventListener('close', () => { lbf.innerHTML = ''; lbf.classList.remove('is-ready'); if (lenis) lenis.start(); if (inView) vid.play().catch(() => {}); });
        lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
        $('[data-cd-close]').addEventListener('click', closeLb);
        $('[data-cd-lbbook]').addEventListener('click', closeLb);
        $('[data-cd-open]').addEventListener('click', openLb);
        vid.addEventListener('click', openLb);
      }
      const io = new IntersectionObserver((es) => { if (performance.now() < hoverLock) return; es.forEach((e) => { if (e.isIntersecting) set(e.target.dataset.area); }); }, { rootMargin: '-48% 0px -48% 0px' });
      rows.forEach((r) => {
        io.observe(r);
        $('button', r).addEventListener('click', () => { hoverLock = performance.now() + 1500; set(r.dataset.area); });
        if (FINE) r.addEventListener('mouseenter', () => { hoverLock = performance.now() + 1200; set(r.dataset.area); });
      });
      ScrollTrigger.create({ trigger: cd, start: 'top 85%', end: 'bottom 15%', onToggle: (s) => {
        inView = s.isActive;
        if (inView) { if (!vid.src) vid.src = `/home/assets/reels/${curV}.mp4`; vid.play().catch(() => {}); } else vid.pause();
      } });
      if (!RM) {
        g.from('.cd4__head > *', { yPercent: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: OUT, scrollTrigger: { trigger: cd, start: 'top 78%', once: true } });
        ScrollTrigger.batch('.cd4-row', { start: 'top 92%', once: true, onEnter: (els) => g.from(els, { yPercent: 60, opacity: 0, duration: 0.9, stagger: 0.06, ease: OUT }) });
        g.from('.cd4__card', { clipPath: 'inset(14% 14% 14% 14% round 48px)', duration: 1.3, ease: OUT, scrollTrigger: { trigger: '.cd4__grid', start: 'top 75%', once: true } });
      }
    }
  }

  /* ---------- TEAM card deck: pinned horizontal scroll, cards flip to bios ---------- */
  $$('[data-tq-card]').forEach((c) => $('.tq-card__in', c).addEventListener('click', () => c.classList.toggle('is-flip')));
  if ($('.tq')) {
    const tqm = g.matchMedia();
    tqm.add('(min-width: 1024px)', () => {
      if (RM) return;
      const tr = $('.tq__track'), bar = $('.tq__bar i');
      const dist = () => Math.max(0, tr.scrollWidth - innerWidth);
      const tw = g.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.tq', start: 'top top', end: () => '+=' + dist(), pin: '.tq__stage', scrub: 1, invalidateOnRefresh: true, onUpdate: (s) => bar.style.setProperty('--p', s.progress.toFixed(4)) } });
      g.from('.tq-card', { y: 80, opacity: 0, rotate: (k) => (k % 2 ? 3 : -3), duration: 1.1, stagger: 0.06, ease: OUT, scrollTrigger: { trigger: '.tq', start: 'top 70%', once: true } });
      return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); g.set(tr, { x: 0 }); };
    });
    if (!RM) g.from('.tq__head > *', { y: 28, opacity: 0, duration: 1, stagger: 0.1, ease: OUT, scrollTrigger: { trigger: '.tq', start: 'top 75%', once: true } });
  }

  /* ---------- RECOVERY STORIES: panel opens, cards rise, pain→relief meters sweep ---------- */
  if ($('.rs') && !RM) {
    if (!LITE) g.fromTo('[data-rs-panel]', { clipPath: 'inset(6% 4% 6% 4% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', ease: 'none', scrollTrigger: { trigger: '.rs', start: 'top bottom', end: 'top 20%', scrub: true } });
    const sp = SplitText.create('[data-rs-title]', { type: 'words' });
    const tl = g.timeline({ scrollTrigger: { trigger: '.rs', start: 'top 60%', once: true } });
    tl.from(sp.words, { opacity: 0, y: 18, ...(LITE ? {} : { filter: 'blur(8px)' }), duration: 0.9, stagger: 0.04, ease: OUT, clearProps: 'filter' }, 0)
      .from('[data-rs-card]', { y: 70, opacity: 0, rotateX: LITE ? 0 : 18, transformOrigin: '50% 100%', duration: 1.1, stagger: 0.1, ease: OUT, clearProps: 'transform' }, 0.25)
      .to('.rs-meter b', { scaleX: 1, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' }, 0.8)
      .from('.rs-card__chips li', { opacity: 0, y: 8, duration: 0.4, stagger: 0.04, ease: OUT }, 1.2);
  } else $$('.rs-meter b').forEach((b) => { b.style.transform = 'scaleX(1)'; });
  /* ---------- CONTACT: live open status (Kolhapur time), panel + cards reveal ---------- */
  {
    const op = $('[data-ct-open]');
    if (op) {
      const ist = new Date(Date.now() + (new Date().getTimezoneOffset() + 330) * 60000), dw = (ist.getDay() + 6) % 7, m = ist.getHours() * 60 + ist.getMinutes();
      const open = dw < 6 && ((m >= 600 && m < 840) || (m >= 960 && m < 1140));
      op.textContent = open ? 'Open now' : 'Closed now'; op.classList.toggle('is-closed', !open);
      const t = $(`.ct-days li[data-d="${dw}"]`); if (t) t.classList.add('is-today');
    }
    if ($('.ct') && !RM) {
      if (!LITE) {
        g.fromTo('[data-ct-panel]', { clipPath: 'inset(6% 4% 6% 4% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', ease: 'none', scrollTrigger: { trigger: '.ct', start: 'top bottom', end: 'top 15%', scrub: true } });
        g.fromTo('.ct__bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.ct', start: 'top bottom', end: 'bottom bottom', scrub: true } });
      }
      const sp = SplitText.create('[data-ct-title]', { type: 'words,chars', wordsClass: 'ct-wd' });
      const tl = g.timeline({ scrollTrigger: { trigger: '.ct', start: 'top 55%', once: true } });
      tl.from(sp.chars, { yPercent: 60, opacity: 0, ...(LITE ? {} : { filter: 'blur(10px)' }), duration: 1, stagger: 0.03, ease: OUT, clearProps: 'filter' }, 0)
        .from('.ct__sub, .ct__ctas', { y: 20, opacity: 0, duration: 0.9, stagger: 0.1, ease: OUT }, 0.4)
        .from('[data-ct-card]', { y: 70, opacity: 0, duration: 1.1, stagger: 0.09, ease: OUT, clearProps: 'transform' }, 0.55)
        .from('.ct-days li', { scale: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(2.4)' }, 1.1);
    }
  }
  /* ===================== GLASS PASS motion ===================== */
  {
    const gm = g.matchMedia();
    /* HISTORY platinum year: counter rolls 2007 → 2024; info card + background follow the milestone */
    if ($('[data-hx3-year]')) {
      const HD = JSON.parse($('#hx3-data').textContent), Y = HD.map((x) => +x.y), N = HD.length;
      const yEl = $('[data-hx3-year]'), fillEl = $('[data-hx2-fill]'), yrs = $$('[data-hx2-y]'), wins = $$('.hx3__win img'), bgs = $$('.hx2__bg');
      const nN = $('[data-hx3-name]'), nNo = $('[data-hx3-no]'), nI = $('[data-hx3-ic]'), info = $('[data-hx3-info]');
      let cur = -1;
      const setM = (k) => {
        if (k === cur) return; cur = k; const d = HD[k];
        wins.forEach((w, i) => w.classList.toggle('is-on', i === k)); bgs.forEach((w, i) => w.classList.toggle('is-on', i === k));
        yrs.forEach((l, i) => l.classList.toggle('is-on', i <= k));
        g.timeline({ overwrite: true }).to([nN, nNo, nI], { y: -10, opacity: 0, duration: 0.2 }).add(() => { nN.textContent = d.t; nNo.textContent = String(k + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); nI.innerHTML = d.ic; })
          .to([nN, nNo, nI], { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: OUT });
        if (!RM) g.fromTo(info, { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'back.out(2)' });
      };
      const lay = (p) => {
        const yr = Math.round(Y[0] + (Y[N - 1] - Y[0]) * p); yEl.textContent = yr;
        let k = 0; for (let i = 0; i < N; i++) if (yr >= Y[i]) k = i;
        setM(k);
        if (fillEl) fillEl.style.transform = `scaleX(${p.toFixed(4)})`;
      };
      gm.add('(min-width: 900px)', () => {
        if (RM) { lay(1); return; }
        lay(0);
        const st = ScrollTrigger.create({ trigger: '.hx2', start: 'top top', end: '+=220%', pin: '.hx2__stage', scrub: 0.6, onUpdate: (s) => lay(s.progress) });
        g.from('.hx2__head > *, .hx3__year, .hx3__info', { y: 40, opacity: 0, duration: 1.1, stagger: 0.1, ease: OUT, scrollTrigger: { trigger: '.hx2', start: 'top 70%', once: true } });
        return () => st.kill();
      });
      gm.add('(max-width: 899px)', () => {
        lay(0);
        const st = ScrollTrigger.create({ trigger: '.hx2', start: 'top 70%', end: 'bottom 40%', scrub: true, onUpdate: (s) => lay(s.progress) });
        return () => st.kill();
      });
    }
    /* TEAM people index: masked name reveals, glass lens follows the cursor */
    const rows = $$('[data-tx-row]');
    if (rows.length) {
      rows.forEach((r) => $('.tx-row__btn', r).addEventListener('click', () => { const o = !r.classList.contains('is-open'); r.classList.toggle('is-open', o); $('.tx-row__btn', r).setAttribute('aria-expanded', o); setTimeout(() => ScrollTrigger.refresh(), 650); }));
      if (!RM) {
        g.from('.tx-row__n span', { yPercent: 110, duration: 1.1, stagger: 0.05, ease: OUT, scrollTrigger: { trigger: '.tx__list', start: 'top 80%', once: true } });
        g.from('.tx-row__no, .tx-row__r, .tx-row__plus', { opacity: 0, duration: 0.8, stagger: 0.02, ease: 'power2.out', scrollTrigger: { trigger: '.tx__list', start: 'top 80%', once: true } });
        g.fromTo('.tx__img', { clipPath: 'inset(20% 20% 20% 20% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.4, ease: 'az', scrollTrigger: { trigger: '.tx', start: 'top 70%', once: true } });
        g.from('.tx__h2, .tx__cap', { y: 30, opacity: 0, duration: 1, stagger: 0.12, ease: OUT, scrollTrigger: { trigger: '.tx', start: 'top 70%', once: true } });
      }
      const lens = $('.tx__lens');
      if (lens && FINE && !LITE) {
        const lx = g.quickTo(lens, 'x', { duration: 0.5, ease: 'power3' }), ly = g.quickTo(lens, 'y', { duration: 0.5, ease: 'power3' });
        const sI = $('[data-tx-ini]'), sS = $('[data-tx-stat]'), sU = $('[data-tx-unit]'), sR = $('[data-tx-role]'); const sP = $('[data-tx-img]');
        const list = $('.tx__list');
        list.addEventListener('mousemove', (e) => { lx(e.clientX + 150); ly(e.clientY); });
        list.addEventListener('mouseenter', (e) => { g.set(lens, { x: e.clientX + 150, y: e.clientY }); g.to(lens, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }); });
        list.addEventListener('mouseleave', () => g.to(lens, { opacity: 0, scale: 0.6, duration: 0.3 }));
        rows.forEach((r) => r.addEventListener('mouseenter', () => {
          if (sP) sP.src = r.dataset.img; sI.textContent = r.dataset.ini; sS.textContent = r.dataset.stat; sU.textContent = r.dataset.unit; sR.innerHTML = r.dataset.role;
          g.fromTo([sS, sR], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: OUT, overwrite: true });
        }));
      }
    }
    /* REVIEWS stagger (21st.dev Stagger Testimonials pattern, rebuilt in vanilla) */
    if ($('[data-st-stage]')) {
      const stage = $('[data-st-stage]'); let list = $$('[data-st-card]', stage);
      const lay = () => {
        const n = list.length, mid = Math.floor(n / 2), cs = list[0].offsetWidth, sp = Math.min(cs * 0.92, innerWidth * 0.26);
        list.forEach((c, i) => {
          const pos = i - mid, ctr = pos === 0;
          c.classList.toggle('is-center', ctr); c.style.zIndex = String(10 - Math.abs(pos));
          c.style.opacity = Math.abs(pos) > 3 ? 0 : 1;
          c.style.transform = `translate(-50%,-50%) translateX(${sp * pos}px) translateY(${ctr ? -50 : pos % 2 ? 18 : -18}px) rotate(${ctr ? 0 : pos % 2 ? 2.5 : -2.5}deg)`;
          const b = $('.rs-meter b', c); if (b) b.style.transform = ctr ? 'scaleX(1)' : 'scaleX(.15)';
        });
      };
      const move = (steps) => {
        if (steps > 0) for (let s = 0; s < steps; s++) list.push(list.shift());
        else for (let s = 0; s < -steps; s++) list.unshift(list.pop());
        lay(); t0 = performance.now();
      };
      list.forEach((c) => {
        c.addEventListener('click', () => { const i = list.indexOf(c), mid = Math.floor(list.length / 2); if (i !== mid) move(i - mid); });
        c.addEventListener('keydown', (e) => { if (e.key === 'Enter') c.click(); });
      });
      $('[data-st-next]').addEventListener('click', () => move(1));
      $('[data-st-prev]').addEventListener('click', () => move(-1));
      $$('.rs-meter b', stage).forEach((b) => { b.style.transition = 'transform 1.4s cubic-bezier(.65,.05,.17,1)'; });
      lay(); addEventListener('resize', lay);
      let t0 = performance.now(), vis = false, hover = false;
      stage.addEventListener('mouseenter', () => { hover = true; }); stage.addEventListener('mouseleave', () => { hover = false; t0 = performance.now(); });
      ScrollTrigger.create({ trigger: '.st', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { vis = s.isActive; t0 = performance.now(); } });
      if (!RM) g.ticker.add(() => { if (vis && !hover && performance.now() - t0 > 5000) move(1); });
      if (!RM) g.from('.st__head > *, [data-st-stage], .st__nav', { y: 60, opacity: 0, duration: 1.1, stagger: 0.1, ease: OUT, scrollTrigger: { trigger: '.st', start: 'top 70%', once: true } });
    }
    /* CONTACT: calm editorial entrance */
    if ($('.cx2') && !RM) {
      g.from('.cx2__photo', { clipPath: 'inset(12% 8% 12% 8% round 40px)', scale: 1.04, duration: 1.4, ease: OUT, scrollTrigger: { trigger: '.cx2', start: 'top 75%', once: true } });
      g.from('[data-cx-in]:not(.cx2__photo)', { y: 26, opacity: 0, duration: 1, stagger: 0.08, ease: OUT, scrollTrigger: { trigger: '.cx2', start: 'top 70%', once: true } });
      g.from('[data-cx-row]', { y: 18, opacity: 0, duration: 0.8, stagger: 0.07, ease: OUT, scrollTrigger: { trigger: '.cx2__cells', start: 'top 88%', once: true } });
      g.from('.cx2__note', { y: 30, opacity: 0, duration: 1, delay: 0.5, ease: OUT, scrollTrigger: { trigger: '.cx2', start: 'top 70%', once: true } });
    }
  }
  const mq = $('.az-marquee'); if (mq) { const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting))); io.observe(mq); }




  /* ---------- THE RAIL — one set of cards: a 3D loop in the hero that comes down with you,
     unbends into a flat filmstrip, then your scroll drives it through the next section ---------- */
  const railIn = { v: RM ? 1 : 0 };
  const rail = (() => {
    const el = $('.rl'), rx = $('.rx'); if (!el || !rx || LITE) return null;
    const cards = $$('.rl-card', el), N = cards.length, U = N / 2;
    const sky = $('.hx__sky'), haze = $('.hx__haze'), head = $('.rx__head'), cap = $('.rx__cap'), CAP = JSON.parse($('#rx-cap').textContent), capI = $('[data-rx-i]'), capT = $('[data-rx-t]'), capD = $('[data-rx-d]'), bar = $('.rx__bar i');
    let segs = null; if (cap) { const sg = document.createElement('div'); sg.className = 'rx__segs'; sg.innerHTML = '<i></i>'.repeat(U); cap.appendChild(sg); segs = [...sg.children]; }
    const clamp = (v) => Math.max(0, Math.min(1, v)), mix = (a, b, t) => a + (b - a) * t;
    const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const mq = matchMedia('(min-width: 1024px)');
    let laneF = 400, pin = null, cw = 300, sp = 336, R0 = 900, L = 0, off = 0, lane0 = 600, active = -1, on = false;
    const measure = () => {
      cw = Math.round(Math.max(250, Math.min(330, innerWidth * 0.19, innerHeight - 520)));
      sp = cw * 1.26; L = sp * N; laneF = Math.max(190 + cw * 0.55, Math.min(innerHeight * 0.47, innerHeight - 300 - cw * 0.58)); R0 = L / (2 * Math.PI);
      cards.forEach((c) => c.style.setProperty('--cw', cw + 'px'));
      const cp = $('.hx__copy'), ct = $('.hx__ctas'); lane0 = cp.offsetTop + ct.offsetTop + ct.offsetHeight + 46 + cw * 0.45;
    };
    const setCap = (i) => {
      if (i === active) return; active = i; const c = CAP[i];
      capI.textContent = String(i + 1).padStart(2, '0');
      g.fromTo([capT, capD], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', overwrite: true, onStart: () => { capT.innerHTML = c.t; capD.innerHTML = c.d; } });
    };
    const render = (dt) => {
      const y = scrollY, vw = innerWidth, vh = innerHeight, heroH = hx.offsetHeight;
      const SPLIT = window.__railSplit && pin;
      /* split mode (3D page): the loop fades out with the hero, then reappears and flattens just before the filmstrip */
      const aRaw = SPLIT ? clamp((y - (pin.start - vh)) / vh) : clamp(y / Math.max(1, (pin ? pin.start : heroH))), a = io3(aRaw);
      const heroP = clamp(y / heroH), visMul = SPLIT ? Math.max(1 - clamp(y / (heroH * 0.45)), clamp((y - (pin.start - vh * 0.7)) / (vh * 0.5))) : 1;
      const p = pin ? clamp((y - pin.start) / (pin.end - pin.start)) : 0;
      const after = pin ? Math.max(0, y - pin.end) : 0;
      if (after > vh * 1.2) { el.style.visibility = 'hidden'; return; } el.style.visibility = '';
      /* the sky dissolves into the page and the hero's bottom haze lifts away, so nothing washes over the cards */
      const sk = SPLIT ? heroP : aRaw;
      if (sky) sky.style.opacity = (1 - clamp(sk / 0.55)).toFixed(3);
      if (haze) haze.style.opacity = (1 - clamp(sk / 0.12)).toFixed(3);
      off += (dt || 16) / 1000 * 26 * (1 - a);
      const railY0 = mix(lane0, laneF, a) - after;
      el.style.perspectiveOrigin = `50% ${railY0.toFixed(1)}px`;
      const total = off + p * sp * (U - 1) + sp * 0.5 * clamp(p * 4);
      const pf = clamp(p * 12);
      let best = 0, bi = 0;
      cards.forEach((c, i) => {
        let s = ((i * sp - total) % L + L) % L - L / 2;
        const dist = Math.min(1, Math.abs(s) / (L / 2)), sg = s < 0 ? -1 : 1;
        /* ribbon: the centre straightens first, the outer cards follow */
        const ai = io3(clamp(aRaw * 1.45 - dist * 0.45)), wv = Math.sin(ai * Math.PI);
        const k = mix(1 / R0, 0, ai), d = mix(0.45 * R0, 0, ai);
        const th = s * k, x = k ? Math.sin(th) / k : s, z0 = -d + (k ? (1 - Math.cos(th)) / k : 0);
        const vis = k > 1e-6 ? Math.abs(th) < 1.7 : Math.abs(x) < vw * 0.62 + cw;
        const yy = mix(lane0, laneF, ai) - after + wv * 70 * (0.35 + dist);
        let f = pf * Math.max(0, 1 - Math.abs(x) / (sp * 0.95));
        if (f > best) { best = f; bi = i % U; }
        const z = z0 + 60 * f + wv * 60, scl = mix(1, 0.92, ai) * (1 + 0.1 * f);
        const rx = wv * 16 * (0.4 + dist), rz = wv * 7 * sg * dist;
        const op = vis ? railIn.v * visMul * mix(1, 0.4 + 0.6 * Math.min(1, f * 1.6), pf) : 0;
        c.style.opacity = op.toFixed(3);
        c.style.transform = `translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(-th * 180 / Math.PI).toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scl.toFixed(4)})`;
      });
      if (pin && p > 0 && p < 1) setCap(bi);
      el.classList.toggle('is-flat', a > 0.55);
      if (head) head.style.opacity = clamp((aRaw - 0.86) / 0.14).toFixed(3);
      if (cap) cap.style.opacity = pf.toFixed(3);
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (segs && pin) segs.forEach((s, k) => s.classList.toggle('is-on', p > 0 && k <= active));
    };
    const tick = (t, dt) => { if (on) render(dt); };
    const setup = () => {
      if (pin) { pin.kill(true); pin = null; }
      on = mq.matches; h.classList.toggle('rl-on', on);
      if (!on) return;
      measure();
      pin = ScrollTrigger.create({ trigger: rx, start: 'top top', end: '+=' + Math.round(U * 42) + '%', pin: '.rx__stage', pinSpacing: true });
      setCap(0); render(0);
    };
    g.ticker.add(tick);
    addEventListener('resize', () => { if (on) measure(); });
    mq.addEventListener('change', () => { setup(); ScrollTrigger.refresh(); });
    return { setup };
  })();

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
      /* hero leaves naturally (no pin, no flood): copy lifts, cards spread and fade, photo drifts slower than the page */
      const st = { trigger: hx, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true, onUpdate: (s) => { arc.boost = Math.min(arc.boost + Math.abs(s.getVelocity()) / 600, 60); } };
      const tl = g.timeline({ defaults: { ease: 'none' }, scrollTrigger: st });
      tl.to('.hx__copy', { yPercent: -50, opacity: 0, duration: 0.5 }, 0)
        .to('.hx__sky', { yPercent: 12, duration: 1 }, 0)
        .to(arc, { R: () => radius() * 1.45, duration: 1, onUpdate: applyR }, 0)
        .to(hcards, { opacity: 0, duration: 0.45 }, 0.4)
        .to('.hx__person', { yPercent: -8, opacity: 0.0, duration: 1 }, 0);
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

    /* IX motion — stats count up, laurels grow leaf by leaf, modalities fade in, mission words darken as you scroll */
    {
      const ix = $('.ix');
      g.from('[data-ix-in]', { y: 34, opacity: 0, duration: 1.1, stagger: 0.12, ease: OUT, scrollTrigger: { trigger: ix, start: 'top 85%', once: true } });
      g.from('.ix__icons span, .ix__stats .ix__faces span', { scale: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(2)', scrollTrigger: { trigger: ix, start: 'top 80%', once: true } });
      $$('[data-ix-count]').forEach((el) => {
        const to = +el.dataset.ixCount, o = { v: 0 }; el.textContent = '0';
        g.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } });
      });
      $$('.ix-laurel').forEach((lw, i) => {
        const tl = g.timeline({ scrollTrigger: { trigger: '.ix__laurels', start: 'top 85%', once: true }, delay: i * 0.18 });
        const stems = $$('.ix-stem path', lw);
        stems.forEach((p) => { const L = p.getTotalLength(); g.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
        const li = lw.closest('.ix-first');
        tl.fromTo($('.ix-first__rule', li), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 0)
          .to(stems, { strokeDashoffset: 0, duration: 1, ease: 'power2.out' }, 0.15)
          .from($$('.ix-leaf', lw), { scale: 0, transformOrigin: '50% 50%', duration: 0.45, stagger: { each: 0.03, from: 'start' }, ease: 'back.out(2)' }, 0.25)
          .from($$('.ix-first__n, .ix-first__t, .ix-first__s', li), { y: 22, opacity: 0, duration: 0.9, stagger: 0.07, ease: OUT }, 0.35);
      });
      ScrollTrigger.create({ trigger: '.ix__mq', start: 'top bottom', end: 'bottom top', onToggle: (s) => $('.ix__mq').classList.toggle('is-run', s.isActive) });
      g.from('.ix__faces span', { x: -14, opacity: 0, duration: 0.7, stagger: 0.07, ease: OUT, scrollTrigger: { trigger: '.ix__proof', start: 'top 90%', once: true } });
      const big = $('[data-ix-words]');
      if (big) {
        const sp = SplitText.create(big, { type: 'words', wordsClass: 'ix-w' });
        g.to(sp.words, { color: '#17231B', stagger: 0.12, ease: 'none', scrollTrigger: { trigger: big, start: 'top 82%', end: 'bottom 45%', scrub: true } });
      }
    }

    /* SERVICES — panel opens from an inset frame, hills settle, title sharpens out of a frost, cards pop up in 3D */
    {
      const pnl = $('[data-sv-panel]');
      if (pnl) {
        if (!LITE) {
          g.fromTo(pnl, { clipPath: 'inset(7% 5% 7% 5% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', ease: 'none', scrollTrigger: { trigger: pnl, start: 'top bottom', end: 'top 15%', scrub: true } });
          g.fromTo('.sv__bg img', { scale: 1.22, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: pnl, start: 'top bottom', end: 'bottom top', scrub: true } });
        }
        const tt = $('[data-sv-title]');
        const sp = SplitText.create(tt, { type: 'words' });
        const tl = g.timeline({ scrollTrigger: { trigger: pnl, start: 'top 62%', once: true } });
        tl.from(sp.words, { opacity: 0, y: 20, ...(LITE ? {} : { filter: 'blur(10px)' }), duration: 1, stagger: 0.05, ease: OUT, clearProps: 'filter' }, 0)
          .from('[data-sv-in]', { opacity: 0, y: 16, duration: 0.9, stagger: 0.1, ease: OUT }, 0.2)
          .from('.sv-card__segs i', { scaleX: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.9)
          .from('.sv-card__list li', { opacity: 0, x: -10, duration: 0.5, stagger: 0.04, ease: OUT }, 0.95)
          .from('.sv-card__days i', { scale: 0, duration: 0.45, stagger: 0.07, ease: 'back.out(2.4)' }, 1.0)
          ;
        /* cards rise with the scroll itself (scrubbed, reversible) instead of snapping out of a tilt */
        $$('[data-sv-card]').forEach((c, i) => g.fromTo(c, { y: 90 + (i % 3) * 30, opacity: 0, scale: 0.965 }, { y: 0, opacity: 1, scale: 1, ease: 'none', scrollTrigger: { trigger: '.sv__bento', start: 'top 98%', end: 'top 48%', scrub: 0.6 } }));
        const cnt = $('[data-sv-count]');
        if (cnt) { const o = { v: 0 }; cnt.textContent = '00'; tl.to(o, { v: 7, duration: 1.2, ease: 'power2.out', onUpdate: () => { cnt.textContent = String(Math.round(o.v)).padStart(2, '0'); } }, 0.8); }
        const tg = $('[data-sv-toggle]');
        if (tg) { const tr = $('.sv-toggle__track', tg); const kx = () => tr.offsetWidth - 38;
          tl.to(tr, { '--kx': () => kx() + 'px', '--fill': 1, duration: 1.1, ease: 'power3.inOut' }, 1.6).to(tr, { '--ck': 1, duration: 0.3 }, 2.5); }
      }
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

    /* TECHNOLOGY — editorial phone story: mood tint, giant word, number roll, drawn callouts, phone tilt, stepper, real clips */
    {
      const tcS = $('.tc'), D = $('#tc-data') ? JSON.parse($('#tc-data').textContent) : null;
      if (tcS && D) {
        const dev = $('[data-tc-device]'), scr = $$('.tc-scr'), vids = scr.map((s) => $('video', s)), segs = $$('.tc__segs b'), intro = $('.tc__intro');
        const tints = $$('.tc__tints i'), word = $('[data-tc-word]'), steps = $$('.tc__steps li'), stepBars = $$('.tc__steps i em');
        const nI = $('[data-tc-i]'), nN = $('[data-tc-name]'), nD = $('[data-tc-desc]'), nF = $('[data-tc-fact]'), nU = $('[data-tc-unit]'), nC = $('[data-tc-cap]'), cA = $('[data-tc-ca]'), cB = $('[data-tc-cb]');
        const lines = $$('.tc-call i'), chips = $$('.tc-call span');
        const TILT = [-9, 7, -6, 9, -4];
        let cur = 0, live = false;
        const playOnly = (i) => vids.forEach((v, k) => { if (k === i && live) { if (v.preload === 'none') v.preload = 'auto'; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else v.pause(); });
        const go = (i) => {
          if (i === cur) return; const dir = i > cur ? 1 : -1, prev = scr[cur], next = scr[i]; cur = i; const d = D[i];
          tints.forEach((t, k) => t.classList.toggle('is-on', k === i));
          steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
          scr.forEach((s) => { if (s !== prev && s !== next) { s.classList.remove('is-on'); g.set(s, { clipPath: 'inset(100% 0% 0% 0%)' }); } });
          next.classList.add('is-on');
          g.fromTo(next, { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut', overwrite: true });
          g.fromTo($('video', next), { scale: 1.2 }, { scale: 1, duration: 1.4, ease: OUT });
          g.fromTo($('.tc-o', next), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.4, ease: OUT });
          g.to(prev, { clipPath: dir > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut', onComplete: () => prev.classList.remove('is-on') });
          if (!LITE) g.to(dev, { rotateY: TILT[i], rotateX: 2, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
          g.timeline({ overwrite: true })
            .to([word, nF, nU], { yPercent: -40 * dir, opacity: 0, duration: 0.3, ease: 'power2.in' })
            .add(() => { word.textContent = d.w; nF.textContent = d.f; nU.textContent = d.u; })
            .fromTo([word, nF, nU], { yPercent: 40 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: OUT });
          g.fromTo([nN, nD], { y: 14 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: OUT, overwrite: true, onStart: () => { nI.textContent = String(i + 1).padStart(2, '0'); nN.innerHTML = d.n; nD.innerHTML = d.d; nC.innerHTML = d.n; } });
          g.timeline({ overwrite: true }).to(chips, { opacity: 0, duration: 0.2 }).to(lines, { scaleX: 0, duration: 0.2 }, 0)
            .add(() => { cA.innerHTML = d.a; cB.innerHTML = d.b; })
            .to(lines, { scaleX: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' }).to(chips, { opacity: 1, duration: 0.4, stagger: 0.12 }, '-=0.35');
          playOnly(i);
        };
        const progress = (pAll) => {
          segs.forEach((b, k) => { b.style.transform = `scaleX(${Math.max(0, Math.min(1, pAll * D.length - k)).toFixed(3)})`; });
          stepBars.forEach((b, k) => { b.style.transform = `scaleX(${Math.max(0, Math.min(1, pAll * D.length - k)).toFixed(3)})`; });
        };
        ScrollTrigger.create({ trigger: tcS, start: 'top 80%', end: 'bottom top', onToggle: (s) => { live = s.isActive; playOnly(cur); } });
        mm.add('(min-width: 1024px)', () => {
          const pwPx = () => Math.min(390, innerWidth * 0.26, (innerHeight - 130) / 2.06), phH = () => pwPx() * 2.06;
          const wide = () => Math.min(innerWidth - 48, 1400);
          const morph = g.timeline({ scrollTrigger: { trigger: tcS, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true } });
          morph.fromTo(dev, { width: pwPx, height: phH, borderRadius: () => pwPx() * 0.17, rotateY: 0, rotateX: 18, scale: 0.86 }, { width: pwPx, height: phH, borderRadius: () => pwPx() * 0.17, rotateY: TILT[0], rotateX: 0, scale: 1, ease: 'power2.out', duration: 1 }, 0)
            .set('.tc__screens', { borderRadius: () => pwPx() * 0.135 }, 0)
            /* hand-off from Services: the services panel recedes, this panel opens from an inset frame, the device rises in */
            .fromTo('.tc__tints', { clipPath: 'inset(9% 5% 0% 5% round 56px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', ease: 'power2.out', duration: 0.8 }, 0)
            .fromTo(dev, { opacity: 0, y: 120 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 }, 0.05)
            .fromTo('.sv__panel', { scale: 1, opacity: 1 }, { scale: 0.93, opacity: 0.25, ease: 'power1.in', duration: 0.6, immediateRender: false }, 0)
            .fromTo(intro, { opacity: 1 }, { opacity: 0, duration: 0.25, ease: 'none' }, 0.75)
            .fromTo('[data-tc-float], .tc__word, [data-tc-call]', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, 0.68);
          const st = ScrollTrigger.create({ trigger: tcS, start: 'top top', end: '+=' + (D.length * 85) + '%', pin: '.tc__stage',
            onUpdate: (s) => { progress(s.progress); g.set('.tc__word', { xPercent: (0.5 - s.progress) * 18 }); go(Math.min(D.length - 1, Math.floor(s.progress * D.length * 0.999))); } });
          return () => { st.kill(); morph.kill(); g.set(dev, { clearProps: 'width,height,borderRadius,transform' }); g.set('.tc__screens', { clearProps: 'borderRadius' }); g.set(intro, { opacity: 0 }); };
        });
        mm.add('(max-width: 1023px)', () => {
          g.set(intro, { opacity: 0 });
          let t0 = performance.now(), segP = 0;
          const tick = () => { if (!live) { t0 = performance.now() - ((cur + segP) * 5000); return; } const e = (performance.now() - t0) / 5000; const i = Math.floor(e) % D.length; segP = e % 1; progress((i + segP) / D.length); if (i !== cur) go(i); };
          g.ticker.add(tick);
          return () => g.ticker.remove(tick);
        });
      }
    }

    /* history: pinned rolling year — the counter runs 2007 → 2024, the track fills, milestones light up */
    mm.add('(min-width: 900px)', () => {
      const hi = $('.hi'); if (!hi) return;
      const yEl = $('[data-hi-year]'), fill = $('[data-hi-fill]'), ms = $$('.hi-m'), Y = ms.map((m) => +m.dataset.y), y0 = Y[0], y1 = Y[Y.length - 1];
      const st = ScrollTrigger.create({ trigger: hi, start: 'top top', end: '+=180%', pin: '.hi__stage', scrub: true,
        onUpdate: (s) => {
          const p = s.progress, yr = Math.round(y0 + (y1 - y0) * p);
          yEl.textContent = yr;
          /* track spans first..last dot; position by year along the evenly spaced dots */
          let seg = 0; for (let k = 0; k < Y.length - 1; k++) if (yr >= Y[k]) seg = k;
          const f = Y.length > 1 ? (seg + Math.min(1, (yr - Y[seg]) / Math.max(1, Y[seg + 1] - Y[seg] || 1))) / (Y.length - 1) : 1;
          fill.style.transform = `scaleX(${Math.min(1, f).toFixed(4)})`;
          ms.forEach((m, k) => m.classList.toggle('is-on', yr >= Y[k]));
        } });
      g.from('.hi__head > *', { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: OUT, scrollTrigger: { trigger: hi, start: 'top 70%', once: true } });
      g.from('.hi__year span', { yPercent: 30, opacity: 0, duration: 1.4, ease: OUT, scrollTrigger: { trigger: hi, start: 'top 60%', once: true } });
      return () => st.kill();
    });

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
      .fromTo(railIn, { v: 0 }, { v: 1, duration: 1.4, ease: 'power2.out' }, 0.45)
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
    if (rail) { rail.setup(); ScrollTrigger.sort(); ScrollTrigger.refresh(); }
    addEventListener('load', () => ScrollTrigger.refresh());
  };
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(start);
})();
