/* AROGYATI — new concept. Hero: an x-ray lens that looks beneath the pain. Stage: four places pain lives,
   each one located, scanned, treated and moved again, all scrubbed by scroll. GSAP + ScrollTrigger + DrawSVG. */
(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger; if (!g || !ST) return;
  if (window.DrawSVGPlugin) g.registerPlugin(window.DrawSVGPlugin);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const RED = [255, 74, 61], AMB = [255, 176, 64], GRN = [201, 226, 101];
  const mixc = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
  const heat = (t) => { const c = t < 0.5 ? mixc(RED, AMB, t * 2) : mixc(AMB, GRN, (t - 0.5) * 2); return `rgb(${c[0]},${c[1]},${c[2]})`; };
  const draw = (el, f) => { if (!el) return; if (window.DrawSVGPlugin) g.set(el, { drawSVG: `0% ${(clamp(f) * 100).toFixed(2)}%` }); else el.style.opacity = f; };
  const whenReady = (fn) => { const t0 = performance.now(); const chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? fn() : setTimeout(chk, 120)); chk(); };

  /* ================= HERO: the lens ================= */
  const hero = () => {
    const sec = $('.nch'); if (!sec) return;
    const media = $('.nch__media'), ph = $('.nch__ph'), xr = $('.nch__xr'), lens = $('.nch__lens'), lab = $('.nch__lensl');
    const copy = $('.nch__copy'), dark = $('.nch__dark'), veil = $('.nch__veil'), fades = $$('.nch__facts, .nch__hint');
    const spots = $$('.nch__hs').map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y, s: $('small', el).textContent, n: $('b', el).lastChild.textContent }));
    const IW = 1800, IH = 1200;
    let W = 0, H = 0, r0 = 120, mob = false, q = 0, on = true, last = -1e9, auto = 0, autoT = 0;
    const L = { x: 0, y: 0 }, T = { x: 0, y: 0 }, intro = { v: RM ? 1 : 0 };
    const layout = () => {
      W = media.clientWidth; H = media.clientHeight; mob = innerWidth < 900;
      const px = mob ? 0.5 : 0.42, py = mob ? 0.4 : 0.5, s = Math.max(W / IW, H / IH), ox = (W - IW * s) * px, oy = (H - IH * s) * py;
      spots.forEach((p) => { p.sx = ox + p.x * IW * s; p.sy = oy + p.y * IH * s; p.el.style.transform = `translate(${p.sx.toFixed(1)}px,${p.sy.toFixed(1)}px)`; p.el.classList.toggle('is-left', mob ? p.sx > W * 0.55 : p.sx > W * 0.48); });
      r0 = mob ? Math.round(Math.min(W, H) * 0.2) : Math.round(clamp(W * 0.085, 96, 140));
      if (!L.x) { L.x = T.x = spots[0].sx; L.y = T.y = spots[0].sy; }
      spots.forEach((p) => (p.el.style.visibility = p.sx < 10 || p.sx > W - 10 ? 'hidden' : ''));
    };
    const pick = () => { const vis = spots.filter((p) => p.sx > 40 && p.sx < W - 40 && p.sy > 40 && p.sy < H - 40), p = (vis.length ? vis : spots)[auto % (vis.length || spots.length)]; T.x = p.sx; T.y = p.sy; auto++; };
    if (FINE) media.parentElement.addEventListener('pointermove', (e) => { const r = media.getBoundingClientRect(); T.x = e.clientX - r.left; T.y = e.clientY - r.top; last = performance.now(); }, { passive: true });
    const frame = (t, dt) => {
      if (!on) return;
      const now = performance.now();
      if (!RM && now - last > 2600 && now > autoT) { pick(); autoT = now + 2900; }
      const k = RM ? 1 : 1 - Math.pow(0.88, Math.min(dt || 16, 50) / 16);
      L.x += (T.x - L.x) * k; L.y += (T.y - L.y) * k;
      const drift = RM || now - last < 2600 ? 0 : 1, tt = now / 1000;
      const lx = L.x + Math.sin(tt * 1.3) * 10 * drift, ly = L.y + Math.cos(tt * 1.1) * 8 * drift;
      const e = io3(clamp((q - 0.08) / 0.8)), diag = Math.hypot(W, H);
      const r = mix(r0 * intro.v, diag, e), cx = mix(lx, W / 2, e), cy = mix(ly, H / 2, e);
      xr.style.clipPath = `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      lens.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`; lens.style.setProperty('--r', r.toFixed(1) + 'px');
      lens.style.opacity = (intro.v * (1 - clamp(q / 0.3))).toFixed(3);
      let best = null, bd = 1e9;
      spots.forEach((p) => { const dd = Math.hypot(p.sx - cx, p.sy - cy), inn = dd < r * 0.95 && q < 0.2 && intro.v > 0.6; p.el.classList.toggle('is-in', inn); if (inn && dd < bd) { bd = dd; best = p; } });
      lab.style.opacity = best ? 0 : 1;
    };
    const scrollFx = () => {
      g.set(copy, { opacity: 1 - clamp(q / 0.32), y: -60 * clamp(q / 0.4) });
      fades.forEach((f) => (f.style.opacity = (1 - clamp(q / 0.2)).toFixed(3)));
      spots.forEach((p) => (p.el.style.opacity = (1 - clamp(q / 0.25)).toFixed(3)));
      dark.style.opacity = clamp((q - 0.72) / 0.26).toFixed(3);
      if (veil) veil.style.opacity = (1 - clamp(q / 0.3)).toFixed(3);
      ph.style.transform = `scale(${(1 + 0.08 * q).toFixed(4)})`;
    };
    layout(); addEventListener('resize', layout); d.fonts && d.fonts.ready.then(layout);
    ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { q = s.progress; scrollFx(); } });
    ST.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => (on = s.isActive) });
    g.ticker.add(frame);
    if (RM) return;
    // intro: photo settles, title words rise out of their masks, lens opens on the neck
    const title = $('[data-nc-title]');
    g.set(title, { opacity: 0 }); g.set('[data-nc-in]', { opacity: 0 });
    whenReady(() => {
      let words = [];
      if (window.SplitText) { const sp = window.SplitText.create(title, { type: 'words', tag: 'span' }); words = sp.words; words.forEach((w) => { const m = d.createElement('span'); m.className = 'nc-w'; w.parentNode.insertBefore(m, w); m.appendChild(w); }); }
      g.set(title, { opacity: 1 });
      const tl = g.timeline();
      tl.fromTo(ph, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power3.out', clearProps: 'transform' }, 0)
        .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.15, stagger: 0.08, ease: 'power4.out' }, 0.25)
        .fromTo('[data-nc-in]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.55)
        .to(intro, { v: 1, duration: 1.3, ease: 'power3.out' }, 0.7)
        .fromTo('.nch__hs i, .nch__hs u', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 0.9);
    });
  };

  /* ================= STAGE: pain to relief ================= */
  const stage = () => {
    const sec = $('.ncs'); if (!sec) return;
    const D = JSON.parse($('#ncs-data').textContent), N = D.length;
    const win = $('.ncs__win'), txts = $$('.ncs-t'), phs = $$('.ncs__phases li'), navb = $$('.ncs__nav button');
    const scan = $('.ncs__scan'), tag = $('.ncs__tag'), tagSvg = $('svg', tag), tagB = $('[data-ncs-tag]'), tagS = $('[data-ncs-st]');
    const hud = $('[data-ncs-hud]'), mod = $('.ncs__mod'), fEl = $('[data-ncs-f]'), uEl = $('[data-ncs-u]'), vEl = $('[data-ncs-v]'), vas = $('.ncs__vas'), bars = $$('.ncs__bars i'), idx = $('[data-ncs-i]');
    const C = $$('.ncs-c').map((el, i) => ({
      el, d: D[i], ph: $('.ncs-c__ph', el), pl: $('.ncs-c__pl', el), xr: $('.ncs-c__xr', el), svg: $('svg.ncs-c__ov', el),
      at: $('.k-at', el), hot: $('.k-heat', el), rings: $$('.k-ring', el), retc: $('.k-retc', el), ret: $('.k-ret', el), tr: $('.k-tr', el), mv: $('.k-mv', el),
      v: $$('.k-v', el), chain: $('.k-chain', el), flows: $$('.k-flow', el), line: $('.k-line', el), f: $$('.k-f', el), fl: $('.k-fl', el),
      arc: $('.k-arc', el), dot: $('.k-dot', el), arm: $('.k-arm', el), w: $('.k-w', el), w2: $('.k-w2', el), lv: $$('.k-lv', el), relief: $('.k-relief', el),
      beam: $('.k-beam', el), phot: $$('.k-ph', el), cells: $$('.k-cell', el), L: {},
    }));
    let W = 0, H = 0, prog = 0, active = 0, inView = false, curStatus = '', curTag = -1;
    const place = (img, dims, Tx, Ty, out) => {
      const [w, h, fx, fy] = dims;
      const s = Math.max(Tx / (fx * w), (W - Tx) / ((1 - fx) * w), Ty / (fy * h), (H - Ty) / ((1 - fy) * h)) * 1.02;
      const st = img.style; st.width = (w * s).toFixed(1) + 'px'; st.height = (h * s).toFixed(1) + 'px';
      st.left = (Tx - fx * w * s).toFixed(1) + 'px'; st.top = (Ty - fy * h * s).toFixed(1) + 'px';
      st.transformOrigin = `${(fx * w * s).toFixed(1)}px ${(fy * h * s).toFixed(1)}px`;
      if (out) out.s = s;
    };
    const layout = () => {
      W = win.clientWidth; H = win.clientHeight;
      C.forEach((c) => {
        const Tx = c.d.T[0] * W, Ty = c.d.T[1] * H; c.L.Tx = Tx; c.L.Ty = Ty;
        place(c.ph, c.d.ph, Tx, Ty); place(c.pl, c.d.xr, Tx, Ty, c.L);
        const [w, h, fx, fy] = c.d.xr;
        c.at.setAttribute('transform', `translate(${(w * fx).toFixed(1)} ${(h * fy).toFixed(1)}) scale(${(1 / c.L.s).toFixed(4)})`);
        c.hot.setAttribute('r', Math.round(Math.min(W, H) * 0.24));
      });
      render(true);
    };
    const phaseOf = (t) => [clamp(t / 0.18), clamp((t - 0.18) / 0.22), clamp((t - 0.4) / 0.32), clamp((t - 0.72) / 0.16)];
    const arcD = (cx, cy, R, a0, a1) => {
      const r0 = (a0 * Math.PI) / 180, r1 = (a1 * Math.PI) / 180, large = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 1 : 0;
      return { d: `M${(cx + R * Math.cos(r0)).toFixed(1)} ${(cy + R * Math.sin(r0)).toFixed(1)}A${R} ${R} 0 ${large} ${sw} ${(cx + R * Math.cos(r1)).toFixed(1)} ${(cy + R * Math.sin(r1)).toFixed(1)}`, x: cx + R * Math.cos(r1), y: cy + R * Math.sin(r1) };
    };
    const ENT = 0.14;
    const specific = (c, a, tm) => {
      const [a1, a2, a3, a4] = a, e3 = io3(a3), e4 = io3(a4), col = heat(a3), id = c.d.id;
      if (id === 'neck') {
        const P = c.d.d.pts, n = c.d.d.n, mis = [0, 18, -24, 32, -16, 24, 0], ang0 = (Math.atan2(n[1], n[0]) * 180) / Math.PI, ang = ang0 > 90 ? ang0 - 180 : ang0 < -90 ? ang0 + 180 : ang0;
        const pts = P.map((p, k) => [p[0] + n[0] * mis[k] * (1 - e3), p[1] + n[1] * mis[k] * (1 - e3)]);
        c.v.forEach((v, k) => v.setAttribute('transform', `translate(${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}) rotate(${ang.toFixed(2)})`));
        c.chain.setAttribute('d', 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'));
        c.tr.style.opacity = (clamp((a2 - 0.35) / 0.5) * (1 - 0.35 * a4)).toFixed(3);
        c.flows.forEach((f, k) => { draw(f, e3); f.style.opacity = (0.35 + 0.45 * Math.abs(Math.sin(tm * 2 + k))).toFixed(3); });
        draw(c.line, e4);
      } else if (id === 'shoulder') {
        const [hx, hy] = c.d.d.h, R = c.d.d.R;
        c.tr.style.opacity = (clamp(a3 * 4) * (1 - 0.6 * a4)).toFixed(3);
        c.f.forEach((f, k) => { const fr = (tm * 0.55 + k / c.f.length) % 1; f.setAttribute('r', (70 + fr * 360).toFixed(1)); f.style.opacity = ((1 - fr) * 0.9).toFixed(3); });
        if (c.fl) c.fl.style.strokeDashoffset = (-tm * 60).toFixed(1);
        const A = arcD(hx, hy, R, 82, 82 - 165 * e4); c.arc.setAttribute('d', A.d);
        c.dot.setAttribute('cx', A.x.toFixed(1)); c.dot.setAttribute('cy', A.y.toFixed(1));
        c.arm.setAttribute('x2', mix(hx, A.x, 0.92).toFixed(1)); c.arm.setAttribute('y2', mix(hy, A.y, 0.92).toFixed(1));
        c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
      } else if (id === 'back') {
        const { y, x0, x1 } = c.d.d; let p1 = '', p2 = '';
        for (let k = 0; k <= 64; k++) {
          const u = k / 64, x = mix(x0, x1, u), env = Math.sin(Math.PI * u);
          const noise = 0.6 * Math.sin(2 * Math.PI * 9.3 * u + tm * 11) + 0.38 * Math.sin(2 * Math.PI * 15.7 * u - tm * 17) + 0.3 * Math.sin(2 * Math.PI * 2.1 * u + tm * 3);
          const clean = Math.sin(2 * Math.PI * 4 * u - tm * 6.3);
          const v = mix(noise, clean, e3), v2 = mix(noise, Math.sin(2 * Math.PI * 4 * u - tm * 6.3 - 0.9), e3);
          p1 += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + 52 * env * v).toFixed(1);
          p2 += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + 34 * env * v2).toFixed(1);
        }
        c.w.setAttribute('d', p1); c.w2.setAttribute('d', p2);
        c.w.style.opacity = clamp(a3 * 4).toFixed(3); c.w2.style.opacity = (clamp(a3 * 4) * 0.8).toFixed(3);
        c.w.setAttribute('stroke', a3 > 0.6 ? heat(a3) : '#9EE6FF');
        c.lv.forEach((l) => (l.style.opacity = clamp((a2 - 0.3) / 0.5).toFixed(3)));
        draw(c.line, e4); c.relief.setAttribute('r', (60 + 150 * e4).toFixed(1)); c.relief.style.opacity = (a4 > 0 ? 1 - 0.7 * e4 : 0).toFixed(3);
      } else if (id === 'knee') {
        c.tr.style.opacity = clamp(a3 * 4).toFixed(3);
        c.beam.style.opacity = (0.65 + 0.35 * Math.sin(tm * 18)) * (1 - 0.8 * a4);
        c.phot.forEach((p, k) => { const fr = (tm * 0.85 + k / c.phot.length) % 1; p.setAttribute('cx', mix(884, 500, fr).toFixed(1)); p.setAttribute('cy', mix(118, 644, fr).toFixed(1)); p.style.opacity = (Math.sin(Math.PI * fr) * (1 - a4)).toFixed(3); });
        c.cells.forEach((cl, k) => { cl.setAttribute('stroke', col); cl.setAttribute('fill', col.replace('rgb', 'rgba').replace(')', ',.16)')); cl.style.opacity = (0.4 + 0.6 * Math.abs(Math.sin(tm * 2.2 + k))).toFixed(3); });
        const A = arcD(500, 650, 360, 90, 90 + 130 * e4); c.arc.setAttribute('d', A.d); c.dot.setAttribute('cx', A.x.toFixed(1)); c.dot.setAttribute('cy', A.y.toFixed(1));
        c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
      }
      if (id === 'neck' || id === 'back') c.mv.style.opacity = clamp(a4 * 4).toFixed(3);
    };
    const render = (force) => {
      const P = prog * N, tm = RM ? 1.2 : performance.now() / 1000;
      let top = 0;
      C.forEach((c, i) => {
        const t = P - i, e = i === 0 ? 1 : clamp((t + ENT) / ENT), hidden = e <= 0 || (i < N - 1 && P - (i + 1) >= 0);
        c.el.style.visibility = hidden ? 'hidden' : '';
        if (e > 0.5) top = i;
        if (hidden) return;
        c.el.style.clipPath = e < 1 ? `inset(${((1 - io3(e)) * 100).toFixed(2)}% 0 0 0)` : 'none';
        const a = phaseOf(clamp(t)), [a1, a2, a3, a4] = a, col = heat(a3);
        const z = (1 + 0.07 * io3(a1) + 0.05 * io3(a3)).toFixed(4);
        c.ph.style.transform = `scale(${z})`; c.pl.style.transform = `scale(${z})`;
        c.xr.style.clipPath = `inset(0 0 ${((1 - io3(a2)) * 100).toFixed(2)}% 0)`;
        c.svg.style.color = col;
        c.hot.style.opacity = (io3(a1) * (1 - 0.55 * a4)).toFixed(3);
        c.rings.forEach((r) => (r.style.opacity = (a1 * (1 - a3)).toFixed(3)));
        draw(c.retc, io3(a2)); c.ret.style.opacity = (a2 > 0 ? 1 - 0.7 * a4 : 0).toFixed(3);
        specific(c, a, tm);
      });
      // shared HUD follows the chapter on top
      const c = C[top], t = clamp(P - top), [a1, a2, a3, a4] = phaseOf(t), col = heat(a3), ph = t < 0.18 ? 0 : t < 0.4 ? 1 : t < 0.72 ? 2 : 3;
      if (top !== active || force) {
        active = top; idx.textContent = String(top + 1).padStart(2, '0');
        txts.forEach((x, k) => x.classList.toggle('is-on', k === top));
        navb.forEach((b, k) => b.classList.toggle('is-on', k === top));
        tagB.textContent = c.d.tag; hud.textContent = c.d.hud; fEl.textContent = c.d.f; uEl.textContent = c.d.u;
      }
      phs.forEach((li, k) => { li.classList.toggle('is-on', k === ph); li.classList.toggle('is-done', k < ph); li.style.setProperty('--f', [a1, a2, a3, a4][k].toFixed(3)); });
      navb.forEach((b, k) => b.style.setProperty('--f', clamp(P - k).toFixed(3)));
      const scanOn = a2 > 0 && a2 < 1 && top === active;
      scan.style.opacity = scanOn ? 1 : 0; if (scanOn) scan.style.transform = `translateY(${(io3(a2) * H).toFixed(1)}px)`;
      const st = a4 > 0.3 ? 'Relief' : a3 > 0.04 ? 'Treating' : a2 > 0.04 ? 'Scanning' : 'Pain located';
      if (st !== curStatus) { curStatus = st; tagS.textContent = st; }
      tag.style.color = col; tag.style.setProperty('--tc', col);
      const sw = tagSvg.clientWidth || 64, sh = tagSvg.clientHeight || 56, ox = (2 / 64) * sw, oy = (54 / 56) * sh;
      const flip = c.L.Tx + sw + 190 > W;
      if (curTag !== top * 2 + flip) { tag.classList.toggle('is-flip', flip); curTag = top * 2 + flip; }
      const tx = flip ? c.L.Tx - tag.offsetWidth + ox : c.L.Tx - ox;
      tag.style.transform = `translate(${tx.toFixed(1)}px,${(c.L.Ty - oy).toFixed(1)}px)`;
      tag.style.opacity = clamp(a1 * 3 - 0.3).toFixed(3);
      mod.style.opacity = clamp(a3 * 3).toFixed(3);
      const v = Math.round(mix(8, 2, io3(a3)));
      if (vEl.textContent !== String(v)) { vEl.textContent = v; bars.forEach((b, k) => b.classList.toggle('on', k < v)); }
      vas.style.setProperty('--vc', col);
    };
    navb.forEach((b, i) => b.addEventListener('click', () => {
      const y = sec.getBoundingClientRect().top + scrollY + ((i + 0.02) / N) * (sec.offsetHeight - innerHeight);
      if (window.__azLenis) window.__azLenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: 'smooth' });
    }));
    ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; } });
    new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
    g.ticker.add(() => { if (inView) render(false); });
    layout(); addEventListener('resize', layout);
  };

  const boot = () => { hero(); stage(); ST.refresh(); };
  if (d.readyState === 'complete') boot(); else addEventListener('load', boot);
})();
