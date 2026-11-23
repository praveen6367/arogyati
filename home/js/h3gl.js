/* AROGYATI — home 3 (WebGL): "From pain to motion" told with photographs and the clinic's footage.
   Hero: twelve pain photographs on a slowly turning 3D ring (fly in on load, colour-split ripple under the cursor,
   bend with scroll speed). The ring turns the neck to the front and it flies forward as the feature card. In each
   chapter the pain pulses and distorts the photo, the treatment floods out of the pain point with a liquid,
   refracting edge and plays, then drains back leaving the photograph healed; the card flips edge-on into the next pain.
   The rehab clip plays for "free to move"; every pain returns healed and dissolves into particles that form the
   Arogyati figure. Falls back to the DOM version (h3.js) without WebGL. */
import * as THREE from '/home/vendor/three/three.module.min.js';

(() => {
  const d = document, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const g = window.gsap, ST = window.ScrollTrigger;
  const sec = $('.ncx'), V = $('.h3v'); if (!sec || !V || !g || !ST) return;
  const fallback = () => { const s = d.createElement('script'); s.src = '/home/js/h3.js?v=3'; d.body.appendChild(s); };
  let renderer = null;
  const cv = d.createElement('canvas'); cv.className = 'h3-gl'; cv.setAttribute('aria-hidden', 'true');
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
  if (!renderer) { fallback(); return; }
  d.documentElement.classList.add('h3-on');
  V.appendChild(cv); renderer.setClearColor(0x000000, 0);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
  const bell = (p, a, b) => Math.sin(Math.PI * clamp((p - a) / (b - a)));
  const R = [[0, 0.1], [0.1, 0.26], [0.26, 0.42], [0.42, 0.58], [0.58, 0.74], [0.74, 0.86], [0.86, 1.01]];
  const TAU = Math.PI * 2, ASP = 373 / 273;

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

  /* ---------- textures: the twelve pains, the treatment media ---------- */
  const KEY = $$('.h3-tile', V).map((t) => t.dataset.k);
  const loader = new THREE.TextureLoader();
  const mkTex = (src) => { const t = loader.load(src, () => { t.userData.ok = true; }); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.userData.aspect = 273 / 373; return t; };
  const PHOTO = KEY.map((k) => mkTex(`/home/assets/img/pain/${k}.webp`));
  const PAIN = [['neck', 0.5, 0.56], ['shoulder', 0.68, 0.4], ['lowerback', 0.5, 0.8], ['knee', 0.7, 0.52]].map(([k, x, y]) => ({ i: KEY.indexOf(k), uv: new THREE.Vector2(x, 1 - y) }));
  const media = $$('.h3-win > *', V).map((el) => {
    const vid = el.tagName === 'VIDEO';
    let tex = null;
    const ensure = () => {
      if (tex) return tex;
      if (vid) { el.poster = el.dataset.poster || ''; el.src = el.dataset.src; el.muted = true; el.loop = true; el.playsInline = true; tex = new THREE.VideoTexture(el); el.addEventListener('loadedmetadata', () => { tex.userData.aspect = el.videoWidth / el.videoHeight; }); tex.userData.aspect = 0.5625; }
      else { tex = loader.load(el.dataset.src, (t) => { t.userData.aspect = t.image.width / t.image.height; }); tex.userData.aspect = 0.6; }
      tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; return tex;
    };
    return { el, vid, ensure, cap: el.dataset.cap, crop: !!el.dataset.crop, playing: false };
  });
  const playOnly = (k) => media.forEach((m, i) => { if (!m.vid) return; const on = i === k; if (on && !m.playing) { m.ensure(); const pr = m.el.play(); if (pr) pr.catch(() => {}); m.playing = true; } else if (!on && m.playing) { m.el.pause(); m.playing = false; } });

  /* ---------- the image shader: rounded card, pain ripples, liquid treatment reveal, heal, cursor colour split ---------- */
  const VERT = /* glsl */`
    uniform float uBend, uTime, uWave, uCurve; uniform vec2 uSize; varying vec2 vUv;
    void main(){
      vUv = uv; vec3 p = position;
      if (uCurve > 1.0) { float a = p.x * uSize.x / uCurve; p.x = sin(a) * uCurve / uSize.x; p.z += (cos(a) - 1.0) * uCurve; }
      p.z += (sin(uv.x * 3.14159) + 0.5 * sin(uv.y * 3.14159)) * uBend + sin(uv.y * 9.0 - uTime * 3.0) * uWave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = /* glsl */`
    uniform sampler2D uTex, uTex2; uniform vec2 uSize, uPain; uniform vec3 uMouse;
    uniform float uA1, uA2, uRad, uMix, uHeal, uPulse, uSat, uTime, uAlpha, uKB, uDim, uHas2, uCrop, uBlur, uTouchA; uniform vec3 uTouch;
    varying vec2 vUv;
    vec2 cover(vec2 uv, float ta, float pa){ vec2 s = pa > ta ? vec2(1.0, ta / pa) : vec2(pa / ta, 1.0); return (uv - 0.5) * s + 0.5; }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
    void main(){
      vec2 uv = vUv; float pa = uSize.x / uSize.y;
      vec2 q = abs((uv - 0.5) * uSize) - (uSize * 0.5 - uRad); float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRad;
      float edge = 1.0 - smoothstep(-1.0, 0.6, sd);
      vec2 dp = (uv - uPain) * vec2(pa, 1.0); float dist = length(dp); vec2 dir = dp / max(dist, 1e-4) / vec2(pa, 1.0);
      // the pain pulses: rings run out from it and push the photograph
      float rip = 0.0;
      for (int k = 0; k < 2; k++) { float ph = fract(uTime * 0.5 + float(k) * 0.5), rr = ph * 0.5; rip += exp(-pow((dist - rr) / 0.022, 2.0)) * (1.0 - ph); }
      rip *= uPulse; uv -= dir * rip * 0.014;
      // the treatment floods out of the pain point with a liquid, refracting edge
      float n = noise(uv * 5.0 + uTime * 0.25) * 0.14 + noise(uv * 17.0 - uTime * 0.2) * 0.05;
      float Rr = uMix * 1.5, df = dist + n - 0.08;
      float m = smoothstep(Rr - 0.035, Rr + 0.035, df);
      float band = exp(-pow((df - Rr) / 0.05, 2.0)) * step(0.002, uMix) * step(uMix, 0.998);
      vec2 uvr = uv + dir * band * 0.035;
      // cursor: a soft colour split and swell
      vec2 md = (uvr - uMouse.xy) * vec2(pa, 1.0); float hv = exp(-dot(md, md) / 0.018) * uMouse.z;
      uvr -= md / vec2(pa, 1.0) * hv * 0.06; vec2 off = vec2(0.008, 0.0) * hv;
      vec2 c1 = cover(uvr, uA1, pa);
      vec3 photo = vec3(texture2D(uTex, c1 + off).r, texture2D(uTex, c1).g, texture2D(uTex, c1 - off).b);
      if (uBlur > 0.001) { vec2 bo = vec2(uBlur * 0.006, uBlur * 0.006 * pa); photo = (photo + texture2D(uTex, c1 + vec2(bo.x, 0.0)).rgb + texture2D(uTex, c1 - vec2(bo.x, 0.0)).rgb + texture2D(uTex, c1 + vec2(0.0, bo.y)).rgb + texture2D(uTex, c1 - vec2(0.0, bo.y)).rgb) / 5.0; }
      float lum = dot(photo, vec3(0.299, 0.587, 0.114)), red = clamp((photo.r - max(photo.g, photo.b)) * 2.4, 0.0, 1.0);
      photo += vec3(0.1, -0.03, -0.03) * red * uSat * (0.7 + 0.3 * sin(uTime * 4.0));
      // healing: the treated photograph, or wherever the healing light (cursor) touches
      float tl = length(gl_FragCoord.xy - uTouch.xy), tch = uTouchA * exp(-pow(tl / uTouch.z, 2.0) * 1.6);
      vec3 healed = vec3(lum) * 1.05 + 0.01;
      healed = mix(healed, healed * vec3(0.9, 1.05, 0.88) + vec3(0.0, 0.035, 0.0), clamp(exp(-dist * dist / 0.03) * uHeal + tch * 0.8, 0.0, 1.0));
      photo = mix(photo, healed, max(uHeal, tch));
      photo += vec3(0.5, 0.78, 0.45) * exp(-pow((tl - uTouch.z) / (uTouch.z * 0.07), 2.0)) * 0.14 * uTouchA;
      vec3 col = photo;
      if (uHas2 > 0.5) {
        vec2 kb = (uvr - 0.5) / (1.0 + uKB * (0.07 + 0.025 * sin(uTime * 0.2))) + 0.5;
        vec2 c2 = cover(kb, uA2, pa); c2.y = c2.y * (1.0 - uCrop) + uCrop;
        vec3 tr = texture2D(uTex2, c2).rgb;
        col = mix(tr, photo, m) + band * 0.22;
      }
      col += rip * 0.35;
      col = mix(col, col * 0.6 + 0.16, uDim);
      float a = edge * uAlpha; gl_FragColor = vec4(col * a, a);
    }`;
  const mkMat = (tex) => new THREE.ShaderMaterial({
    uniforms: { uTex: { value: tex }, uTex2: { value: tex }, uSize: { value: new THREE.Vector2(100, 100) }, uPain: { value: new THREE.Vector2(0.5, 0.5) }, uMouse: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uA1: { value: 273 / 373 }, uA2: { value: 0.56 }, uRad: { value: 20 }, uMix: { value: 0 }, uHeal: { value: 0 }, uPulse: { value: 0 }, uSat: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 0 },
      uKB: { value: 0 }, uDim: { value: 0 }, uHas2: { value: 0 }, uCrop: { value: 0 }, uBend: { value: 0 }, uWave: { value: 0 }, uCurve: { value: 0 }, uBlur: { value: 0 }, uTouch: { value: new THREE.Vector3(-999, -999, 100) }, uTouchA: { value: 0 } },
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 10, 20000), FOVT = Math.tan((15 * Math.PI) / 180);
  const plane = new THREE.PlaneGeometry(1, 1, 28, 28);
  const ring = new THREE.Group(); scene.add(ring);
  const NM = innerWidth < 900 ? 420 : 1000, mg = new THREE.BufferGeometry(), ma = new Float32Array(NM * 4);
  for (let i = 0; i < NM * 4; i++) ma[i] = Math.random();
  mg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NM * 3), 3)); mg.setAttribute('aR', new THREE.BufferAttribute(ma, 4));
  const MU = { uT: { value: 0 }, uA: { value: 0 }, uR: { value: 200 }, uH: { value: 500 }, uPx: { value: 2 } };
  const motes = new THREE.Points(mg, new THREE.ShaderMaterial({ uniforms: MU, transparent: true, depthWrite: false, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: `attribute vec4 aR; uniform float uT, uR, uH, uPx; varying float vA; varying vec3 vC;
      void main(){ float a = aR.x * 6.2832 + uT * (0.12 + aR.w * 0.18), r = uR * (1.12 + aR.y * 1.1), f = fract(aR.z + uT * (0.015 + aR.w * 0.02));
        vec3 p = vec3(sin(a) * r, (f - 0.5) * uH * 1.5, cos(a) * r - uR);
        vA = sin(3.14159 * f) * (0.35 + 0.65 * (0.5 + 0.5 * sin(uT * 2.0 + aR.x * 60.0))) * (0.45 + 0.55 * clamp(cos(a) * 0.5 + 0.5, 0.0, 1.0));
        vC = mix(vec3(0.25, 0.42, 0.71), vec3(0.36, 0.62, 0.3), step(0.62, aR.y));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); gl_PointSize = uPx * (0.7 + aR.w * 0.9); }`,
    fragmentShader: `uniform float uA; varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5), a = smoothstep(0.5, 0.15, r) * vA * uA; if (a < 0.01) discard; gl_FragColor = vec4(vC * a, a); }` }));
  motes.frustumCulled = false;
  const tiles = PHOTO.map((tex, i) => { const m = new THREE.Mesh(plane, mkMat(tex)); m.userData.i = i; m.frustumCulled = false; ring.add(m); return m; });
  const flat = PHOTO.map((tex) => { const m = new THREE.Mesh(plane, mkMat(tex)); m.frustumCulled = false; m.visible = false; scene.add(m); return m; });
  ring.add(motes);
  const SCAT = KEY.map(() => ({ a: (Math.random() - 0.5) * 5, x: (Math.random() - 0.5) * 1800, y: (Math.random() - 0.5) * 1100, z: -500 - Math.random() * 1400, r: (Math.random() - 0.5) * 1.4 }));
  const pull = KEY.map(() => 0);
  const NAMES = { neck: 'Neck', shoulder: 'Shoulder', elbow: 'Elbow', wrist: 'Wrist', upperback: 'Upper back', spine: 'Spine', lowerback: 'Lower back', hip: 'Hip', knee: 'Knee', ankle: 'Ankle', ribs: 'Ribs', chest: 'Chest' };
  const card = new THREE.Mesh(plane, mkMat(PHOTO[0])); card.frustumCulled = false; card.renderOrder = 5; scene.add(card);

  /* ---------- the finale: the healed pains dissolve into particles that become the Arogyati figure ---------- */
  const NP = innerWidth < 900 ? 7000 : 16000;
  const LP = (() => {
    const LW = 200, LH2 = 250, lc = d.createElement('canvas'); lc.width = LW; lc.height = LH2; const lx = lc.getContext('2d', { willReadFrequently: true });
    lx.setTransform(LW / 33.3, 0, 0, LH2 / 41.7, -129.8 * (LW / 33.3), 0); $$('.h3-logo path').forEach((q) => lx.fill(new Path2D(q.getAttribute('d'))));
    const ld = lx.getImageData(0, 0, LW, LH2).data, filled = []; for (let i = 0; i < LW * LH2; i++) if (ld[i * 4 + 3] > 127) filled.push(i);
    const out = new Float32Array(NP * 2);
    for (let i = 0; i < NP; i++) { const k = filled.length ? filled[(Math.random() * filled.length) | 0] : 0, x = 129.8 + ((k % LW) + Math.random()) * (33.3 / LW), y = (((k / LW) | 0) + Math.random()) * (41.7 / LH2); out[i * 2] = (x - 146.42) / 41.7; out[i * 2 + 1] = 0.5 - y / 41.7; }
    return out;
  })();
  const pg = new THREE.BufferGeometry(), pa = new Float32Array(NP * 4);
  for (let i = 0; i < NP; i++) { pa[i * 4] = (Math.random() * 12) | 0; pa[i * 4 + 1] = Math.random(); pa[i * 4 + 2] = Math.random(); pa[i * 4 + 3] = Math.random(); }
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3)); pg.setAttribute('aT', new THREE.BufferAttribute(pa, 4)); pg.setAttribute('aL', new THREE.BufferAttribute(LP, 2));
  const PU = { uK: { value: 0 }, uA: { value: 0 }, uGrid: { value: Array.from({ length: 12 }, () => new THREE.Vector4()) }, uLogo: { value: new THREE.Vector3() }, uTime: { value: 0 }, uPx: { value: 2 } };
  const pts = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: PU, transparent: true, depthWrite: false, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: /* glsl */`
      attribute vec4 aT; attribute vec2 aL; uniform float uK, uTime, uPx; uniform vec4 uGrid[12]; uniform vec3 uLogo; varying vec3 vC; varying float vA;
      float e3(float t){ return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
      void main(){
        vec4 G = uGrid[int(aT.x)]; vec3 s = vec3(G.x + (aT.y - 0.5) * G.z, G.y + (aT.z - 0.5) * G.w, 0.0);
        vec3 l = vec3(uLogo.x + aL.x * uLogo.z, uLogo.y + aL.y * uLogo.z, 0.0) + vec3(sin(uTime * 1.1 + aT.w * 40.0), cos(uTime * 0.9 + aT.w * 31.0), 0.0) * 1.2;
        float k = e3(clamp(uK * 1.3 - aT.w * 0.3, 0.0, 1.0)), sw = sin(k * 3.14159);
        vec3 p = mix(s, l, k) + vec3((aT.y - 0.5) * 140.0, (aT.z - 0.5) * 90.0 + 60.0, (aT.w - 0.5) * 300.0) * sw;
        vC = mix(vec3(0.62, 0.65, 0.66), vec3(0.25, 0.42, 0.71), smoothstep(0.2, 0.8, k)); vA = (0.9 - 0.3 * sw);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); gl_PointSize = uPx * (0.9 + aT.w * 0.3);
      }`,
    fragmentShader: /* glsl */`uniform float uA; varying vec3 vC; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5), a = smoothstep(0.5, 0.3, r) * vA * uA; if (a < 0.01) discard; gl_FragColor = vec4(vC * a, a); }` }));
  pts.frustumCulled = false; pts.renderOrder = 6; scene.add(pts);

  /* ---------- layout (world units are screen pixels, origin at the centre of the screen) ---------- */
  let W = 0, H = 0, DPR = 1, MOB = false, CX = 0, CY = 0, CW = 0, CH = 0, tw = 0, gap = 0, RR = 0, HH = 0, GX = 0, gtw = 0, ggap = 0, LH = 0;
  const layout = () => {
    W = sec.clientWidth; H = innerHeight; MOB = W < 900; DPR = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.position.set(0, 0, H / 2 / FOVT); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    CX = (MOB ? W * 0.5 : W * 0.66) - W / 2; CY = H / 2 - (MOB ? H * 0.37 : H * 0.5);
    CH = MOB ? Math.min(H * 0.48, (W - 56) * ASP) : Math.min(H * 0.7, W * 0.36 * ASP); CW = CH / ASP;
    tw = MOB ? W * 0.19 : Math.min(W * 0.092, H * 0.18); gap = tw * 0.2; RR = (8 * (tw + gap)) / TAU; HH = MOB ? H * 0.44 : H * 0.7;
    gtw = MOB ? (W - 32 - 24) / 4 : Math.min(W * 0.085, H * 0.16); ggap = MOB ? 8 : gtw * 0.1; GX = MOB ? CX : W * 0.7 - W / 2;
    LH = MOB ? H * 0.3 : H * 0.46;
  };
  layout(); addEventListener('resize', layout);

  /* ---------- input ---------- */
  let touchA = 0, prog = 0, lastProg = 0, vel = 0, smx = 0, smy = 0, mx = -1, my = -1, inView = true, drag = 0, spin = 0;
  const st = { intro: RM ? 1 : 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const touchEl = FINE ? $('.h3-touch', sec) : null, touchT = touchEl && $('span', touchEl); let tlx = 0, tly = 0;
  const bgv = innerWidth >= 900 ? $('.h3-bgv', sec) : null, bgVids = bgv ? $$('video', bgv) : []; let bgK = -1, bgT = 0;
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = -1; }); }
  const hoverUV = new Map();
  const pick = () => {
    hoverUV.clear(); if (mx < 0) return;
    ndc.set((mx / W) * 2 - 1, -(my / H) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([card, ...tiles].filter((m) => m.visible && m.material.uniforms.uAlpha.value > 0.3), false);
    if (hits.length) hoverUV.set(hits[0].object, hits[0].uv);
  };

  /* ---------- per frame ---------- */
  const V3 = new THREE.Vector3(), Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), E = new THREE.Euler(), S3 = new THREE.Vector3();
  const setU = (m, o) => { const u = m.material.uniforms; for (const k in o) { if (u[k].value && u[k].value.set && Array.isArray(o[k])) u[k].value.set(...o[k]); else u[k].value = o[k]; } };
  const hoverOn = (m, t) => { const u = m.material.uniforms.uMouse.value, h = hoverUV.get(m); if (h) { u.x += (h.x - u.x) * 0.25; u.y += (h.y - u.y) * 0.25; u.z += (1 - u.z) * 0.12; } else u.z *= 0.9; };
  let ringRot = 0;
  const render = (t, dt) => {
    const p = prog;
    vel += ((p - lastProg) * 60 - vel) * 0.1; lastProg = p;
    if (mx >= 0) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; } else { smx *= 0.95; smy *= 0.95; }
    const bend = clamp(vel * 600, -36, 36);
    pick();
    let act = -1, c = 0;
    for (let a = 0; a < 4; a++) { const [s0, e0] = R[a + 1]; if (p >= s0 && p < e0) { act = a; c = (p - s0) / (e0 - s0); } }
    const intro = ease(clamp(st.intro));

    /* hero: the twelve pains wound on a tilted double helix */
    spin += (RM ? 0 : 0.16 + Math.abs(vel) * 6) * Math.min(dt, 0.05);
    const k1 = seg(p, 0.06, 0.105), k2 = seg(p, 0.1, 0.145);
    const TURNS = 1.5, thN = (((PAIN[0].i + 6) % 12) / 11 - 0.5) * TURNS * TAU;
    const rot0 = spin + smx * 0.7, nearest = rot0 - ((((rot0 + thN + Math.PI) % TAU) + TAU) % TAU - Math.PI);
    ringRot = mix(rot0, nearest, k1);
    ring.position.set(CX + (MOB ? 0 : 20), CY, -RR * 0.2 + k2 * 520);
    ring.rotation.set(0.12 - smy * 0.18 + (1 - intro) * 0.4, 0, (MOB ? -0.12 : -0.2) * (1 - k1 * 0.7) + (1 - intro) * 0.3);
    const ringA = (1 - k2) * (p < 0.2 ? 1 : 0);
    // the healing light: the cursor on desktop, a slow sweep on touch screens
    let tX = mx, tY = my, tA = 0;
    if (FINE) tA = mx >= 0 ? 1 : 0; else { tX = W * 0.5 + Math.sin(t * 0.5) * W * 0.3; tY = (MOB ? H * 0.37 : H * 0.5) + Math.sin(t * 0.37 + 1) * H * 0.18; tA = 0.9; }
    touchA += (tA * ringA * intro - touchA) * 0.08;
    const tR = (MOB ? 70 : 115) * DPR;
    let hov = -1;
    tiles.forEach((m, i) => {
      const ord = (i + 6) % 12, fy = ord / 11 - 0.5, sc = SCAT[i], ke = ease(clamp(intro * 1.6 - ord * 0.045));
      const th = fy * TURNS * TAU + ringRot + (1 - ke) * sc.a, front = Math.cos(th), back = clamp(-front);
      pull[i] += ((hoverUV.has(m) && ringA > 0.5 ? 1 : 0) - pull[i]) * 0.1; if (hoverUV.has(m)) hov = i;
      const rr = RR * (1 + k2 * 2.6), out = 80 * pull[i];
      const x = Math.sin(th) * (rr + out) + (1 - ke) * sc.x, z = Math.cos(th) * (rr + out) - rr + (1 - ke) * sc.z;
      const y = -fy * HH * (1 + k2 * 0.9) + Math.sin(t * 0.7 + i) * 5 + (1 - ke) * sc.y;
      m.position.set(x, y, z); m.rotation.set((1 - ke) * sc.r, th, (1 - ke) * sc.r * 0.5);
      const sz = 1 + 0.1 * pull[i]; m.scale.set(tw * sz, tw * ASP * sz, 1);
      m.visible = ringA > 0.002 && !(i === PAIN[0].i && k2 > 0.001);
      hoverOn(m, t);
      setU(m, { uSize: [tw * sz, tw * ASP * sz], uRad: MOB ? 10 : 14, uCurve: (rr + out) * (1 + k2 * 12), uAlpha: ringA * ke * (0.5 + 0.5 * clamp(front * 0.6 + 0.6)),
        uDim: 0.45 * back, uBlur: 2.6 * back, uTime: t, uBend: bend * 0.5, uSat: 0.5, uPulse: 0, uTouchA: touchA, uTouch: [tX * DPR, (H - tY) * DPR, tR] });
    });
    motes.visible = ringA > 0.002; MU.uT.value = t; MU.uA.value = ringA * intro; MU.uR.value = RR; MU.uH.value = HH; MU.uPx.value = (MOB ? 2 : 2.4) * DPR;
    // the cursor label invites the touch, and names the pain under it
    if (touchEl) {
      const on = FINE && mx >= 0 && ringA > 0.5 ? 1 : 0;
      tlx += ((mx + 18) - tlx) * 0.2; tly += ((my + 18) - tly) * 0.2;
      touchEl.style.opacity = on; touchEl.style.transform = `translate3d(${tlx.toFixed(1)}px,${tly.toFixed(1)}px,0)`;
      const txt = hov >= 0 ? `${NAMES[KEY[hov]]} · healing` : 'Touch a pain to heal it';
      if (touchT.textContent !== txt) touchT.textContent = txt;
    }
    // the clinic's sessions play softly behind the helix
    if (bgv) {
      const bo = (1 - seg(p, 0.04, 0.1)) * intro; bgv.style.opacity = bo.toFixed(3);
      if (bo > 0.01) { if (bgK < 0 || t - bgT > 6.5) { bgK = (bgK + 1) % bgVids.length; bgT = t; bgVids.forEach((v, i) => { const on = i === bgK, nx = i === (bgK + 1) % bgVids.length; if ((on || nx) && !v.getAttribute('src')) { v.src = v.dataset.src; v.muted = true; } v.classList.toggle('is-on', on); if (on) { const pr = v.play(); if (pr) pr.catch(() => {}); } else v.pause(); }); } }
      else if (bgK >= 0) { bgVids.forEach((v) => v.pause()); bgK = -1; }
    }

    /* the feature card */
    const cu = card.material.uniforms;
    let cOn = false, flip = 0, cMix = 0, cHeal = 0, cPulse = 0, cSat = 0, mk = -1, photoI = 0, painUV = PAIN[0].uv;
    if (act >= 0) {
      cOn = true; photoI = PAIN[act].i; painUV = PAIN[act].uv; mk = act;
      flip = act === 0 ? 0 : (1 - ease(clamp(c / 0.12))) * (Math.PI / 2);
      flip -= ease(clamp((c - 0.88) / 0.12)) * (Math.PI / 2);
      cSat = seg(c, 0.08, 0.2) * (1 - seg(c, 0.4, 0.5)); cPulse = seg(c, 0.1, 0.18) * (1 - seg(c, 0.32, 0.4));
      cMix = seg(c, 0.3, 0.44) * (1 - seg(c, 0.72, 0.84)); cHeal = seg(c, 0.5, 0.6);
    } else if (p >= R[5][0] && p < R[5][1]) {
      const cc = (p - R[5][0]) / (R[5][1] - R[5][0]); cOn = true; mk = 4; photoI = PAIN[3].i; painUV = new THREE.Vector2(0.5, 0.5);
      flip = (1 - ease(clamp(cc / 0.12))) * (Math.PI / 2) - ease(clamp((cc - 0.88) / 0.12)) * (Math.PI / 2); cMix = 1; cHeal = 1;
    }
    card.visible = cOn && Math.abs(flip) < Math.PI / 2 - 0.01;
    if (cOn) {
      // from the ring's front slot to the feature position (first chapter), then rest with a soft cursor tilt
      const from = act === 0 ? 1 - k2 : 0;
      ring.updateMatrixWorld(); const slot = tiles[PAIN[0].i];
      slot.updateMatrixWorld(); slot.matrixWorld.decompose(V3, Q2, S3);
      E.set(-smy * 0.14, smx * 0.2 + flip, 0); Q.setFromEuler(E);
      card.position.set(mix(CX, V3.x, from), mix(CY, V3.y, from), mix(0, V3.z, from));
      card.quaternion.copy(Q).slerp(Q2, from);
      const w = mix(CW, tw, from), h = mix(CH, tw * ASP, from); card.scale.set(w, h, 1);
      const m = mk >= 0 ? media[mk] : null, tex2 = m ? m.ensure() : null;
      if (cMix > 0.001 && m && m.vid) playOnly(mk); else if (cMix <= 0.001) playOnly(-1);
      hoverOn(card, t);
      setU(card, { uTex: PHOTO[photoI], uTex2: tex2 || PHOTO[photoI], uHas2: tex2 ? 1 : 0, uA2: tex2 ? tex2.userData.aspect || 0.56 : 0.73, uKB: m && !m.vid ? 1 : 0, uCrop: m && m.crop ? 0.17 : 0,
        uSize: [w, h], uRad: MOB ? 18 : 22, uAlpha: 1, uMix: cMix, uHeal: cHeal, uPulse: cPulse, uSat: cSat, uTime: t, uBend: bend, uWave: 0, uDim: 0 });
      cu.uPain.value.copy(painUV);
    } else playOnly(-1);

    /* captions + the label at the pain */
    const capEl = $('.h3-cap'), capT = capEl && $('span', capEl);
    if (capEl) {
      const ca = cOn && card.visible ? clamp((cMix - 0.6) / 0.4) : 0;
      if (ca > 0 && mk >= 0 && capT.textContent !== media[mk].cap) capT.textContent = media[mk].cap;
      capEl.style.opacity = ca.toFixed(3);
      capEl.style.transform = `translate3d(${(CX + W / 2).toFixed(1)}px,${(H / 2 - CY + CH / 2 + 18 + (1 - ca) * 8).toFixed(1)}px,0) translateX(-50%)`;
    }
    if (tag) {
      if (act >= 0 && card.visible) {
        const vis = seg(c, 0.14, 0.24) * (1 - seg(c, 0.84, 0.9)) * (1 - seg(c, 0.32, 0.42) * 0.0);
        V3.set(painUV.x - 0.5, painUV.y - 0.5, 0); card.updateMatrixWorld(); V3.applyMatrix4(card.matrixWorld).project(camera);
        const Xp = (V3.x * 0.5 + 0.5) * W, Yp = (-V3.y * 0.5 + 0.5) * H, flipL = Xp + 260 > W;
        tag.classList.toggle('is-flip', flipL); tag.classList.toggle('is-calm', c > 0.7);
        const tx = flipL ? Xp - 16 - tag.offsetWidth : Xp + 16;
        tag.style.transform = `translate(${clamp(tx, 8, W - tag.offsetWidth - 8).toFixed(1)}px,${(Yp - tag.offsetHeight / 2).toFixed(1)}px)`; tag.style.opacity = vis.toFixed(3);
      } else tag.style.opacity = 0;
    }

    /* the end: every pain returns healed, then dissolves into the figure */
    const endIn = seg(p, 0.865, 0.905), toLogo = seg(p, 0.925, 0.975);
    flat.forEach((m, i) => {
      const col = i % 4, row = (i / 4) | 0, x = GX + (col - 1.5) * (gtw + ggap), y = CY - (row - 1) * (gtw * ASP + ggap);
      const e = ease(clamp(endIn * 1.6 - i * 0.05));
      m.visible = e > 0.002 && toLogo < 0.35;
      m.position.set(x + smx * 14, y - smy * 10, (1 - e) * -900); m.rotation.set((1 - e) * 0.6, (1 - e) * (col - 1.5) * 0.4, 0); m.scale.set(gtw, gtw * ASP, 1);
      m.material.uniforms.uPain.value.set(-9, -9);
      setU(m, { uSize: [gtw, gtw * ASP], uRad: MOB ? 8 : 12, uAlpha: e * (1 - seg(toLogo, 0.05, 0.3)), uHeal: 1, uTime: t, uBend: bend * 0.4, uDim: 0, uSat: 0 });
      PU.uGrid.value[i].set(x, y, gtw, gtw * ASP);
    });
    PU.uK.value = toLogo; PU.uA.value = clamp(toLogo * 12); PU.uTime.value = t; PU.uPx.value = (MOB ? 1.6 : 1.8) * DPR;
    PU.uLogo.value.set(CX, CY, LH); pts.visible = toLogo > 0.001;

    renderer.render(scene, camera);
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
  let lt = 0;
  g.ticker.add((time) => { const dt = lt ? time - lt : 0.016; lt = time; if (inView) render(time, dt); });
  if (!RM) {
    const go = () => {
      g.to(st, { intro: 1, duration: 2.4, ease: 'expo.out' });
      g.fromTo('[data-ncx-in]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.6, ease: 'expo.out' });
    };
    const t0 = performance.now(), chk = () => (!$('.az-pre') || performance.now() - t0 > 7000 ? go() : setTimeout(chk, 120)); chk();
  }
})();
