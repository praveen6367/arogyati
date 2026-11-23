/* AROGYATI — home 3: "From pain to motion", told with photographs instead of a 3D figure.
   The hero holds a grid of twelve pains. In each chapter one photograph leaves the grid and becomes the feature card,
   its pain pulses, the treatment footage opens out of the pain point, and when it closes the photograph is healed
   (the red drains away). The body moves again, then every pain returns healed and gathers into the Arogyati figure. */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'), V = $('.h3v'); if (!sec || !V || !g || !ST) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const R = [[0, 0.1], [0.1, 0.26], [0.26, 0.42], [0.42, 0.58], [0.58, 0.74], [0.74, 0.86], [0.86, 1.01]];

  /* ---------- the photographs ---------- */
  const tiles = $$('.h3-tile', V), imgs = tiles.map((t) => $('img', t)), rings = tiles.map((t) => $('.h3-ring', t)), heals = tiles.map((t) => $('.h3-heal', t));
  const KEY = tiles.map((t) => t.dataset.k), ASP = 373 / 273;
  // the four pains of the story and where the pain sits on each photograph
  const PAIN = [['neck', 0.5, 0.56], ['shoulder', 0.68, 0.4], ['lowerback', 0.5, 0.8], ['knee', 0.7, 0.52]].map(([k, x, y]) => ({ i: KEY.indexOf(k), x, y }));
  PAIN.forEach((pp) => { tiles[pp.i].style.setProperty('--px', pp.x * 100 + '%'); tiles[pp.i].style.setProperty('--py', pp.y * 100 + '%'); });
  const win = $('.h3-win', V), meds = [...win.children], cap = $('.h3-cap', V), capT = $('span', cap), logo = $('.h3-logo', V);

  /* ---------- chapters: copy, giant word, tint, rail ---------- */
  const chs = $$('.ncx-ch', sec), word = $('[data-ncx-word]'), bar = $('.ncx__bar i'), num = $('[data-ncx-n]'), tint = $('.ncx__tint');
  const tag = $('.ncx__tag'), tagB = $('[data-ncx-tag]'), tagE = $('[data-ncx-tagm]');
  const WORDS = ['WELLNESS', 'NECK', 'SHOULDER', 'BACK', 'KNEE', 'MOVE', 'AROGYATI'];
  const TINTS = ['#E4EEDD', '#F6E6DA', '#DFEAF6', '#E8E5F5', '#F3E9DC', '#E3F0E6', '#E4EEDD'];
  const TAGS = [null, ['Neck pain', 'Osteopathy'], ['Frozen shoulder', 'Super Inductive System'], ['Lower back pain', 'Matrix Rhythm Therapy'], ['Knee pain', 'Class IV Laser']];
  let cur = -1, wTok = 0;
  const wordBox = word && word.parentNode;
  const setWord = (txt) => { word.innerHTML = [...txt].map((ch) => `<i>${ch}</i>`).join(''); return $$('i', word); };
  const wordIn = (k) => { const ls = setWord(WORDS[k]); g.fromTo(ls, { yPercent: 90, opacity: 0, rotate: 5 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.045, ease: 'expo.out' }); };
  const setChapter = (k) => {
    if (k === cur) return; cur = k;
    chs.forEach((c, i) => c.classList.toggle('is-on', i === k));
    if (num) num.textContent = String(k + 1).padStart(2, '0');
    if (tint) tint.style.setProperty('--t', TINTS[k]);
    if (TAGS[k] && tagB) { tagB.textContent = TAGS[k][0]; tagE.textContent = TAGS[k][1]; }
    if (word) {
      const tok = ++wTok, old = $$('i', word);
      if (RM) word.textContent = WORDS[k];
      else if (!old.length) wordIn(k);
      else g.to(old, { yPercent: -70, opacity: 0, duration: 0.4, stagger: 0.02, ease: 'power2.in', overwrite: true, onComplete: () => { if (tok === wTok) wordIn(k); } });
    }
  };

  /* ---------- the treatment window ---------- */
  let mOn = -1;
  const setMed = (k) => {
    if (k === mOn) return; mOn = k;
    meds.forEach((m, i) => {
      const on = i === k;
      if (on && !m.getAttribute('src')) { if (m.dataset.poster) m.poster = m.dataset.poster; m.src = m.dataset.src; }
      m.classList.toggle('is-on', on);
      if (m.tagName === 'VIDEO') { if (on) { const pr = m.play(); if (pr) pr.catch(() => {}); } else m.pause(); }
    });
    if (k >= 0 && capT) capT.textContent = meds[k].dataset.cap;
  };

  /* ---------- layout ---------- */
  let W = 0, H = 0, MOB = false, CX = 0, CY = 0, CW = 0, CH = 0, tw = 0, th = 0, gap = 0, LH = 0, grid = [];
  const layout = () => {
    W = sec.clientWidth; H = innerHeight; MOB = W < 900;
    CX = MOB ? W * 0.5 : W * 0.66; CY = MOB ? H * 0.37 : H * 0.5;
    CH = MOB ? Math.min(H * 0.48, (W - 56) * ASP) : Math.min(H * 0.7, W * 0.36 * ASP); CW = CH / ASP;
    if (MOB) { gap = 8; tw = (W - 32 - gap * 3) / 4; } else { tw = Math.min(W * 0.085, H * 0.16); gap = tw * 0.1; }
    const GX = MOB ? CX : W * 0.7;
    th = tw * ASP;
    grid = KEY.map((_, i) => ({ x: GX + ((i % 4) - 1.5) * (tw + gap), y: CY + (((i / 4) | 0) - 1) * (th + gap) }));
    tiles.forEach((t) => { t.style.width = CW + 'px'; t.style.height = CH + 'px'; });
    win.style.width = CW + 'px'; win.style.height = CH + 'px';
    LH = MOB ? H * 0.3 : H * 0.46; logo.style.height = LH + 'px'; logo.style.width = (LH * 35) / 42 + 'px';
  };
  layout(); addEventListener('resize', layout);

  /* ---------- input & state ---------- */
  let prog = 0, smx = 0, smy = 0, mx = -1, my = -1, inView = true;
  const st = { intro: RM ? 1 : 0 };
  if (FINE) { sec.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = -1; }); }
  const f1 = (v) => v.toFixed(1);
  const place = (el, x, y, s, op, rot = 0) => { el.style.transform = `translate3d(${f1(x - CW / 2)}px,${f1(y - CH / 2)}px,0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`; el.style.opacity = op.toFixed(3); };

  const render = (t) => {
    const p = prog, gs = tw / CW;
    if (mx >= 0) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; } else { smx *= 0.95; smy *= 0.95; }
    let act = -1, c = 0;
    for (let a = 0; a < 4; a++) { const [s0, e0] = R[a + 1]; if (p >= s0 && p < e0) { act = a; c = (p - s0) / (e0 - s0); } }
    const heroV = 1 - seg(p, 0.075, 0.115), endV = seg(p, 0.865, 0.9), toLogo = seg(p, 0.925, 0.975);
    const gridV = Math.max(heroV, endV * (1 - toLogo)), healedAll = p > 0.8 ? 1 : 0;

    tiles.forEach((el, i) => {
      const gp = grid[i], depth = 0.6 + ((i * 7) % 5) * 0.2;
      const ki = RM ? 1 : clamp(st.intro * 1.7 - (i / 12) * 0.7);
      let x = gp.x + smx * 18 * depth, y = gp.y + smy * 12 * depth + Math.sin(t * 0.7 + i * 1.3) * 4 * heroV + (1 - ki) * 40;
      let s = gs * (0.9 + 0.1 * ki), op = gridV * ki, gray = healedAll, rot = 0, ring = 0, hv = 0, z = 1;
      if (toLogo > 0) { x = mix(x, CX, toLogo); y = mix(y, CY, toLogo); s *= 1 - toLogo * 0.6; }
      const pa = PAIN.findIndex((pp) => pp.i === i);
      if (pa >= 0 && pa === act) {
        // the photograph leaves the grid, becomes the feature card, and returns to its slot as the chapter ends
        const fly = ease(clamp(c / 0.2)), out = ease(clamp((c - 0.86) / 0.14));
        x = mix(mix(gp.x, CX, fly), gp.x, out); y = mix(mix(gp.y, CY, fly), gp.y, out);
        s = mix(mix(gs, 1, fly), gs, out); op = Math.max(op, clamp(fly * 2.5) * (1 - out));
        rot = (1 - fly) * (i % 2 ? 4 : -4) + Math.sin(t * 0.45) * 0.5 * fly * (1 - out);
        gray = seg(c, 0.64, 0.8);
        ring = seg(c, 0.16, 0.24) * (1 - seg(c, 0.3, 0.38));
        hv = bell(c, 0.64, 1.0); z = 3;
      }
      el.style.zIndex = z;
      place(el, x, y, s, op, rot);
      const fl = gray > 0.002 ? `grayscale(${gray.toFixed(3)}) contrast(${(1 + 0.06 * gray).toFixed(3)}) brightness(${(1 + 0.04 * gray).toFixed(3)})` : 'none';
      if (imgs[i].dataset.f !== fl) { imgs[i].style.filter = fl; imgs[i].dataset.f = fl; }
      rings[i].style.opacity = ring.toFixed(3); heals[i].style.opacity = hv.toFixed(3);
    });

    // the treatment opens out of the pain point (a lens) and closes again; the move chapter gets an arch
    let k = -1, r = 0, arch = false;
    if (act >= 0) { k = act; r = seg(c, 0.32, 0.46) * (1 - seg(c, 0.6, 0.72)); }
    else if (p >= R[5][0] && p < R[5][1]) { const cc = (p - R[5][0]) / (R[5][1] - R[5][0]); k = 4; r = seg(cc, 0.1, 0.32) * (1 - seg(cc, 0.82, 0.97)); arch = true; }
    if (r > 0.002) {
      setMed(k); win.style.visibility = 'visible';
      win.style.transform = `translate3d(${f1(CX - CW / 2)}px,${f1(CY - CH / 2)}px,0)`;
      if (arch) {
        const hi = (1 - r) * (CW / 2 - 0.75), vi = (1 - ease(clamp(r * 1.6))) * CH * 0.12, rt = Math.max(0.75, CW / 2 - hi);
        win.style.clipPath = `inset(${f1(vi)}px ${f1(hi)}px ${f1(vi)}px ${f1(hi)}px round ${f1(rt)}px ${f1(rt)}px 22px 22px)`;
        win.style.borderRadius = '0';
      } else {
        const px = PAIN[k].x * CW, py = PAIN[k].y * CH, rad = ease(r) * Math.hypot(Math.max(px, CW - px), Math.max(py, CH - py));
        win.style.clipPath = `circle(${f1(rad)}px at ${f1(px)}px ${f1(py)}px)`; win.style.borderRadius = '22px';
      }
      const m = meds[k];
      if (m) m.style.transform = m.tagName === 'VIDEO' ? `scale(${(1.18 - 0.18 * ease(r) + (m.dataset.crop ? 0.2 : 0)).toFixed(4)})` : `scale(${(1.15 - 0.1 * ease(r) + 0.02 * Math.sin(t * 0.2)).toFixed(4)})`;
      const ca = clamp((r - 0.6) / 0.4); cap.style.opacity = ca.toFixed(3);
      cap.style.transform = `translate3d(${f1(CX)}px,${f1(CY + CH / 2 + 18 + (1 - ca) * 8)}px,0) translateX(-50%)`;
    } else { win.style.visibility = 'hidden'; cap.style.opacity = 0; setMed(-1); }

    // the label points at the pain on the card
    if (tag) {
      if (act >= 0) {
        const vis = seg(c, 0.18, 0.28) * (1 - seg(c, 0.82, 0.92)), Xp = CX - CW / 2 + PAIN[act].x * CW, Yp = CY - CH / 2 + PAIN[act].y * CH;
        const flip = Xp + 260 > W; tag.classList.toggle('is-flip', flip); tag.classList.toggle('is-calm', c > 0.68);
        const tx = flip ? Xp - 16 - tag.offsetWidth : Xp + 16;
        tag.style.transform = `translate(${clamp(tx, 8, W - tag.offsetWidth - 8).toFixed(1)}px,${(Yp - tag.offsetHeight / 2).toFixed(1)}px)`; tag.style.opacity = vis.toFixed(3);
      } else tag.style.opacity = 0;
    }

    // every pain, healed, gathers into the Arogyati figure
    const lo = toLogo * (RM ? 1 : 1);
    logo.style.opacity = lo.toFixed(3);
    logo.style.transform = `translate3d(${f1(CX - (LH * 35) / 84)}px,${f1(CY - LH / 2)}px,0) scale(${(0.7 + 0.3 * ease(lo) + 0.012 * Math.sin(t * 1.2)).toFixed(4)})`;
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => {
    prog = s.progress; const k = R.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? R.length - 1 : k);
    if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`;
    if (wordBox && !RM) { const [a0, b0] = R[k < 0 ? R.length - 1 : k], cc = clamp((prog - a0) / (b0 - a0)); wordBox.style.transform = `translate3d(${((0.5 - cc) * (MOB ? 10 : 7)).toFixed(2)}vw,0,0)`; }
  } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  if (!RM) {
    const go = () => {
      g.to(st, { intro: 1, duration: 1.8, ease: 'power2.out' });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.5, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }
})();
