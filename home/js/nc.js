/* AROGYATI — new concept. Hero: a lens that looks beneath the pain inside the photo card, then opens the whole
   x-ray on scroll. Stage: four places pain lives, each located, scanned, treated and moved again (scroll-scrubbed).
   GSAP + ScrollTrigger + DrawSVG, Lenis from home.js. */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger; if (!g || !ST) return;
  if (window.DrawSVGPlugin) g.registerPlugin(window.DrawSVGPlugin);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const C1 = [240, 128, 108], C2 = [240, 190, 120], C3 = [190, 228, 140];
  const mixc = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
  const heat = (t) => { const c = t < 0.5 ? mixc(C1, C2, t * 2) : mixc(C2, C3, (t - 0.5) * 2); return `rgb(${c[0]},${c[1]},${c[2]})`; };
  const draw = (el, f) => { if (!el) return; if (window.DrawSVGPlugin) g.set(el, { drawSVG: `0% ${(clamp(f) * 100).toFixed(2)}%` }); else el.style.opacity = f; };
  const whenReady = (fn) => { const t0 = performance.now(); const chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? fn() : setTimeout(chk, 120)); chk(); };
  const scrollToY = (y) => (window.__azLenis ? window.__azLenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }));

  /* ================= HERO ================= */
  const hero = () => {
    const sec = $('.nch'); if (!sec) return;
    const card = $('.nch__card'), media = $('.nch__media'), ph = $('.nch__ph'), xr = $('.nch__xr'), lens = $('.nch__lens'), hint = $('.nch__hint');
    const spots = $$('.nch__hs').map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y }));
    const IW = 1800, IH = 1200;
    let W = 0, H = 0, r0 = 110, mob = false, q = 0, on = true, last = -1e9, auto = 0, autoT = 0;
    const L = { x: 0, y: 0 }, T = { x: 0, y: 0 }, intro = { v: RM ? 1 : 0 };
    const layout = () => {
      W = media.clientWidth; H = media.clientHeight; mob = innerWidth < 900;
      const px = mob ? 0.5 : 0.46, py = mob ? 0.42 : 0.5, s = Math.max(W / IW, H / IH), ox = (W - IW * s) * px, oy = (H - IH * s) * py;
      spots.forEach((p) => { p.sx = ox + p.x * IW * s; p.sy = oy + p.y * IH * s; p.el.style.transform = `translate(${p.sx.toFixed(1)}px,${p.sy.toFixed(1)}px)`; p.el.classList.toggle('is-left', p.sx > W * 0.55); p.el.style.visibility = p.sx < 14 || p.sx > W - 14 || p.sy > H - 14 ? 'hidden' : ''; });
      r0 = Math.round(clamp(Math.min(W, H) * 0.17, 70, 120));
      if (!L.x) { L.x = T.x = spots[0].sx; L.y = T.y = spots[0].sy; }
    };
    const pick = () => { const vis = spots.filter((p) => p.el.style.visibility !== 'hidden'); const p = vis[auto % vis.length]; T.x = p.sx; T.y = p.sy; auto++; };
    if (FINE) card.addEventListener('pointermove', (e) => { const r = media.getBoundingClientRect(); T.x = e.clientX - r.left; T.y = e.clientY - r.top; last = performance.now(); }, { passive: true });
    const frame = (t, dt) => {
      if (!on) return;
      const now = performance.now(), idle = now - last > 2600;
      if (!RM && idle && now > autoT) { pick(); autoT = now + 3200; }
      const k = RM ? 1 : 1 - Math.pow(idle ? 0.94 : 0.86, Math.min(dt || 16, 50) / 16);
      L.x += (T.x - L.x) * k; L.y += (T.y - L.y) * k;
      const e = io3(clamp((q - 0.06) / 0.78)), diag = Math.hypot(W, H);
      const n0 = spots[0], r = mix(r0 * intro.v, Math.min(W, H) * 0.4, e), cx = mix(L.x, n0.sx, e), cy = mix(L.y, n0.sy + Math.min(W, H) * 0.08, e);
      xr.style.clipPath = `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      lens.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; lens.style.setProperty('--r', r.toFixed(1) + 'px');
      lens.style.opacity = intro.v.toFixed(3);
      let best = null, bd = 1e9;
      spots.forEach((p) => { const dd = Math.hypot(p.sx - cx, p.sy - cy); if (dd < r * 0.92 && dd < bd && q < 0.12 && intro.v > 0.6) { bd = dd; best = p; } });
      spots.forEach((p) => p.el.classList.toggle('is-in', p === best));
    };
    const scrollFx = () => {
      spots.forEach((p) => (p.el.style.opacity = (1 - clamp(q / 0.2)).toFixed(3)));
      if (hint) hint.style.opacity = (1 - clamp(q / 0.15)).toFixed(3);
      ph.style.transform = `scale(${(1 + 0.05 * q).toFixed(4)})`;
    };
    layout(); addEventListener('resize', layout); d.fonts && d.fonts.ready.then(layout);
    ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { q = s.progress; scrollFx(); } });
    ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => (on = s.isActive) });
    g.ticker.add(frame);
    if (RM) return;
    const title = $('[data-nc-title]');
    g.set(title, { opacity: 0 }); g.set('[data-nc-in]', { opacity: 0 }); g.set(card, { clipPath: 'inset(8% 8% 8% 8% round 36px)' });
    whenReady(() => {
      let words = [];
      if (window.SplitText) { const sp = window.SplitText.create(title, { type: 'words', tag: 'span' }); words = sp.words; words.forEach((w) => { const m = d.createElement('span'); m.className = 'nc-w'; w.parentNode.insertBefore(m, w); m.appendChild(w); }); }
      g.set(title, { opacity: 1 });
      const tl = g.timeline();
      tl.to(card, { clipPath: 'inset(0% 0% 0% 0% round 36px)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
        .fromTo(ph, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'expo.out', clearProps: 'transform' }, 0.1)
        .fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.06, ease: 'expo.out' }, 0.3)
        .fromTo('[data-nc-in]', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, 0.6)
        .to(intro, { v: 1, duration: 1.4, ease: 'expo.out' }, 1.1)
        .fromTo('.nch__hs i', { scale: 0 }, { scale: 1, duration: 0.9, stagger: 0.12, ease: 'back.out(2)', clearProps: 'transform' }, 1.2);
    });
  };

  /* ================= STAGE ================= */
  const stage = () => {
    const sec = $('.ncs'); if (!sec) return;
    const D = JSON.parse($('#ncs-data').textContent), N = D.length;
    const card = $('.ncs__card'), txts = $$('.ncs-t'), tints = $$('.ncs__tints i'), lst = $$('.ncs__list button');
    const scan = $('.ncs__scan'), call = $('.ncs__call'), callI = $('i', call), tagB = $('[data-ncs-tag]'), tagS = $('[data-ncs-st]');
    const phEl = $('[data-ncs-ph]'), segs = $$('.ncs__segs i'), fact = $('.ncs__fact'), fEl = $('[data-ncs-f]'), uEl = $('[data-ncs-u]'), meter = $('.ncs__track'), idx = $('[data-ncs-i]');
    const C = $$('.ncs-c').map((el, i) => ({
      el, d: D[i], ph: $('.ncs-c__ph', el), pl: $('.ncs-c__pl', el), xr: $('.ncs-c__xr', el), svg: $('svg.ncs-c__ov', el),
      at: $('.k-at', el), hot: $('.k-heat', el), ring: $('.k-ring', el), retc: $('.k-retc', el), tr: $('.k-tr', el), mv: $('.k-mv', el),
      v: $$('.k-v', el), chain: $('.k-chain', el), flows: $$('.k-flow', el), line: $('.k-line', el), f: $$('.k-f', el),
      arc: $('.k-arc', el), dot: $('.k-dot', el), arm: $('.k-arm', el), w: $('.k-w', el), w2: $('.k-w2', el), lv: $$('.k-lv', el), relief: $('.k-relief', el),
      beam: $('.k-beam', el), phot: $$('.k-ph', el), cells: $$('.k-cell', el), L: {},
    }));
    let W = 0, H = 0, prog = 0, active = -1, inView = false, curSt = '', curPh = '', curFlip = -1;
    const place = (img, dims, Tx, Ty, out) => {
      const [w, h, fx, fy] = dims;
      const s = Math.max(Tx / (fx * w), (W - Tx) / ((1 - fx) * w), Ty / (fy * h), (H - Ty) / ((1 - fy) * h)) * 1.02;
      const st = img.style; st.width = (w * s).toFixed(1) + 'px'; st.height = (h * s).toFixed(1) + 'px';
      st.left = (Tx - fx * w * s).toFixed(1) + 'px'; st.top = (Ty - fy * h * s).toFixed(1) + 'px';
      st.transformOrigin = `${(fx * w * s).toFixed(1)}px ${(fy * h * s).toFixed(1)}px`;
      if (out) out.s = s;
    };
    const layout = () => {
      W = card.clientWidth; H = card.clientHeight;
      C.forEach((c) => {
        const Tx = c.d.T[0] * W, Ty = c.d.T[1] * H; c.L.Tx = Tx; c.L.Ty = Ty;
        place(c.ph, c.d.ph, Tx, Ty); place(c.pl, c.d.xr, Tx, Ty, c.L);
        const [w, h, fx, fy] = c.d.xr;
        c.at.setAttribute('transform', `translate(${(w * fx).toFixed(1)} ${(h * fy).toFixed(1)}) scale(${(1 / c.L.s).toFixed(4)})`);
        c.hot.setAttribute('r', Math.round(Math.min(W, H) * 0.22));
      });
      active = -1; render();
    };
    const phaseOf = (t) => [clamp(t / 0.18), clamp((t - 0.18) / 0.22), clamp((t - 0.4) / 0.32), clamp((t - 0.72) / 0.16)];
    const arcD = (cx, cy, R, a0, a1) => {
      const r0 = (a0 * Math.PI) / 180, r1 = (a1 * Math.PI) / 180, large = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 1 : 0;
      return { d: `M${(cx + R * Math.cos(r0)).toFixed(1)} ${(cy + R * Math.sin(r0)).toFixed(1)}A${R} ${R} 0 ${large} ${sw} ${(cx + R * Math.cos(r1)).toFixed(1)} ${(cy + R * Math.sin(r1)).toFixed(1)}`, x: cx + R * Math.cos(r1), y: cy + R * Math.sin(r1) };
    };
    const ENT = 0.16;
    const specific = (c, a, tm) => {
      const [, a2, a3, a4] = a, e3 = io3(a3), e4 = io3(a4), id = c.d.id;
      if (id === 'neck') {
        const P = c.d.d.pts, n = c.d.d.n, mis = [0, 16, -22, 28, -14, 20, 0];
        const a0 = (Math.atan2(n[1], n[0]) * 180) / Math.PI, ang = a0 > 90 ? a0 - 180 : a0 < -90 ? a0 + 180 : a0;
        const pts = P.map((p, k) => [p[0] + n[0] * mis[k] * (1 - e3), p[1] + n[1] * mis[k] * (1 - e3)]);
        c.v.forEach((v, k) => v.setAttribute('transform', `translate(${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}) rotate(${ang.toFixed(2)})`));
        c.chain.setAttribute('d', 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
        c.tr.style.opacity = (clamp((a2 - 0.35) / 0.5) * (1 - 0.5 * a4)).toFixed(3);
        c.flows.forEach((f) => draw(f, e3));
        draw(c.line, e4); c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
      } else if (id === 'shoulder') {
        const [hx, hy] = c.d.d.h, R = c.d.d.R;
        c.tr.style.opacity = (clamp(a3 * 4) * (1 - 0.7 * a4)).toFixed(3);
        c.f.forEach((f, k) => { const fr = (tm * 0.32 + k / c.f.length) % 1; f.setAttribute('r', (60 + fr * 300).toFixed(1)); f.style.opacity = ((1 - fr) * 0.7).toFixed(3); });
        const A = arcD(hx, hy, R, 82, 82 - 160 * e4); c.arc.setAttribute('d', A.d);
        c.dot.setAttribute('cx', A.x.toFixed(1)); c.dot.setAttribute('cy', A.y.toFixed(1));
        c.arm.setAttribute('x2', mix(hx, A.x, 0.94).toFixed(1)); c.arm.setAttribute('y2', mix(hy, A.y, 0.94).toFixed(1));
        c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
      } else if (id === 'back') {
        const { y, x0, x1 } = c.d.d; let p1 = '', p2 = '';
        for (let k = 0; k <= 64; k++) {
          const u = k / 64, x = mix(x0, x1, u), env = Math.sin(Math.PI * u);
          const noise = 0.6 * Math.sin(2 * Math.PI * 9.3 * u + tm * 7) + 0.38 * Math.sin(2 * Math.PI * 15.7 * u - tm * 11) + 0.3 * Math.sin(2 * Math.PI * 2.1 * u + tm * 2);
          const v = mix(noise, Math.sin(2 * Math.PI * 4 * u - tm * 3.2), e3), v2 = mix(noise, Math.sin(2 * Math.PI * 4 * u - tm * 3.2 - 0.9), e3);
          p1 += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + 42 * env * v).toFixed(1);
          p2 += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + 28 * env * v2).toFixed(1);
        }
        c.w.setAttribute('d', p1); c.w2.setAttribute('d', p2);
        c.w.style.opacity = clamp(a3 * 4).toFixed(3); c.w2.style.opacity = clamp(a3 * 4).toFixed(3);
        c.lv.forEach((l) => (l.style.opacity = clamp((a2 - 0.3) / 0.5).toFixed(3)));
        draw(c.line, e4); c.relief.setAttribute('r', (60 + 140 * e4).toFixed(1)); c.relief.style.opacity = (a4 > 0 ? 1 - 0.8 * e4 : 0).toFixed(3);
        c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
      } else if (id === 'knee') {
        c.tr.style.opacity = (clamp(a3 * 4) * (1 - 0.75 * a4)).toFixed(3);
        c.beam.style.opacity = (0.75 + 0.25 * Math.sin(tm * 6)).toFixed(3);
        c.phot.forEach((p, k) => { const fr = (tm * 0.45 + k / c.phot.length) % 1; p.setAttribute('cx', mix(884, 500, fr).toFixed(1)); p.setAttribute('cy', mix(118, 644, fr).toFixed(1)); p.style.opacity = Math.sin(Math.PI * fr).toFixed(3); });
        c.cells.forEach((cl, k) => { cl.style.opacity = ((0.35 + 0.65 * Math.abs(Math.sin(tm * 1.4 + k))) * (0.4 + 0.6 * e3)).toFixed(3); });
        const A = arcD(500, 650, 340, 90, 90 + 125 * e4); c.arc.setAttribute('d', A.d); c.dot.setAttribute('cx', A.x.toFixed(1)); c.dot.setAttribute('cy', A.y.toFixed(1));
        c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
      }
    };
    const render = () => {
      const P = prog * N, tm = RM ? 1.2 : performance.now() / 1000;
      let top = 0;
      C.forEach((c, i) => {
        const t = P - i, e = i === 0 ? 1 : clamp((t + ENT) / ENT), hidden = e <= 0 || (i < N - 1 && P - (i + 1) >= 0);
        c.el.style.visibility = hidden ? 'hidden' : '';
        if (e > 0.5) top = i;
        if (hidden) return;
        const ee = io3(e);
        c.el.style.clipPath = e < 1 ? `inset(${((1 - ee) * 100).toFixed(2)}% 0 0 0)` : 'none';
        const a = phaseOf(clamp(t)), [a1, a2, a3, a4] = a;
        const z = (1 + 0.06 * io3(a1) + 0.04 * io3(a3) + (e < 1 ? 0.08 * (1 - ee) : 0)).toFixed(4);
        c.ph.style.transform = `scale(${z})`; c.pl.style.transform = `scale(${z})`;
        c.xr.style.clipPath = `inset(0 0 ${((1 - io3(a2)) * 100).toFixed(2)}% 0)`;
        c.svg.style.color = heat(a3);
        c.hot.style.opacity = (io3(a1) * (1 - 0.6 * a4)).toFixed(3);
        c.ring.style.opacity = (a1 * (1 - a3)).toFixed(3);
        draw(c.retc, io3(a2)); c.retc.style.opacity = (1 - 0.8 * a4).toFixed(3);
        specific(c, a, tm);
      });
      const c = C[top], t = clamp(P - top), ph4 = phaseOf(t), [a1, a2, a3, a4] = ph4, pi = t < 0.18 ? 0 : t < 0.4 ? 1 : t < 0.72 ? 2 : 3;
      if (top !== active) {
        active = top; idx.textContent = String(top + 1).padStart(2, '0');
        txts.forEach((x, k) => x.classList.toggle('is-on', k === top));
        tints.forEach((x, k) => x.classList.toggle('is-on', k === top));
        lst.forEach((b, k) => b.classList.toggle('is-on', k === top));
        tagB.textContent = c.d.tag; fEl.textContent = c.d.f; uEl.textContent = c.d.u;
      }
      lst.forEach((b, k) => b.style.setProperty('--f', clamp(P - k).toFixed(3)));
      const phw = ['Locate', 'Scan', 'Treat', 'Move'][pi]; if (phw !== curPh) { curPh = phw; phEl.textContent = phw; }
      segs.forEach((s, k) => s.style.setProperty('--f', ph4[k].toFixed(3)));
      const scanOn = a2 > 0 && a2 < 1;
      scan.style.opacity = scanOn ? 1 : 0; if (scanOn) scan.style.transform = `translateY(${(io3(a2) * H).toFixed(1)}px)`;
      const st = a4 > 0.3 ? 'relieved' : a3 > 0.04 ? 'in treatment' : a2 > 0.04 ? 'scanning' : 'located';
      if (st !== curSt) { curSt = st; tagS.textContent = st; }
      const flip = c.L.Tx + 260 > W ? 1 : 0;
      if (flip !== curFlip) { call.classList.toggle('is-flip', !!flip); curFlip = flip; }
      const cy = c.L.Ty - call.offsetHeight / 2, cx = clamp(flip ? c.L.Tx - call.offsetWidth - 10 : c.L.Tx + 10, 8, W - call.offsetWidth - 8);
      call.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
      call.style.opacity = clamp(a1 * 3 - 0.4).toFixed(3);
      callI.style.transform = `scaleX(${clamp(a1 * 2.2 - 0.3).toFixed(3)})`;
      fact.style.opacity = clamp(a3 * 3).toFixed(3); fact.style.transform = `translateY(${((1 - clamp(a3 * 3)) * 12).toFixed(1)}px)`;
      meter.style.setProperty('--m', (0.06 + 0.75 * io3(a3) + 0.13 * io3(a4)).toFixed(3));
    };
    lst.forEach((b, i) => b.addEventListener('click', () => scrollToY(sec.getBoundingClientRect().top + scrollY + ((i + 0.02) / N) * (sec.offsetHeight - innerHeight))));
    ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; } });
    new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
    g.ticker.add(() => { if (inView) render(); });
    layout(); addEventListener('resize', layout);
  };

  const boot = () => { const hd = $('.az-head'); if (hd) hd.classList.add('on-light'); hero(); stage(); ST.refresh(); };
  if (d.readyState === 'complete') boot(); else addEventListener('load', boot);
})();
