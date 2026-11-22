/* AROGYATI — new concept: "From pain to motion".
   A 3D particle human. The body is an athletic rigged base character (CC0, "Superhero Male" from Quaternius'
   Universal Base Characters, quaternius.com) sampled on smooth curved patches into brand-coloured points,
   skinned on the GPU to its real skeleton — so every
   movement is a true joint rotation with smooth skin, never cut-out parts. Inside it, a particle spine and nerve
   paths. It opens as the Arogyati logo figure, which unfolds into the body; four pains (neck, shoulder, lower back, knee) are located, treated and
   healed, the body turns and moves freely, then its particles reform into the Arogyati logo figure. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';

(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'); if (!sec || !g || !ST) return;
  const cv = $('.ncx__cv', sec), ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const MOB = innerWidth < 900, NS = MOB ? 46000 : 92000, NI = 0, NH = 0;
  const MODEL = '/home/assets/3d/body.glb', DEG = Math.PI / 180, TAU = Math.PI * 2;

  /* ---------- poses: rotations about world axes, applied relative to each bone's rest frame ---------- */
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  const q = (...rs) => rs.reduce((acc, [ax, deg]) => acc.premultiply(new THREE.Quaternion().setFromAxisAngle(ax, deg * DEG)), new THREE.Quaternion());
  // arm poses are written as abduction angles (0 = hanging, 90 = horizontal) and converted from the model's rest angle
  let POSE = null;
  const makePoses = (rest) => {
    const arms = (l, r, o = {}) => ({ LeftArm: q([Z, l - rest]), RightArm: q([Z, rest - r]), ...o });
    const RELAX = { ...arms(13, 13), LeftForeArm: q([Z, 7]), RightForeArm: q([Z, -7]) };
    const P = (o) => ({ ...RELAX, ...o });
    POSE = {
      UP: P({}),
      NECK: P({ Neck: q([Z, 10], [X, 8]), Head: q([Z, 6]), LeftShoulder: q([Z, 5]) }),           // guarded, tilted neck
      SH: P({ LeftArm: q([Z, 88 - rest], [Y, -14]), LeftForeArm: q([Z, 8]) }),                    // shoulder lifts freely
      SLUMP: P({ Spine: q([X, 10], [Z, -4]), Spine1: q([X, 7]), Neck: q([X, -6]) }),              // bent lower back
      KNEE: P({ RightUpLeg: q([X, -18]), RightLeg: q([X, 34]), RightFoot: q([X, -12]), Hips: q([Z, 2]) }),
      TP: P({ ...arms(78, 78), LeftForeArm: q(), RightForeArm: q() }),
      VP: P({ ...arms(128, 128), LeftForeArm: q([Z, 6]), RightForeArm: q([Z, -6]), Spine1: q([X, -4]), Head: q([X, -8]) }),
    };
  };
  const KEYS = [[0, 'UP'], [0.105, 'UP'], [0.13, 'NECK'], [0.19, 'NECK'], [0.225, 'UP'], [0.34, 'UP'], [0.36, 'SH'], [0.38, 'SH'], [0.395, 'UP'],
    [0.44, 'SLUMP'], [0.5, 'SLUMP'], [0.545, 'UP'], [0.655, 'UP'], [0.675, 'KNEE'], [0.69, 'KNEE'], [0.705, 'UP'], [0.82, 'UP'], [0.852, 'VP'], [1, 'VP']];
  // walking: full in the hero and between chapters, stops while a pain is treated, resumes once it heals
  const walkW = (p) => {
    let w = 1;
    for (let a = 1; a <= 4; a++) { const [s0, e0] = R[a]; if (p >= s0 && p < e0) { const c = (p - s0) / (e0 - s0); w = 1 - seg(c, 0, 0.1) + seg(c, 0.8, 0.95); } }
    return clamp(w * (1 - seg(p, 0.82, 0.85)));
  };
  const walk = (n, ph, w) => {
    const s1 = Math.sin(ph), c1 = Math.cos(ph), sw = (v) => v * w;
    switch (n) {
      case 'Hips': return q([Y, sw(6 * s1)], [Z, sw(2.5 * c1)]);
      case 'Spine1': return q([Y, sw(-7 * s1)], [X, sw(3)]);
      case 'Neck': return q([Y, sw(3 * s1)]);
      case 'LeftUpLeg': return q([X, sw(-24 * s1 - 4)]);
      case 'RightUpLeg': return q([X, sw(24 * s1 - 4)]);
      case 'LeftLeg': return q([X, sw(6 + 46 * Math.pow(Math.max(0, c1), 1.6))]);
      case 'RightLeg': return q([X, sw(6 + 46 * Math.pow(Math.max(0, -c1), 1.6))]);
      case 'LeftFoot': return q([X, sw(-14 * Math.max(0, c1) + 8 * Math.max(0, -s1))]);
      case 'RightFoot': return q([X, sw(-14 * Math.max(0, -c1) + 8 * Math.max(0, s1))]);
      case 'LeftArm': return q([X, sw(20 * s1)]);
      case 'RightArm': return q([X, sw(-20 * s1)]);
      case 'LeftForeArm': return q([X, sw(-12 - 8 * Math.max(0, -s1))]);
      case 'RightForeArm': return q([X, sw(-12 - 8 * Math.max(0, s1))]);
      default: return null;
    }
  };
  const YAW = [[0, -0.62], [0.1, -0.62], [0.14, -0.12], [0.26, -0.12], [0.3, -0.55], [0.42, -0.55], [0.47, Math.PI], [0.56, Math.PI], [0.61, TAU + 0.38], [0.72, TAU + 0.38], [0.75, TAU - 0.5], [0.815, 2 * TAU], [1, 2 * TAU]];
  const keyAt = (K, p) => { let k = 0; while (k < K.length - 2 && p > K[k + 1][0]) k++; const [t0, a] = K[k], [t1, b] = K[k + 1]; return [a, b, ease(clamp((p - t0) / Math.max(1e-4, t1 - t0)))]; };
  const RIGMAP = { pelvis: 'Hips', spine01: 'Spine', spine02: 'Spine1', spine03: 'Spine2', neck01: 'Neck', Head: 'Head', claviclel: 'LeftShoulder', upperarml: 'LeftArm', lowerarml: 'LeftForeArm', handl: 'LeftHand', clavicler: 'RightShoulder', upperarmr: 'RightArm', lowerarmr: 'RightForeArm', handr: 'RightHand', thighl: 'LeftUpLeg', calfl: 'LeftLeg', footl: 'LeftFoot', balll: 'LeftToe', thighr: 'RightUpLeg', calfr: 'RightLeg', footr: 'RightFoot', ballr: 'RightToe', spine: 'Hips', spine001: 'Spine', spine002: 'Spine1', spine003: 'Spine2', spine004: 'Neck', spine005: 'Head', shoulderL: 'LeftShoulder', upperarmL: 'LeftArm', forearmL: 'LeftForeArm', handL: 'LeftHand', shoulderR: 'RightShoulder', upperarmR: 'RightArm', forearmR: 'RightForeArm', handR: 'RightHand', thighL: 'LeftUpLeg', shinL: 'LeftLeg', footL: 'LeftFoot', toeL: 'LeftToe', thighR: 'RightUpLeg', shinR: 'RightLeg', footR: 'RightFoot', toeR: 'RightToe' };
  const BONE_NAMES = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];

  /* ---------- pains & chapters ---------- */
  const AREAS = [ // [bone, toward bone, t, radius]
    ['Neck', 'Head', 0.25, 0.05], ['LeftArm', 'LeftForeArm', 0.08, 0.05], ['Spine', 'Hips', 0.2, 0.065], ['RightLeg', 'RightUpLeg', 0.04, 0.045],
  ];
  const R = [[0, 0.1], [0.1, 0.26], [0.26, 0.42], [0.42, 0.58], [0.58, 0.74], [0.74, 0.86], [0.86, 1.01]];
  const areaState = (a, p) => {
    const [s, e] = R[a + 1], c = (p - s) / (e - s);
    if (c < 0) return { pain: 0, calm: 0, c };
    if (c > 1) return { pain: 0, calm: 0, c };
    return { pain: seg(c, 0, 0.22) * (1 - seg(c, 0.45, 0.8)), calm: bell(c, 0.5, 1.02), c };
  };
  const chs = $$('.ncx-ch', sec), word = $('[data-ncx-word]'), bar = $('.ncx__bar i'), num = $('[data-ncx-n]'), tint = $('.ncx__tint');
  const tag = $('.ncx__tag'), tagB = $('[data-ncx-tag]'), tagE = $('[data-ncx-tagm]');
  const WORDS = ['WELLNESS', 'NECK', 'SHOULDER', 'BACK', 'KNEE', 'MOVE', 'AROGYATI'];
  const TINTS = ['#E4EEDD', '#F6E6DA', '#DFEAF6', '#E8E5F5', '#F3E9DC', '#E3F0E6', '#E4EEDD'];
  const TAGS = [null, ['Neck pain', 'Osteopathy'], ['Frozen shoulder', 'Super Inductive System'], ['Lower back pain', 'Matrix Rhythm Therapy'], ['Knee pain', 'Class IV Laser']];
  let cur = -1, scanT = -10, chT = -10, wTok = 0;
  const wordBox = word && word.parentNode;
  const setWord = (txt) => { word.innerHTML = [...txt].map((ch) => `<i>${ch}</i>`).join(''); return $$('i', word); };
  const wordIn = (k) => { const ls = setWord(WORDS[k]); g.fromTo(ls, { yPercent: 90, opacity: 0, rotate: 5 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.045, ease: 'expo.out' }); };
  const setChapter = (k) => {
    if (k === cur) return; cur = k; scanT = performance.now() / 1000; chT = g.ticker.time;
    chs.forEach((c, i) => c.classList.toggle('is-on', i === k));
    if (num) num.textContent = String(k + 1).padStart(2, '0');
    if (tint) tint.style.setProperty('--t', TINTS[k]);
    if (TAGS[k] && tagB) { tagB.textContent = TAGS[k][0]; tagE.textContent = TAGS[k][1]; }
    if (word) {
      const tok = ++wTok, old = $$('i', word);
      if (!old.length || RM) { if (RM) word.textContent = WORDS[k]; else wordIn(k); }
      else g.to(old, { yPercent: -70, opacity: 0, duration: 0.4, stagger: 0.02, ease: 'power2.in', overwrite: true, onComplete: () => { if (tok === wTok) wordIn(k); } });
    }
  };

  /* ---------- the window: behind the figure, footage of the body part in pain; each chapter opens it a different way ---------- */
  const arch = $('.ncx__arch', sec), meds = arch ? [...arch.children] : [], acap = $('.ncx__archcap', sec), acapT = acap && $('span', acap);
  const SHAPE = ['arch', 'lens', 'doors', 'blinds', 'arch', 'arch'];
  let mOn = -1, aw = 0, ah = 0;
  const setMed = (k) => {
    if (k === mOn) return; mOn = k;
    meds.forEach((m, i) => {
      const on = i === k;
      if (on && !m.getAttribute('src')) { if (m.dataset.poster) m.poster = m.dataset.poster; m.src = m.dataset.src; }
      m.classList.toggle('is-on', on);
      if (m.tagName === 'VIDEO') { if (on) { const pr = m.play(); if (pr) pr.catch(() => {}); } else m.pause(); }
    });
    if (k >= 0 && acapT) acapT.textContent = meds[k].dataset.cap;
  };
  const f1 = (v) => v.toFixed(1);
  const clipFor = (sh, r, w, h, px, py) => {
    if (sh === 'lens') { const rad = ease(r) * Math.hypot(Math.max(px, w - px), Math.max(py, h - py)); return `circle(${f1(rad)}px at ${f1(px)}px ${f1(py)}px)`; }
    if (sh === 'doors') {
      const gp = 7, lw = w / 2 - gp, rx = w / 2 + gp, a = lw * ease(clamp(r * 1.25)), b = (w - rx) * ease(clamp(r * 1.25 - 0.25));
      return `polygon(${f1(lw - a)}px 0px,${f1(lw)}px 0px,${f1(lw)}px ${h}px,${f1(lw - a)}px ${h}px,${f1(lw - a)}px 0px,${f1(rx)}px 0px,${f1(rx + b)}px 0px,${f1(rx + b)}px ${h}px,${f1(rx)}px ${h}px,${f1(rx)}px 0px)`;
    }
    if (sh === 'blinds') {
      const n = 7, sh2 = h / n, pts = [];
      for (let i = 0; i < n; i++) { const y0 = i * sh2, y1 = y0 + sh2 * ease(clamp(r * 1.7 - i * 0.1)); pts.push(`0px ${f1(y0)}px`, `${w}px ${f1(y0)}px`, `${w}px ${f1(y1)}px`, `0px ${f1(y1)}px`, `0px ${f1(y0)}px`); }
      pts.push('0px 0px'); return `polygon(${pts.join(',')})`;
    }
    const hi = (1 - r) * (w / 2 - 0.75), vi = (1 - ease(clamp(r * 1.6))) * h * 0.12, rt = Math.max(0.75, w / 2 - hi), rb = Math.min(rt, 22);
    return `inset(${f1(vi)}px ${f1(hi)}px ${f1(vi)}px ${f1(hi)}px round ${f1(rt)}px ${f1(rt)}px ${f1(rb)}px ${f1(rb)}px)`;
  };
  const drawArch = (p, states, act, lg, formed, t) => {
    if (!arch) return 0;
    let k = -1, r = 0;
    if (act >= 0) { const c = states[act].c; k = act; r = seg(c, 0.1, 0.32) * (1 - seg(c, 0.8, 0.97)) * (1 - lg); }
    else if (p >= R[5][0] && p < R[5][1]) { const c = (p - R[5][0]) / (R[5][1] - R[5][0]); k = 4; r = seg(c, 0.15, 0.38) * (1 - seg(c, 0.78, 0.96)); }
    else if (p >= R[6][0]) { k = 5; r = seg(p, 0.89, 0.97); }
    r *= formed;
    if (r < 0.002) { arch.style.visibility = 'hidden'; if (acap) acap.style.opacity = 0; setMed(-1); return 0; }
    setMed(k);
    const sh = SHAPE[k], S0 = MOB ? Math.min(H * 0.5, W * 1.25) : Math.min(H * 0.8, W * 0.6);
    const w = Math.round(Math.min(W - 24, S0 * (sh === 'doors' ? (MOB ? 0.86 : 0.84) : sh === 'lens' ? (MOB ? 0.86 : 0.8) : MOB ? 0.8 : 0.72))), h = Math.round(S0 * 1.04);
    if (w !== aw || h !== ah) { aw = w; ah = h; arch.style.width = w + 'px'; arch.style.height = h + 'px'; }
    const x = (MOB ? W * 0.5 : W * 0.66) - smx * 10 - w / 2, y = (MOB ? H * 0.35 : H * 0.5) - smy * 6 - S0 * 0.54;
    let px = w / 2, py = h / 2; if (act >= 0) { const [qx2, qy2] = proj(areaPos(act)); px = qx2 - x; py = qy2 - y; }
    arch.style.visibility = 'visible';
    arch.style.transform = `translate3d(${f1(x)}px,${f1(y)}px,0)`;
    arch.style.clipPath = clipFor(sh, r, w, h, px, py);
    const m = meds[k];
    if (m) m.style.transform = m.tagName === 'VIDEO' ? `scale(${(1.22 - 0.22 * ease(r) + (m.dataset.crop ? 0.2 : 0)).toFixed(4)}) translateY(${((1 - r) * 4).toFixed(2)}%)`
      : `scale(${(1.2 - 0.12 * ease(r) + 0.025 * Math.sin(t * 0.18)).toFixed(4)}) translate3d(${(Math.sin(t * 0.13) * 1.4).toFixed(2)}%,${(Math.cos(t * 0.11) * 1.1).toFixed(2)}%,0)`;
    if (acap) { const ca = clamp((r - 0.7) / 0.3); acap.style.opacity = ca.toFixed(3); acap.style.transform = `translate3d(${f1(x - 16)}px,${f1(y + h * 0.62 + (1 - ca) * 10)}px,0) rotate(-90deg)`; }
    return r;
  };

  /* ---------- layers: back 2D (dust, platform) · GPU particles · front 2D (treatment graphics) ---------- */
  const mkCanvas = () => { const c = d.createElement('canvas'); c.className = 'ncx__cv'; c.setAttribute('aria-hidden', 'true'); return c; };
  const glc = mkCanvas(), fxc = mkCanvas(); cv.after(glc); glc.after(fxc); const fctx = fxc.getContext('2d');
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ canvas: glc, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' }); renderer.setClearColor(0x000000, 0); } catch (e) { renderer = null; }
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50), FOVT = Math.tan((26 * DEG) / 2);
  const rig = new THREE.Group(); scene.add(rig);
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uIntro: { value: RM ? 1 : 0 }, uLogo: { value: 0 }, uTime: { value: 0 }, uSize: { value: 2 },
    uMouse: { value: new THREE.Vector3(-9999, -9999, 90) }, uArea: { value: Array.from({ length: 4 }, () => new THREE.Vector4()) },
    uPain: { value: Array.from({ length: 4 }, () => new THREE.Vector2()) }, uSpine: { value: 0 }, uScan: { value: -2 }, uCz: { value: 0 },
  };

  // the living logo: side petals sway like leaves around the junction, the figure breathes, light drifts up it
  const LEAF = /* glsl */`
    const float LS = 0.62, LO = 0.178;
    vec3 leafPos(vec3 Pw, float r, float t){
      vec3 P = vec3(Pw.x / LS, (Pw.y - LO) / LS, Pw.z);
      vec2 piv = vec2(0.0, 0.52);
      float side = smoothstep(0.44, 0.54, P.y) * smoothstep(0.02, 0.07, abs(P.x)) * (1.0 - step(0.8, P.y) * step(abs(P.x), 0.085));
      float an = sign(P.x) * 0.055 * sin(t * 1.15) * side, c = cos(an), s = sin(an);
      vec2 d = P.xy - piv, qq = piv + vec2(d.x * c - d.y * s, d.x * s + d.y * c);
      qq.y += step(0.8, P.y) * step(abs(P.x), 0.085) * 0.01 * sin(t * 1.15 + 1.1);
      qq = vec2(0.0, 0.5) + (qq - vec2(0.0, 0.5)) * (1.0 + 0.012 * sin(t * 1.15));
      return vec3(qq.x * LS, qq.y * LS + LO, P.z) + 0.0025 * vec3(sin(t * 1.3 + r * 40.0), cos(t * 1.1 + r * 31.0), sin(t * 0.9 + r * 17.0));
    }
    vec3 leafCol(vec3 Pw, float t){
      float sweep = exp(-pow((Pw.y - LO) / LS - (fract(t * 0.16) * 1.6 - 0.3), 2.0) / 0.014);
      return mix(vec3(0.25, 0.42, 0.71), vec3(0.47, 0.64, 0.93), sweep * 0.45);
    }`;
  const VERT = /* glsl */`
    #include <common>
    #include <skinning_pars_vertex>
    attribute vec3 aLogo; attribute float aLv; attribute float aRnd; attribute float aDelay; attribute float aKind;
    uniform vec2 uRes; uniform float uIntro, uLogo, uTime, uSize, uSpine, uScan, uCz; uniform vec3 uMouse; uniform vec4 uArea[4]; uniform vec2 uPain[4];
    varying vec3 vCol; varying float vA; varying float vGlow; varying float vShine;
    float e3(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }
    ${LEAF}
    void main(){
      vec3 objectNormal = normal;
      #include <skinbase_vertex>
      #include <skinnormal_vertex>
      vec3 transformed = position;
      #include <skinning_vertex>
      vec4 wp = modelMatrix * vec4(transformed, 1.0);
      vec3 body = wp.xyz;
      if (aKind < 3.5 || aKind > 4.5) wp.xyz += 0.0012 * vec3(sin(uTime*0.9 + aRnd*40.0), cos(uTime*0.8 + aRnd*31.0), sin(uTime*0.7 + aRnd*17.0));
      if (aKind > 5.5) { // spiral streams around the body
        vec3 rq = position; float u = fract(aRnd + uTime * 0.03), st = step(0.5, rq.z), ang = u * 6.2832 * 1.6 + uTime * 0.35 + st * 3.14159;
        float rr = 0.22 + 0.025 * sin(u * 18.0 + uTime) + (rq.x - 0.5) * 0.07;
        wp.xyz = vec3(cos(ang) * rr, u * 1.1 - 0.03 + (rq.y - 0.5) * 0.05, sin(ang) * rr * 0.8); body = wp.xyz;
      }
      vec3 nW = normalize(mat3(modelMatrix) * objectNormal), nV = normalize(mat3(viewMatrix) * nW);
      vec4 mv0 = viewMatrix * vec4(body, 1.0);
      float fr = 1.0 - abs(dot(nV, normalize(-mv0.xyz)));
      // skin: soft studio light (key from upper left, fill, brand-blue rim); inside: spine (kind 1), nerves (kind 2)
      float key = max(dot(nV, normalize(vec3(-0.45, 0.65, 0.6))), 0.0), fill = max(dot(nV, normalize(vec3(0.7, -0.1, 0.5))), 0.0);
      float lit = clamp(key * 0.95 + fill * 0.22, 0.0, 1.0);
      // brand palette: olive green at the feet rising into Arogyati blue; soft studio light; crisp even dots
      vec3 OL = vec3(0.37, 0.43, 0.16), BL = vec3(0.25, 0.42, 0.71);
      vec3 base = mix(OL, BL, smoothstep(0.08, 0.62, body.y));
      vec3 shadowC = base * 0.8 + vec3(0.04, 0.06, 0.1), hiC = mix(base, vec3(1.0), 0.55);
      float lt = smoothstep(0.0, 1.0, lit);
      vec3 col = lt < 0.5 ? mix(shadowC, base, lt * 2.0) : mix(base, hiC, lt * 2.0 - 1.0);
      float rim = smoothstep(0.58, 0.97, fr);
      col = mix(col, vec3(0.6, 0.76, 1.0), rim * 0.75);
      float a = mix(0.64, 0.96, lt);
      a = max(a, rim);
      float band = 0.0;
      if (aKind < 0.5) a *= smoothstep(-0.1, 0.04, dot(nV, normalize(-mv0.xyz))); // back-facing skin never shows, even before the depth pass is on
      float glow = 0.0, shine = rim * 0.85 + smoothstep(0.82, 1.0, lit) * 0.45;
      if (aKind > 5.5) { col = mix(OL * 1.15, BL * 1.15, fract(aRnd + uTime * 0.03)); a = 0.8 * sin(3.14159 * fract(aRnd + uTime * 0.03)) * smoothstep(0.8, 1.0, uIntro) * (1.0 - clamp(uLogo * 3.0, 0.0, 1.0)) * (0.5 + 0.5 * sin(uTime * 3.0 + aRnd * 70.0)); }
      else if (aKind > 2.5) {
        float life = fract(uTime * 0.07 + aRnd * 9.0);
        wp.xyz += nW * life * 0.03 + vec3(0.0, life * 0.05, 0.0);
        col = mix(BL, OL * 1.2, fract(aRnd * 13.0)); a = sin(3.14159 * life) * 0.6;
      }
      else if (aKind > 1.5) { col = vec3(0.97, 0.55, 0.22); a = 0.42 + 0.25 * sin(uTime * 2.3 + aRnd * 50.0); glow = 0.6; }
      else if (aKind > 0.5) { col = mix(vec3(0.97, 0.58, 0.20), vec3(1.0, 0.72, 0.30), uSpine); a = (0.55 + 0.3 * uSpine) * (0.75 + 0.25 * sin(uTime * 3.0 + aRnd * 60.0)); glow = 1.0; }
      float hot = 0.0, calm = 0.0;
      for (int k = 0; k < 4; k++) { vec3 dd = body - uArea[k].xyz; float h = exp(-dot(dd,dd) / (uArea[k].w*uArea[k].w)); hot = max(hot, h * uPain[k].x); calm = max(calm, h * uPain[k].y); }
      col = mix(col, vec3(0.93, 0.36, 0.27), clamp(hot * 1.2, 0.0, 1.0)); a = mix(a, 1.0, clamp(hot, 0.0, 1.0));
      col = mix(col, vec3(0.36, 0.66, 0.27), clamp(calm, 0.0, 1.0)); a = mix(a, 1.0, clamp(calm, 0.0, 1.0));
      
      if (uLogo > 0.0 && aKind < 5.5) { float k = e3(clamp(uLogo * 1.15 - aRnd * 0.15, 0.0, 1.0)); wp.xyz = mix(wp.xyz, leafPos(aLogo, aRnd, uTime), k) + vec3(sin(k*3.14159) * (aRnd - 0.5) * 0.1, 0.0, sin(k*3.14159) * (aRnd - 0.5) * 0.2); col = mix(col, leafCol(aLogo, uTime), clamp(uLogo*1.6 - 0.3, 0.0, 1.0)); a = mix(a, 0.95 * aLv, clamp(uLogo*1.6 - 0.3, 0.0, 1.0)); }
      float kI = 1.0;
      if (uIntro < 1.0 && aKind < 5.5) {
        float k = e3(clamp((uIntro - aDelay) / 0.55, 0.0, 1.0)); kI = k;
        float sw = sin(k * 3.14159);
        wp.xyz = mix(leafPos(aLogo, aRnd, uTime), wp.xyz, k) + vec3((aRnd - 0.5) * 0.06, (fract(aRnd * 3.7) - 0.5) * 0.03, (fract(aRnd * 7.3) - 0.5) * 0.28) * sw;
        col = mix(leafCol(aLogo, uTime), col, smoothstep(0.15, 0.85, k)); a = mix(0.95 * aLv, a, k);
      }
      shine *= kI * (1.0 - clamp(uLogo * 3.0, 0.0, 1.0)) * (aKind < 0.5 ? 1.0 : 0.0);
      vec4 mv = viewMatrix * wp;
      vec4 cp = projectionMatrix * mv;
      // cursor parts the particles
      vec2 s = (cp.xy / cp.w * 0.5 + 0.5) * uRes; vec2 md = s - vec2(uMouse.x, uRes.y - uMouse.y); float ml = length(md);
      if (ml < uMouse.z && (aKind < 3.5 || aKind > 4.5)) { s += md / max(ml, 0.001) * (1.0 - ml / uMouse.z) * 16.0; cp.xy = ((s / uRes) * 2.0 - 1.0) * cp.w; }
      if (kI < 0.6) cp.z = -cp.w * 0.98; // the logo (inside the body's volume) is never hidden by the invisible body
      gl_Position = cp;
      float back = clamp((uCz - mv.z) / 0.22, 0.0, 1.0);
      gl_PointSize = uSize * (0.95 + aRnd * 0.1) * (aKind < 0.5 ? mix(1.0, 1.0 + 0.28 * lt + 0.28 * rim, kI * (1.0 - clamp(uLogo * 3.0, 0.0, 1.0))) : 1.0) * (aKind > 2.5 && aKind < 3.5 ? 1.5 : 1.0) * (1.0 + hot * 0.5 + calm * 0.3 + band * 0.7) * (1.0 - back * 0.3) * (1.0 + glow * (aKind > 3.5 && aKind < 4.5 ? 3.4 : 1.3));
      vCol = col; vA = a; vGlow = glow; vShine = shine;
    }`;
  const FRAG = /* glsl */`
    varying vec3 vCol; varying float vA; varying float vGlow; varying float vShine;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float r = length(c), a; vec3 col = vCol;
      if (vShine > 0.01 && vGlow < 0.01) { // soft round dot; lit and rim dots carry a faint halo and a brighter centre
        float core = smoothstep(0.5, 0.3, r), halo = exp(-r * r * 9.0) * smoothstep(0.5, 0.2, r) * 0.55 * vShine;
        a = max(core, halo) * vA; col = mix(vCol, min(vCol * 1.12 + 0.12, vec3(1.0)), vShine * smoothstep(0.32, 0.0, r));
        if (a < 0.01) discard; gl_FragColor = vec4(col * a, a); return;
      }
      if (vGlow > 0.01) { float core = smoothstep(0.22, 0.08, r), halo = exp(-r * r * 14.0) * 0.5 * smoothstep(0.5, 0.3, r); a = (core + halo * vGlow) * vA; col = mix(vCol, min(vCol * 1.2 + 0.12, vec3(1.0)), core); }
      else a = smoothstep(0.5, 0.36, r) * vA;
      if (a < 0.01) discard; gl_FragColor = vec4(col * a, a); }`;

  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });

  /* ---------- the logo, on screen at once: same particles the body will unfold from ---------- */
  const LV = 0.26; // share of particles that draw the leaf mark
  const LP = (() => {
    const LW = 240, LH = 300, lc = d.createElement('canvas'); lc.width = LW; lc.height = LH; const lx = lc.getContext('2d', { willReadFrequently: true });
    lx.setTransform(LW / 33.3, 0, 0, LH / 41.7, -129.8 * (LW / 33.3), 0); $$('.ncx__logo path').forEach((q) => lx.fill(new Path2D(q.getAttribute('d'))));
    const ld = lx.getImageData(0, 0, LW, LH).data, filled = []; for (let i = 0; i < LW * LH; i++) if (ld[i * 4 + 3] > 127) filled.push(i);
    const out = new Float32Array(NS * 3), S = 1.0 / 41.7;
    for (let i = 0; i < NS; i++) { const k = filled.length ? filled[(Math.random() * filled.length) | 0] : 0, x = 129.8 + ((k % LW) + Math.random()) * (33.3 / LW), y = (((k / LW) | 0) + Math.random()) * (41.7 / LH); out[i * 3] = (x - 146.42) * S * 0.62; out[i * 3 + 1] = ((41.7 - y) * S + 0.02) * 0.62 + 0.178; out[i * 3 + 2] = (Math.random() - 0.5) * 0.02; }
    return out;
  })();
  const LU = { uTime: U.uTime, uSize: U.uSize, uFade: { value: 0 }, uMouse: U.uMouse, uRes: U.uRes };
  const logoPts = (() => {
    const gl2 = new THREE.BufferGeometry(), r = new Float32Array(NS); for (let i = 0; i < NS; i++) r[i] = Math.random();
    gl2.setAttribute('position', new THREE.BufferAttribute(LP, 3)); gl2.setAttribute('aRnd', new THREE.BufferAttribute(r, 1));
    const m = new THREE.ShaderMaterial({ uniforms: LU, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: `attribute float aRnd; uniform float uTime, uSize, uFade; uniform vec3 uMouse; uniform vec2 uRes; varying vec3 vCol; varying float vA; ${LEAF}
        void main(){
          vec3 p = leafPos(position, aRnd, uTime); vCol = leafCol(position, uTime); vA = 0.95 * uFade;
          vec4 cp = projectionMatrix * viewMatrix * vec4(p, 1.0);
          vec2 s = (cp.xy / cp.w * 0.5 + 0.5) * uRes, md = s - vec2(uMouse.x, uRes.y - uMouse.y); float ml = length(md);
          if (ml < uMouse.z) { s += md / max(ml, 0.001) * (1.0 - ml / uMouse.z) * 16.0; cp.xy = ((s / uRes) * 2.0 - 1.0) * cp.w; }
          gl_Position = cp; gl_PointSize = uSize * (0.95 + aRnd * 0.1);
        }`,
      fragmentShader: `varying vec3 vCol; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5), a = smoothstep(0.5, 0.36, r) * vA; if (a < 0.01) discard; gl_FragColor = vec4(vCol * a, a); }` });
    gl2.setDrawRange(0, Math.round(NS * LV));
    const o = new THREE.Points(gl2, m); o.frustumCulled = false; scene.add(o); return o;
  })();
  g.to(LU.uFade, { value: 1, duration: 0.7, ease: 'power2.out' });

  /* ---------- the body ---------- */
  const B = {}, REST = {}; let pts = null, bodyH = 1, occ = [];
  const wpos = (n, v = new THREE.Vector3()) => B[n].getWorldPosition(v);
  const build = async (gltf) => {
    const root = gltf.scene; rig.add(root);
    root.traverse((o) => { const k = RIGMAP[o.name.replace(/[^A-Za-z0-9]/g, '')]; if (k) B[k] = o; });
    const skinned = []; root.traverse((o) => { if (o.isSkinnedMesh) { skinned.push(o); o.visible = false; } });
    // fit: feet on the floor, height 1, centred
    rig.updateMatrixWorld(true);
    { const fw = wpos('LeftToe').sub(wpos('LeftFoot')).add(wpos('RightToe').sub(wpos('RightFoot'))); root.rotation.y -= Math.atan2(fw.x, fw.z); rig.updateMatrixWorld(true); } // toes point at the camera
    const bb = new THREE.Box3().setFromObject(root, true), sc = 1 / (bb.max.y - bb.min.y);
    const o0 = root.position.clone(), cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    root.scale.multiplyScalar(sc); root.position.set((o0.x - cx) * sc, (o0.y - bb.min.y) * sc, (o0.z - cz) * sc); rig.updateMatrixWorld(true);
    { const s2 = wpos('LeftArm'), e2 = wpos('LeftForeArm'); makePoses(Math.atan2(Math.abs(e2.x - s2.x), s2.y - e2.y) / DEG); }
    BONE_NAMES.forEach((n) => { const b = B[n]; REST[n] = { L: b.quaternion.clone(), P: b.parent.getWorldQuaternion(new THREE.Quaternion()), Pi: null }; REST[n].Pi = REST[n].P.clone().invert(); });
    const host = skinned.find((m) => /surface/i.test(m.name)) || skinned[0], sk = host.skeleton, bi = (n) => sk.bones.indexOf(B[n]);
    // --- surface samples (area weighted), skin weights blended from the triangle's corners
    const tris = []; let tot = 0;
    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    skinned.forEach((m) => { const ps = m.geometry.attributes.position, ix = m.geometry.index.array; for (let i = 0; i < ix.length; i += 3) { va.fromBufferAttribute(ps, ix[i]); vb.fromBufferAttribute(ps, ix[i + 1]); vc.fromBufferAttribute(ps, ix[i + 2]); const ar = e1.subVectors(vb, va).cross(e2.subVectors(vc, va)).length() * 0.5; if (ar <= 0) continue; tot += ar; tris.push([m, ix[i], ix[i + 1], ix[i + 2], tot]); } });
    // smooth (welded) vertex normals, then sample curved PN-triangle patches so the low-poly mesh reads as a smooth body
    const SN = new Map();
    skinned.forEach((m) => {
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      const ps = m.geometry.attributes.position, nr = m.geometry.attributes.normal, key = (i) => `${Math.round(ps.getX(i) * 1e4)},${Math.round(ps.getY(i) * 1e4)},${Math.round(ps.getZ(i) * 1e4)}`, sum = new Map(), out = new Float32Array(ps.count * 3);
      for (let i = 0; i < ps.count; i++) { const k = key(i), a = sum.get(k) || [0, 0, 0]; a[0] += nr.getX(i); a[1] += nr.getY(i); a[2] += nr.getZ(i); sum.set(k, a); }
      for (let i = 0; i < ps.count; i++) { const a = sum.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
      SN.set(m, out);
    });
    const PO = new THREE.Vector3(), NO = new THREE.Vector3();
    const pn = (nrm, P1, P2, P3, i0, i1, i2, w, u, v) => {
      const o = [P1.x, P1.y, P1.z, P2.x, P2.y, P2.z, P3.x, P3.y, P3.z], N1 = i0 * 3, N2 = i1 * 3, N3 = i2 * 3;
      const ww = w * w, uu = u * u, vv = v * v;
      const out = [0, 0, 0];
      // weights per control point
      for (let c = 0; c < 3; c++) {
        const p1 = o[c], p2 = o[3 + c], p3 = o[6 + c];
        const d12 = (P2.x - P1.x) * nrm[N1] + (P2.y - P1.y) * nrm[N1 + 1] + (P2.z - P1.z) * nrm[N1 + 2];
        const d21 = (P1.x - P2.x) * nrm[N2] + (P1.y - P2.y) * nrm[N2 + 1] + (P1.z - P2.z) * nrm[N2 + 2];
        const d23 = (P3.x - P2.x) * nrm[N2] + (P3.y - P2.y) * nrm[N2 + 1] + (P3.z - P2.z) * nrm[N2 + 2];
        const d32 = (P2.x - P3.x) * nrm[N3] + (P2.y - P3.y) * nrm[N3 + 1] + (P2.z - P3.z) * nrm[N3 + 2];
        const d31 = (P1.x - P3.x) * nrm[N3] + (P1.y - P3.y) * nrm[N3 + 1] + (P1.z - P3.z) * nrm[N3 + 2];
        const d13 = (P3.x - P1.x) * nrm[N1] + (P3.y - P1.y) * nrm[N1 + 1] + (P3.z - P1.z) * nrm[N1 + 2];
        const b210 = (2 * p1 + p2 - d12 * nrm[N1 + c]) / 3, b120 = (2 * p2 + p1 - d21 * nrm[N2 + c]) / 3;
        const b021 = (2 * p2 + p3 - d23 * nrm[N2 + c]) / 3, b012 = (2 * p3 + p2 - d32 * nrm[N3 + c]) / 3;
        const b102 = (2 * p3 + p1 - d31 * nrm[N3 + c]) / 3, b201 = (2 * p1 + p3 - d13 * nrm[N1 + c]) / 3;
        const E = (b210 + b120 + b021 + b012 + b102 + b201) / 6, Vc = (p1 + p2 + p3) / 3, b111 = E + (E - Vc) * 0.5;
        out[c] = p1 * ww * w + p2 * uu * u + p3 * vv * v + 3 * (b210 * ww * u + b120 * w * uu + b201 * ww * v + b021 * uu * v + b102 * w * vv + b012 * u * vv) + 6 * b111 * w * u * v;
      }
      PO.set(out[0], out[1], out[2]);
      NO.set(nrm[N1] * w + nrm[N2] * u + nrm[N3] * v, nrm[N1 + 1] * w + nrm[N2 + 1] * u + nrm[N3 + 1] * v, nrm[N1 + 2] * w + nrm[N2 + 2] * u + nrm[N3 + 2] * v).normalize();
      return { p: PO, nn: NO };
    };
    const N = NS + NI + NH, WS = new Float32Array(NS * 3), pos = new Float32Array(N * 3), nor = new Float32Array(N * 3), sI = new Float32Array(N * 4), sW = new Float32Array(N * 4);
    const logo = new Float32Array(N * 3), rnd = new Float32Array(N), dly = new Float32Array(N), kind = new Float32Array(N), hgt = new Float32Array(N);
    const acc = new Map(), toWorld = new THREE.Matrix4().multiplyMatrices(sk.bones[0].matrixWorld, sk.boneInverses[0]).multiply(host.bindMatrix);
    const wv = new THREE.Vector3(), JJ = new Int32Array(12), WW = new Float32Array(12);
    const r0 = 0.8 * Math.sqrt((tot * toWorld.getMaxScaleOnAxis() ** 2) / NS), bg = new Map(), bk = (x, y, z) => ((Math.floor(x / r0) + 512) * 1024 + (Math.floor(y / r0) + 512)) * 1024 + (Math.floor(z / r0) + 512);
    const far = (x, y, z) => { const cx = Math.floor(x / r0), cy = Math.floor(y / r0), cz = Math.floor(z / r0); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const L = bg.get(((cx + a + 512) * 1024 + (cy + b + 512)) * 1024 + (cz + c + 512)); if (L) for (let k = 0; k < L.length; k += 3) { const dx = L[k] - x, dy = L[k + 1] - y, dz = L[k + 2] - z; if (dx * dx + dy * dy + dz * dz < r0 * r0) return false; } } return true; };
    let n = 0;
    let slice = performance.now();
    for (let tries = 0; n < NS && tries < NS * 6; tries++) {
      if ((tries & 511) === 0 && performance.now() - slice > 14) { await new Promise((r) => setTimeout(r, 0)); slice = performance.now(); } // stay responsive while building
      const r = Math.random() * tot; let lo = 0, hi = tris.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (tris[m][4] < r) lo = m + 1; else hi = m; }
      const [m, i0, i1, i2] = tris[lo], ps = m.geometry.attributes.position, si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight;
      let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w0 = 1 - u - v, bw = [w0, u, v], id = [i0, i1, i2];
      va.fromBufferAttribute(ps, i0); vb.fromBufferAttribute(ps, i1); vc.fromBufferAttribute(ps, i2);
      wv.set(va.x * w0 + vb.x * u + vc.x * v, va.y * w0 + vb.y * u + vc.y * v, va.z * w0 + vb.z * u + vc.z * v).applyMatrix4(toWorld); // cheap test first
      if (!far(wv.x, wv.y, wv.z)) continue;
      const { p, nn } = pn(SN.get(m), va, vb, vc, i0, i1, i2, w0, u, v);
      { const key = bk(wv.x, wv.y, wv.z), L = bg.get(key); if (L) L.push(wv.x, wv.y, wv.z); else bg.set(key, [wv.x, wv.y, wv.z]); }
      pos.set([p.x, p.y, p.z], n * 3); nor.set([nn.x, nn.y, nn.z], n * 3);
      let nj = 0;
      for (let c = 0; c < 3; c++) for (let k = 0; k < 4; k++) { const wt = sw.getComponent(id[c], k) * bw[c]; if (wt <= 0) continue; const j = si.getComponent(id[c], k); let e = 0; while (e < nj && JJ[e] !== j) e++; if (e === nj) { JJ[nj] = j; WW[nj] = 0; nj++; } WW[e] += wt; }
      let sum = 0;
      for (let k = 0; k < 4; k++) { let bi2 = -1; for (let e = 0; e < nj; e++) if (WW[e] > 0 && (bi2 < 0 || WW[e] > WW[bi2])) bi2 = e; if (bi2 < 0) { sI[n * 4 + k] = 0; sW[n * 4 + k] = 0; continue; } sI[n * 4 + k] = JJ[bi2]; sW[n * 4 + k] = WW[bi2]; sum += WW[bi2]; WW[bi2] = -1; }
      for (let k = 0; k < 4; k++) sW[n * 4 + k] /= sum || 1;
      hgt[n] = wv.y; WS.set([wv.x, wv.y, wv.z], n * 3);
      n++;
    }
    const NSa = n;
    // --- inner anatomy: spine (vertebrae) and nerve paths, each point rigid to its bone
    const bindInv = (j) => new THREE.Matrix4().multiplyMatrices(sk.bones[j].matrixWorld, sk.boneInverses[j]).multiply(host.bindMatrix).invert();
    const CH = [[1, ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'], 0.5],
      [2, ['LeftArm', 'LeftForeArm', 'LeftHand'], 0.09], [2, ['RightArm', 'RightForeArm', 'RightHand'], 0.09],
      [2, ['LeftUpLeg', 'LeftLeg', 'LeftFoot'], 0.12], [2, ['RightUpLeg', 'RightLeg', 'RightFoot'], 0.12]];
    const segs = []; let ltot = 0;
    CH.forEach(([kd, ch, share]) => { for (let i = 1; i < ch.length; i++) { const a = wpos(ch[i - 1]), b = wpos(ch[i]), l = a.distanceTo(b); segs.push({ kd, a, b, j: bi(ch[i - 1]), l, share: (share * l) / ch.slice(1).reduce((s, n, k) => s + wpos(ch[k]).distanceTo(wpos(n)), 0) }); } });
    const inv = new Map();
    segs.forEach((sg) => {
      const cnt = Math.round(sg.share * NI); if (!inv.has(sg.j)) inv.set(sg.j, bindInv(sg.j)); const M = inv.get(sg.j);
      for (let c = 0; c < cnt && n < N; c++, n++) {
        let f = Math.random(), rad = sg.kd === 1 ? 0.008 : 0.0035;
        if (sg.kd === 1) { const nv = 22, vi = Math.floor(f * nv); f = (vi + 0.5 + (Math.random() - 0.5) * 0.32) / nv; rad *= 0.55 + 0.45 * Math.random(); }
        const a3 = Math.random() * TAU, rr = rad * Math.sqrt(Math.random());
        const w = sg.a.clone().lerp(sg.b, f).add(new THREE.Vector3(Math.cos(a3) * rr, (Math.random() - 0.5) * rad * 0.4, Math.sin(a3) * rr * (sg.kd === 1 ? 0.6 : 1)));
        if (sg.kd === 1) w.z -= 0.012; // spine sits toward the back
        hgt[n] = w.y; const p = w.clone().applyMatrix4(M); pos.set([p.x, p.y, p.z], n * 3); nor.set([0, 0, 1], n * 3);
        sI[n * 4] = sg.j; sW[n * 4] = 1; kind[n] = sg.kd;
      }
    });
    for (let c = 0; c < NH && n < N; c++, n++) { sI[n * 4] = 0; sW[n * 4] = 1; nor.set([0, 0, 1], n * 3); pos.set([Math.random(), Math.random(), Math.random()], n * 3); hgt[n] = Math.random(); kind[n] = 6; }
    const NT = n;
    for (let i = 0; i < NT; i++) {
      rnd[i] = Math.random(); dly[i] = Math.random() * 0.32 + clamp(hgt[i]) * 0.14;
    }
    // logo targets: exactly the particles already on screen, paired by height so the body flows out of the mark
    const lv = new Float32Array(NT);
    const lpIdx = Array.from({ length: NS }, (_, i) => i).sort((a, b) => LP[a * 3 + 1] - LP[b * 3 + 1]);
    const order = Array.from({ length: NT }, (_, i) => i).sort((a, b) => hgt[a] - hgt[b]);
    order.forEach((i, k) => { const L = lpIdx[Math.min(NS - 1, Math.round((k * (NS - 1)) / Math.max(1, NT - 1)))] * 3; logo[i * 3] = LP[L]; logo[i * 3 + 1] = LP[L + 1]; logo[i * 3 + 2] = LP[L + 2]; lv[i] = L / 3 < NS * LV ? 1 : 0; });
    const geo = new THREE.BufferGeometry(), sl = (a, c) => new THREE.BufferAttribute(a.subarray(0, NT * c), c);
    geo.setAttribute('position', sl(pos, 3)); geo.setAttribute('normal', sl(nor, 3)); geo.setAttribute('skinIndex', sl(sI, 4)); geo.setAttribute('skinWeight', sl(sW, 4));
    geo.setAttribute('aLogo', sl(logo, 3)); geo.setAttribute('aLv', new THREE.BufferAttribute(lv, 1)); geo.setAttribute('aRnd', sl(rnd, 1)); geo.setAttribute('aDelay', sl(dly, 1)); geo.setAttribute('aKind', sl(kind, 1));
    // a skinned mesh drawn as points: the GPU skins every particle with the real skeleton
    pts = new THREE.SkinnedMesh(geo, mat); pts.isMesh = false; pts.isPoints = true; pts.frustumCulled = false;
    host.parent.add(pts); pts.position.copy(host.position); pts.quaternion.copy(host.quaternion); pts.scale.copy(host.scale);
    pts.bind(sk, host.bindMatrix); pts.renderOrder = 1;
    occ = skinned; skinned.forEach((m) => { m.material = new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 6 }); m.renderOrder = 0; m.frustumCulled = false; });
  };

  /* ---------- posing ---------- */
  const QI = new THREE.Quaternion(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qx = new THREE.Quaternion(), qt = new THREE.Quaternion();
  const idle = (n, t) => {
    switch (n) {
      case 'Spine1': return q([X, 1.1 * Math.sin(t * 1.4)]);
      case 'Neck': return q([Z, 1.6 * Math.sin(t * 0.5)], [Y, smx * 22]);
      case 'Head': return q([X, -smy * 10]);
      case 'LeftArm': return q([Z, 1.4 * Math.sin(t * 0.7)]);
      case 'RightArm': return q([Z, -1.4 * Math.sin(t * 0.7 + 0.6)]);
      case 'Hips': return q([Z, 0.6 * Math.sin(t * 0.35)]);
      default: return null;
    }
  };
  let WK = 0, PH = 0, lastT = 0;
  const pose = (p, t) => {
    const [a, b, k] = keyAt(KEYS, p), A = POSE[a], Bp = POSE[b];
    BONE_NAMES.forEach((n) => {
      const r = REST[n]; if (!r) return;
      qx.slerpQuaternions(A[n] || QI, Bp[n] || QI, k);
      const id = idle(n, t); if (id) qx.premultiply(id);
      if (WK > 0.01) { const wq = walk(n, PH, WK); if (wq) qx.premultiply(wq); }
      qt.copy(r.Pi).multiply(qx).multiply(r.P).multiply(r.L); B[n].quaternion.copy(qt);
    });
  };

  /* ---------- canvas sizing & input ---------- */
  let W = 0, H = 0, DPR = 1, prog = 0, mx = -9999, my = -9999, smx = 0, smy = 0, inView = true, ready = false;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
    [cv, fxc].forEach((c) => { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    if (renderer) { renderer.setPixelRatio(DPR); renderer.setSize(W, H, false); }
    camera.aspect = W / Math.max(1, H); U.uRes.value.set(W, H);
  };
  resize(); addEventListener('resize', resize);
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = my = -9999; }); }
  const DUST = Array.from({ length: MOB ? 26 : 48 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, r: 0.6 + Math.random() * 1.8, ph: Math.random() * 6.28 }));
  const CHAINS = [['Head', 'Neck', 'Spine2', 'Spine', 'Hips', 'RightUpLeg', 'RightLeg', 'RightFoot'], ['Spine2', 'Hips', 'LeftUpLeg', 'LeftLeg', 'LeftFoot'], ['Spine2', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand'], ['Spine2', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand'], ['Neck', 'Spine2', 'LeftShoulder', 'LeftArm', 'LeftForeArm']];
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  const proj = (w) => { V.copy(w).project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H]; };
  const along = (ch, u) => { const ps = ch.map((n) => wpos(n, new THREE.Vector3())); let tot = 0; const L = []; for (let i = 1; i < ps.length; i++) { L.push(ps[i].distanceTo(ps[i - 1])); tot += L[i - 1]; } let r = u * tot; for (let i = 0; i < L.length; i++) { if (r <= L[i]) return ps[i].lerp(ps[i + 1], r / L[i]); r -= L[i]; } return ps[ps.length - 1]; };
  const areaPos = (a, v = new THREE.Vector3()) => { const [b0, b1, f] = AREAS[a]; wpos(b0, v); return v.lerp(wpos(b1, V2), f); };

  const renderLogo = (t) => {
    if (!renderer) return;
    if (mx > -9000) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; }
    const S = MOB ? Math.min(H * 0.5, W * 1.25) : Math.min(H * 0.8, W * 0.6), CX = (MOB ? W * 0.5 : W * 0.66) + smx * 14, CY = (MOB ? H * 0.35 : H * 0.5) + smy * 8, D0 = H / (2 * S * FOVT);
    camera.position.set(0, 0.5 + D0 * 0.05, D0); camera.lookAt(0, 0.5, 0); camera.setViewOffset(W, H, W / 2 - CX, H / 2 - CY, W, H); camera.updateMatrixWorld();
    U.uTime.value = t; U.uSize.value = (MOB ? 1.5 : 1.55) * Math.sqrt(S / 700) * DPR + 0.4 * DPR; U.uMouse.value.set(mx, my, 80);
    renderer.render(scene, camera);
  };
  const render = (time) => {
    if (!ready) { renderLogo(time); return; }
    if (logoPts.parent) { scene.remove(logoPts); logoPts.geometry.dispose(); logoPts.material.dispose(); }
    const p = prog, t = time, intro = U.uIntro.value, lg = seg(p, 0.86, 0.95), formed = clamp((intro - 0.7) / 0.3);
    if (mx > -9000) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; } else { smx *= 0.95; smy *= 0.95; }
    // body: yaw by scroll (turns to show the back, spins when it moves freely), pose by scroll
    const [y0, y1, yk] = keyAt(YAW, p);
    rig.rotation.y = mix(y0, y1, yk) + (1 - lg) * (0.06 * Math.sin(t * 0.3) + smx * 0.5);
    WK = RM ? 0 : walkW(p) * formed; PH += Math.min(0.05, Math.max(0, t - lastT)) * 5.4; lastT = t;
    rig.position.y = WK * 0.006 * (Math.cos(2 * PH) - 1);
    pose(p, t); rig.updateMatrixWorld(true);
    const states = AREAS.map((_, a) => areaState(a, p)); let act = -1, zf = 0; const foc = new THREE.Vector3(0, 0.5, 0);
    states.forEach((st, a) => { if (st.c >= 0 && st.c <= 1) { act = a; zf = seg(st.c, 0, 0.25) * (1 - seg(st.c, 0.82, 1)); const at = areaPos(a), wf = a === 3 ? (MOB ? 0.15 : 0.08) : a === 2 ? (MOB ? 0.3 : 0.4) : 1; foc.set(mix(0, at.x, zf), mix(0.5, at.y, zf * wf), 0); } });
    const Zm = MOB ? 1.2 : 1.12, zoom = (1 + (Zm - 1) * zf) * mix(1, MOB ? 0.78 : 0.95, lg);
    foc.y += mix(0, 0.06, lg);
    const S = (MOB ? Math.min(H * 0.5, W * 1.25) : Math.min(H * 0.8, W * 0.6)) * zoom, CX = (MOB ? W * 0.5 : W * 0.66) + smx * 14, CY = (MOB ? H * 0.35 : H * 0.5) + smy * 8;
    const D = H / (2 * S * FOVT);
    camera.position.set(foc.x, foc.y + D * 0.05, D); camera.lookAt(foc.x, foc.y, 0);
    camera.setViewOffset(W, H, W / 2 - CX, H / 2 - CY, W, H); camera.updateMatrixWorld();
    const align = seg(p, 0.5, 0.57), spineGlow = bell(p, 0.44, 0.58), lift = bell(p, 0.74, 0.88);

    const archR = drawArch(p, states, act, lg, formed, t);
    // ---- back layer: dust + floor platform ----
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    for (const o of DUST) { const yy = ((o.y - t * 0.012 * o.z) % 1 + 1) % 1, xx = o.x + Math.sin(t * 0.3 + o.ph) * 0.01; ctx.fillStyle = `rgba(255,255,255,${(0.55 * o.z).toFixed(3)})`; ctx.beginPath(); ctx.arc(xx * W - smx * 30 * o.z, yy * H - smy * 20 * o.z, o.r * o.z * 1.4, 0, 6.283); ctx.fill(); }

    { // chapter change: the new colour washes out from the figure
      const e = (t - chT) / 1.8;
      if (e > 0 && e < 1 && ready) {
        const hx = TINTS[cur] || TINTS[0], rgb = [1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16)).join(','), [bx2, by2] = proj(V2.set(0, 0.5, 0)), rr = (0.1 + ease(e) * 1.6) * Math.max(W, H) * 0.7;
        const gw = ctx.createRadialGradient(bx2, by2, 0, bx2, by2, rr); gw.addColorStop(0, `rgba(${rgb},0)`); gw.addColorStop(0.72, `rgba(${rgb},${(0.75 * (1 - e)).toFixed(3)})`); gw.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gw; ctx.fillRect(0, 0, W, H);
      }
    }
    { // soft light behind the body
      const [ax, ay] = proj(V2.set(0, 0.55, 0)), al = clamp(intro * 1.2) * (1 - lg * 0.6) * (1 - archR * 0.45), ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, 0.62 * S);
      ag.addColorStop(0, `rgba(255,255,250,${(0.85 * al).toFixed(3)})`); ag.addColorStop(0.55, `rgba(255,255,248,${(0.35 * al).toFixed(3)})`); ag.addColorStop(1, 'rgba(255,255,248,0)');
      ctx.fillStyle = ag; ctx.fillRect(ax - 0.62 * S, ay - 0.62 * S, 1.24 * S, 1.24 * S);
    }
    { // contact shadows: one soft ellipse under the body, one under each foot that fades as the foot lifts
      const pa = clamp((intro - 0.6) / 0.4) * (1 - lg), blob = (x, z, rad, al) => { const [gx, gy] = proj(V2.set(x, 0, z)), g2 = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad * S); g2.addColorStop(0, `rgba(20,32,26,${al.toFixed(3)})`); g2.addColorStop(1, 'rgba(20,32,26,0)'); ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.22); ctx.translate(-gx, -gy); ctx.fillStyle = g2; ctx.fillRect(gx - rad * S, gy - rad * S, 2 * rad * S, 2 * rad * S); ctx.restore(); };
      if (pa > 0.01) {
        blob(0, 0, 0.24, 0.1 * pa);
        ['LeftFoot', 'RightFoot'].forEach((fn) => { const fp = wpos(fn, new THREE.Vector3()), up = clamp(fp.y / 0.12); blob(fp.x, fp.z + 0.02, 0.07 + up * 0.05, 0.28 * pa * (1 - up * 0.8)); });
      }
    }

    // ---- GPU particles ----
    if (renderer && pts) {
      U.uTime.value = t; U.uLogo.value = lg;
      states.forEach((st, a) => { const at = areaPos(a); U.uArea.value[a].set(at.x, at.y, at.z, AREAS[a][3]); U.uPain.value[a].set(st.pain * formed * (1 - lg), st.calm * (1 - lg)); });
      U.uSpine.value = spineGlow;
      const sc = (t - scanT) / 1.8; U.uScan.value = sc >= 0 && sc <= 1 && formed > 0.9 && lg < 0.05 ? mix(1.03, -0.02, ease(sc)) : -2;
      U.uMouse.value.set(mx, my, 80); U.uCz.value = -D;
      const solid = lg < 0.002; occ.forEach((m) => { m.visible = solid; });
      U.uSize.value = (MOB ? 1.5 : 1.55) * Math.sqrt(zoom) * Math.sqrt(S / 700) * DPR + 0.4 * DPR;
      renderer.render(scene, camera);
    }

    // ---- front layer: treatment motion graphics, pulses, spine, arcs ----
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0); fctx.clearRect(0, 0, W, H);
    if (act >= 0 && lg < 0.1 && formed > 0.5) {
      const st = states[act], eff = bell(st.c, 0.22, 0.8), [Xp, Yp] = proj(areaPos(act)), u = S;
      if (st.c < 0.32) for (let r = 0; r < 3; r++) { const fr = (t * 0.45 + r / 3) % 1, al = 0.55 * (1 - fr) * seg(st.c, 0, 0.15) * (1 - seg(st.c, 0.22, 0.32)); fctx.strokeStyle = `rgba(232,112,92,${al.toFixed(3)})`; fctx.lineWidth = 1.2; fctx.beginPath(); fctx.arc(Xp, Yp, (0.03 + fr * 0.11) * u, 0, 6.283); fctx.stroke(); }
      const sw = clamp((st.c - 0.3) / 0.16);
      if (sw > 0 && sw < 1) { fctx.strokeStyle = `rgba(255,255,255,${(0.85 * (1 - sw)).toFixed(3)})`; fctx.lineWidth = 2 * (1 - sw) + 0.5; fctx.beginPath(); fctx.arc(Xp, Yp, (0.02 + sw * 0.32) * u, 0, 6.283); fctx.stroke(); }
      if (eff > 0.01) {
        fctx.lineWidth = 1.4;
        if (act === 0) { for (let k = 0; k < 2; k++) { const a0 = t * 0.9 + k * Math.PI; fctx.strokeStyle = `rgba(255,255,255,${(0.9 * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(Xp, Yp, 0.065 * u, a0, a0 + 1.6); fctx.stroke(); } }
        else if (act === 1) { for (let r = 0; r < 3; r++) { const fr = (t * 0.6 + r / 3) % 1; fctx.strokeStyle = `rgba(64,108,180,${(0.65 * (1 - fr) * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(Xp, Yp, (0.035 + fr * 0.15) * u, 0, 6.283); fctx.stroke(); } }
        else if (act === 2) {
          const clean = seg(st.c, 0.3, 0.7), w = 0.2 * u; fctx.strokeStyle = `rgba(255,255,255,${(0.95 * eff).toFixed(3)})`; fctx.beginPath();
          for (let k = 0; k <= 60; k++) { const f = k / 60, xx = Xp - w + f * 2 * w, env = Math.sin(Math.PI * f), nn = 0.6 * Math.sin(f * 58 + t * 9) + 0.4 * Math.sin(f * 97 - t * 13), cl = Math.sin(f * 25 - t * 5), yy = Yp + env * 0.026 * u * mix(nn, cl, clean); k ? fctx.lineTo(xx, yy) : fctx.moveTo(xx, yy); }
          fctx.stroke();
        } else {
          const sx = Xp + 0.32 * u, sy = Yp - 0.4 * u, lb = fctx.createLinearGradient(sx, sy, Xp, Yp); lb.addColorStop(0, 'rgba(232,112,92,0)'); lb.addColorStop(1, `rgba(232,112,92,${(0.9 * eff).toFixed(3)})`);
          fctx.strokeStyle = lb; fctx.beginPath(); fctx.moveTo(sx, sy); fctx.lineTo(Xp, Yp); fctx.stroke();
          for (let k = 0; k < 5; k++) { const fr = (t * 0.7 + k / 5) % 1; fctx.fillStyle = `rgba(232,112,92,${(Math.sin(Math.PI * fr) * eff).toFixed(3)})`; fctx.beginPath(); fctx.arc(mix(sx, Xp, fr), mix(sy, Yp, fr), 2.4, 0, 6.283); fctx.fill(); }
        }
      }
      if (tag) {
        const vis = clamp(seg(st.c, 0.08, 0.2) * (1 - seg(st.c, 0.86, 0.98)));
        const flip = Xp + 280 > W; tag.classList.toggle('is-flip', flip);
        const tx = flip ? Xp - 16 - tag.offsetWidth : Xp + 16;
        const ty = Yp - tag.offsetHeight / 2 - (act === 1 ? 0.11 * S : 0); // the shoulder tag sits above the lifting arm
        tag.style.transform = `translate(${clamp(tx, 8, W - tag.offsetWidth - 8).toFixed(1)}px,${ty.toFixed(1)}px)`; tag.style.opacity = vis.toFixed(3);
        tag.classList.toggle('is-calm', st.c > 0.55);
      }
    } else if (tag) tag.style.opacity = 0;
    if (spineGlow > 0.02 && formed > 0.5) {
      const ch = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck'];
      for (let v = 0; v < 12; v++) { const f = v / 11, on = clamp(align * 14 - v * 0.9) * spineGlow; if (on <= 0) continue; const [Xp, Yp] = proj(along(ch, f)); fctx.fillStyle = `rgba(255,255,255,${(0.95 * on).toFixed(3)})`; fctx.beginPath(); fctx.arc(Xp, Yp, 3, 0, 6.283); fctx.fill(); fctx.strokeStyle = `rgba(64,108,180,${on.toFixed(3)})`; fctx.lineWidth = 1.4; fctx.stroke(); }
    }
  };

  /* ---------- drive ---------- */
  ST.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { prog = s.progress; const k = R.findIndex(([a, b]) => prog >= a && prog < b); setChapter(k < 0 ? R.length - 1 : k); if (bar) bar.style.transform = `scaleY(${prog.toFixed(4)})`; if (wordBox && !RM) { const [a0, b0] = R[k < 0 ? R.length - 1 : k], c = clamp((prog - a0) / (b0 - a0)); wordBox.style.transform = `translate3d(${((0.5 - c) * (MOB ? 10 : 7)).toFixed(2)}vw,0,0)`; } } });
  new IntersectionObserver((es) => es.forEach((e) => (inView = e.isIntersecting))).observe(sec);
  setChapter(0);
  const hd = $('.az-head'); if (hd) hd.classList.add('on-light');
  g.ticker.add((time) => { if (inView) render(time); });
  if (!renderer) return;
  new GLTFLoader().load(MODEL, async (gltf) => {
    await build(gltf); ready = true; scanT = performance.now() / 1000 + 3.6;
    if (RM) return;
    const go = () => {
      g.to(U.uIntro, { value: 1, duration: 2.1, delay: 0, ease: 'power2.inOut' });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 1, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }, undefined, (e) => console.error(e));
})();
