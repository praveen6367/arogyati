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
    chs.forEach((c, i) => c.classList.toggle('is-on', i === 0 || i === k));
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
    uniform sampler2D uTex, uTex2, uTex3; uniform vec3 uLens; uniform float uLensA, uA3, uSplit, uSplitA; uniform vec2 uSize, uPain; uniform vec3 uMouse;
    uniform float uA1, uA2, uRad, uMix, uHeal, uPulse, uSat, uTime, uAlpha, uKB, uDim, uHas2, uCrop, uBlur, uTouchA, uZoom, uMir; uniform vec3 uTouch; uniform vec2 uUVc;
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
      vec2 c1 = cover(uvr, uA1, pa); c1 = (c1 - 0.5) / uZoom + uUVc; if (uMir > 0.5) c1.x = 2.0 * uUVc.x - c1.x;
      vec3 photo = vec3(texture2D(uTex, c1 + off).r, texture2D(uTex, c1).g, texture2D(uTex, c1 - off).b);
      if (uBlur > 0.001) { vec2 bo = vec2(uBlur * 0.006, uBlur * 0.006 * pa); photo = (photo + texture2D(uTex, c1 + vec2(bo.x, 0.0)).rgb + texture2D(uTex, c1 - vec2(bo.x, 0.0)).rgb + texture2D(uTex, c1 + vec2(0.0, bo.y)).rgb + texture2D(uTex, c1 - vec2(0.0, bo.y)).rgb) / 5.0; }
      float lum = dot(photo, vec3(0.299, 0.587, 0.114)), red = clamp((photo.r - max(photo.g, photo.b)) * 2.4, 0.0, 1.0);
      photo += vec3(0.1, -0.03, -0.03) * red * uSat * (0.7 + 0.3 * sin(uTime * 4.0));
      // healing: the treated photograph, or wherever the healing light (cursor) touches
      float tl = length(gl_FragCoord.xy - uTouch.xy), tch = uTouchA * exp(-pow(tl / uTouch.z, 2.0) * 1.6);
      float sm = uSplitA > 0.001 ? smoothstep(uSplit + 0.003, uSplit - 0.003, vUv.x) : 1.0, hl = uHeal * sm;
      vec3 healed = vec3(lum) * 1.05 + 0.01;
      healed = mix(healed, healed * vec3(0.9, 1.05, 0.88) + vec3(0.0, 0.035, 0.0), clamp(exp(-dist * dist / 0.03) * hl + tch * 0.8, 0.0, 1.0));
      photo = mix(photo, healed, max(hl, tch));
      photo += vec3(0.5, 0.78, 0.45) * exp(-pow((tl - uTouch.z) / (uTouch.z * 0.07), 2.0)) * 0.14 * uTouchA;
      vec3 col = photo;
      if (uHas2 > 0.5) {
        vec2 kb = (uvr - 0.5) / (1.0 + uKB * (0.07 + 0.025 * sin(uTime * 0.2))) + 0.5;
        vec2 c2 = cover(kb, uA2, pa); c2.y = c2.y * (1.0 - uCrop) + uCrop;
        vec3 tr = texture2D(uTex2, c2).rgb;
        col = mix(tr, photo, m) + band * 0.22;
      }
      if (uSplitA > 0.001) { // the before / after line and its handle
        float lx = (vUv.x - uSplit) * uSize.x; col = mix(col, vec3(1.0), exp(-lx * lx / 0.9) * uSplitA);
        vec2 hp = (vUv - vec2(uSplit, 0.5)) * uSize; float hr = length(hp);
        col = mix(col, vec3(1.0), (1.0 - smoothstep(14.0, 15.5, hr)) * uSplitA);
        col = mix(col, vec3(0.1, 0.14, 0.12), (1.0 - smoothstep(1.2, 2.2, length(hp - vec2(-4.5, 0.0)))) * uSplitA);
        col = mix(col, vec3(0.1, 0.14, 0.12), (1.0 - smoothstep(1.2, 2.2, length(hp - vec2(4.5, 0.0)))) * uSplitA);
      }
      if (uLensA > 0.001) { // the lens: the real treatment, seen through the photograph
        vec2 ld = (vUv - uLens.xy) * vec2(pa, 1.0); float lr = length(ld), lm = (1.0 - smoothstep(uLens.z - 0.01, uLens.z + 0.01, lr)) * uLensA;
        vec2 lu = uLens.xy + (vUv - uLens.xy) * (0.82 + 0.18 * smoothstep(0.0, uLens.z, lr));
        vec3 tv = texture2D(uTex3, cover(lu, uA3, pa)).rgb;
        col = mix(col * (1.0 - 0.12 * uLensA * smoothstep(uLens.z, uLens.z + 0.15, lr)), tv, lm);
        col += vec3(1.0) * exp(-pow((lr - uLens.z) / 0.005, 2.0)) * 0.55 * uLensA;
      }
      col += rip * 0.2;
      col = mix(col, col * 0.6 + 0.16, uDim);
      float a = edge * uAlpha; gl_FragColor = vec4(col * a, a);
    }`;
  const mkMat = (tex) => new THREE.ShaderMaterial({
    uniforms: { uTex: { value: tex }, uTex2: { value: tex }, uSize: { value: new THREE.Vector2(100, 100) }, uPain: { value: new THREE.Vector2(0.5, 0.5) }, uMouse: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uA1: { value: 273 / 373 }, uA2: { value: 0.56 }, uRad: { value: 20 }, uMix: { value: 0 }, uHeal: { value: 0 }, uPulse: { value: 0 }, uSat: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 0 },
      uKB: { value: 0 }, uDim: { value: 0 }, uHas2: { value: 0 }, uCrop: { value: 0 }, uBend: { value: 0 }, uWave: { value: 0 }, uCurve: { value: 0 }, uBlur: { value: 0 }, uTouch: { value: new THREE.Vector3(-999, -999, 100) }, uTouchA: { value: 0 }, uZoom: { value: 1 }, uMir: { value: 0 }, uUVc: { value: new THREE.Vector2(0.5, 0.5) }, uTex3: { value: tex }, uA3: { value: 0.56 }, uLens: { value: new THREE.Vector3(0.5, 0.5, 0.2) }, uLensA: { value: 0 }, uSplit: { value: 0 }, uSplitA: { value: 0 } },
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
  // [label, photo, x, y, w, h (in body heights, y up, centre of the body = 0), rotation°, photo focus (x, y from top), zoom, mirror, depth px, round ('c' = capsule)]
  const PIECES = [
    ['Upper back', 'upperback', 0, 0.2, 0.3, 0.28, 0, 0.5, 0.45, 1.05, 0, -40, 0.05],
    ['Head', 'neck', 0, 0.43, 0.11, 0.13, 0, 0.5, 0.27, 1.9, 0, 12, 'c'],
    ['Neck', 'neck', 0, 0.347, 0.12, 0.062, 0, 0.5, 0.62, 2.1, 0, 22, 'c'],
    ['Chest', 'chest', 0, 0.245, 0.23, 0.14, 0, 0.5, 0.42, 1.3, 0, 14, 0.03],
    ['Shoulder', 'shoulder', -0.145, 0.287, 0.1, 0.092, 0, 0.66, 0.38, 1.6, 1, 26, 'c'],
    ['Shoulder', 'shoulder', 0.145, 0.287, 0.1, 0.092, 0, 0.66, 0.38, 1.6, 0, 26, 'c'],
    ['Upper arm', 'elbow', -0.178, 0.165, 0.064, 0.15, 6, 0.55, 0.35, 1.4, 1, 6, 'c'],
    ['Upper arm', 'elbow', 0.178, 0.165, 0.064, 0.15, -6, 0.55, 0.35, 1.4, 0, 6, 'c'],
    ['Forearm & wrist', 'wrist', -0.208, 0.025, 0.056, 0.14, 8, 0.55, 0.42, 1.3, 1, 2, 'c'],
    ['Forearm & wrist', 'wrist', 0.208, 0.025, 0.056, 0.14, -8, 0.55, 0.42, 1.3, 0, 2, 'c'],
    ['Ribs', 'ribs', 0, 0.115, 0.19, 0.12, 0, 0.55, 0.55, 1.3, 0, 12, 0.03],
    ['Lower back', 'lowerback', 0, 0.005, 0.2, 0.085, 0, 0.5, 0.78, 1.6, 0, 18, 'c'],
    ['Hip', 'hip', -0.07, -0.065, 0.095, 0.085, 0, 0.55, 0.36, 1.6, 1, 8, 0.04],
    ['Hip', 'hip', 0.07, -0.065, 0.095, 0.085, 0, 0.55, 0.36, 1.6, 0, 8, 0.04],
    ['Thigh', 'hip', -0.068, -0.165, 0.085, 0.15, 2, 0.42, 0.74, 1.3, 1, 4, 'c'],
    ['Thigh', 'hip', 0.068, -0.165, 0.085, 0.15, -2, 0.42, 0.74, 1.3, 0, 4, 'c'],
    ['Knee', 'knee', -0.066, -0.266, 0.08, 0.076, 0, 0.72, 0.55, 1.6, 1, 24, 'c'],
    ['Knee', 'knee', 0.066, -0.266, 0.08, 0.076, 0, 0.72, 0.55, 1.6, 0, 24, 'c'],
    ['Shin', 'ankle', -0.064, -0.36, 0.06, 0.14, 1, 0.45, 0.3, 1.2, 1, 6, 'c'],
    ['Shin', 'ankle', 0.064, -0.36, 0.06, 0.14, -1, 0.45, 0.3, 1.2, 0, 6, 'c'],
    ['Ankle & foot', 'ankle', -0.074, -0.465, 0.086, 0.046, 0, 0.5, 0.85, 1.5, 1, 10, 'c'],
    ['Ankle & foot', 'ankle', 0.074, -0.465, 0.086, 0.046, 0, 0.5, 0.85, 1.5, 0, 10, 'c'],
    ['Spine', 'spine', 0, 0.17, 0.042, 0.3, 0, 0.5, 0.45, 1.0, 0, 44, 'c'],
  ].map(([label, k, x, y, w, h, rot, fx, fy, zoom, mir, z, rd], i) => ({ label, i: KEY.indexOf(k), x, y, w, h, rot: rot * Math.PI / 180, uvc: new THREE.Vector2(fx, 1 - fy), zoom, mir, z, rd }));
  const NECKP = PIECES.findIndex((q) => q.label === 'Neck'), NPC = PIECES.length;
  const pieces = PIECES.map((q) => { const m = new THREE.Mesh(plane, mkMat(PHOTO[q.i])); m.frustumCulled = false; ring.add(m); return m; });
  ring.add(motes);
  const SCAT = PIECES.map(() => ({ x: (Math.random() - 0.5) * 1900, y: (Math.random() - 0.5) * 1200, z: -500 - Math.random() * 1500, r: (Math.random() - 0.5) * 2.4, d: Math.random() * 0.35 }));
  const pull = PIECES.map(() => 0);
  const stack = [0, 1].map(() => { const m = new THREE.Mesh(plane, mkMat(PHOTO[0])); m.frustumCulled = false; m.renderOrder = 3 - 0; scene.add(m); return m; });
  const HERO = ['Neck pain · Osteopathy', 'Frozen shoulder · Super Inductive System', 'Lower back pain · Matrix Rhythm Therapy', 'Knee pain · Class IV Laser'];
  let hIdx = 0, hNext = 0, hTr = -1, hLast = 0, lensA = 0, pipOn = -2, tNow = 0;
  const note = $('.h3-note', sec), pip = note && $('.h3-note__v', note), pipM = pip ? $$('video,img', pip) : [], prg = $('.h3-prog', sec), prgB = prg ? $$('button', prg) : [];
  const lead = $('.h3-lead', sec), leadL = lead && $('line', lead), leadC = lead ? $$('circle', lead) : [], noteN = note && $('.h3-note__n b', note), noteT = note && $('.h3-note__t', note), noteM = note && $('.h3-note__m', note); let noteKey = '';
  const stepsOl = note && $('.h3-note__steps', note), steps = note ? $$('.h3-note__steps li', note) : [], stepM = note && $('.h3-note__steps em', note), pin = $('.h3-pin', sec), pinB = pin && $('b', pin), ba = $('.h3-ba', sec);
  const SLIDE = 9.5, TRD = 1.05; let slide = 0, slideT = 0, tr = null;
  const startTr = (to, dir) => { if (tr) return; to = ((to % 4) + 4) % 4; if (to === slide) return; tr = { to, dir, t0: tNow }; };
  const arwP = $('.h3-arw--prev', sec), arwN = $('.h3-arw--next', sec);
  if (arwP) arwP.addEventListener('click', () => startTr(slide - 1, -1));
  if (arwN) arwN.addEventListener('click', () => startTr(slide + 1, 1));
  prgB.forEach((b, k) => b.addEventListener('click', () => startTr(k, k > slide ? 1 : -1))); const lensUV = new THREE.Vector2(0.5, 0.5);
  const card = new THREE.Mesh(plane, mkMat(PHOTO[0])); card.frustumCulled = false; card.renderOrder = 5; scene.add(card);
  const card2 = new THREE.Mesh(plane, mkMat(PHOTO[0])); card2.frustumCulled = false; card2.renderOrder = 6; card2.visible = false; scene.add(card2);

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
  for (let i = 0; i < NP; i++) { pa[i * 4] = (Math.random() * 23) | 0; pa[i * 4 + 1] = Math.random(); pa[i * 4 + 2] = Math.random(); pa[i * 4 + 3] = Math.random(); }
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3)); pg.setAttribute('aT', new THREE.BufferAttribute(pa, 4)); pg.setAttribute('aL', new THREE.BufferAttribute(LP, 2));
  const PU = { uK: { value: 0 }, uA: { value: 0 }, uGrid: { value: Array.from({ length: 24 }, () => new THREE.Vector4()) }, uLogo: { value: new THREE.Vector3() }, uTime: { value: 0 }, uPx: { value: 2 } };
  const pts = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: PU, transparent: true, depthWrite: false, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: /* glsl */`
      attribute vec4 aT; attribute vec2 aL; uniform float uK, uTime, uPx; uniform vec4 uGrid[24]; uniform vec3 uLogo; varying vec3 vC; varying float vA;
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
  let HB = 600, W = 0, H = 0, DPR = 1, MOB = false, CX = 0, CY = 0, CW = 0, CH = 0, tw = 0, gap = 0, RR = 0, HH = 0, GX = 0, gtw = 0, ggap = 0, LH = 0;
  const layout = () => {
    W = sec.clientWidth; H = innerHeight; MOB = W < 900; DPR = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.position.set(0, 0, H / 2 / FOVT); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    CX = (MOB ? W * 0.5 : W * 0.615) - W / 2; CY = H / 2 - (MOB ? H * 0.37 : H * 0.5);
    CH = MOB ? Math.min(H * 0.48, (W - 56) * ASP) : Math.min(H * 0.7, W * 0.36 * ASP); CW = CH / ASP;
    if (MOB && chs[0]) {
      const top = chs[0].offsetTop + chs[0].offsetHeight + 18;
      CH = Math.max(200, Math.min(H * 0.42, (W - 96) * ASP, H - top - 150)); CW = CH / ASP; CY = H / 2 - (top + CH / 2);
      sec.style.setProperty('--cardB', Math.round(top + CH) + 'px');
    }
    tw = MOB ? W * 0.19 : Math.min(W * 0.092, H * 0.18); gap = tw * 0.2; RR = (8 * (tw + gap)) / TAU; HH = MOB ? H * 0.44 : H * 0.7;
    gtw = MOB ? (W - 32 - 24) / 4 : Math.min(W * 0.085, H * 0.16); ggap = MOB ? 8 : gtw * 0.1; GX = MOB ? CX : W * 0.7 - W / 2;
    LH = MOB ? H * 0.3 : H * 0.46; HB = MOB ? Math.min(H * 0.54, W * 1.9) : Math.min(H * 0.8, W * 1.0);
  };
  layout(); addEventListener('resize', layout); setTimeout(layout, 700); if (d.fonts) d.fonts.ready.then(layout);

  /* ---------- input ---------- */
  let touchA = 0, prog = 0, lastProg = 0, vel = 0, smx = 0, smy = 0, mx = -1, my = -1, inView = true, drag = 0, spin = 0;
  const st = { intro: RM ? 1 : 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const touchEl = FINE ? $('.h3-touch', sec) : null, touchT = touchEl && $('span', touchEl); let tlx = 0, tly = 0;
  const bgv = null, bgVids = bgv ? $$('video', bgv) : []; let bgK = -1, bgT = 0;
  if (FINE) { sec.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true }); sec.addEventListener('pointerleave', () => { mx = -1; }); }
  const hoverUV = new Map();
  const pick = () => {
    hoverUV.clear(); if (mx < 0) return;
    ndc.set((mx / W) * 2 - 1, -(my / H) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([card, ...pieces].filter((m) => m.visible && m.material.uniforms.uAlpha.value > 0.3), false);
    if (hits.length) hoverUV.set(hits[0].object, hits[0].uv);
  };

  /* ---------- per frame ---------- */
  const V3 = new THREE.Vector3(), Q = new THREE.Quaternion(), Q2 = new THREE.Quaternion(), E = new THREE.Euler(), S3 = new THREE.Vector3();
  const setU = (m, o) => { const u = m.material.uniforms; for (const k in o) { if (u[k].value && u[k].value.set && Array.isArray(o[k])) u[k].value.set(...o[k]); else u[k].value = o[k]; } };
  const hoverOn = (m, t) => { const u = m.material.uniforms.uMouse.value, h = hoverUV.get(m); if (h) { u.x += (h.x - u.x) * 0.25; u.y += (h.y - u.y) * 0.25; u.z += (1 - u.z) * 0.12; } else u.z *= 0.9; };
  let ringRot = 0;
  const render = (t, dt) => {
    // auto carousel: time drives the four pains in a loop (hovering the card pauses it)
    let trK = 0;
    if (!tr && !(FINE && hoverUV.has(card))) slideT += Math.min(dt, 0.05) * (RM ? 0.6 : 1);
    if (!tr && slideT >= SLIDE * 0.92) startTr(slide + 1, 1);
    if (tr) { trK = clamp((t - tr.t0) / TRD); if (trK >= 1) { slide = tr.to; slideT = 0; tr = null; trK = 0; } }
    prog = R[slide + 1][0] + clamp(slideT / SLIDE, 0, 0.999) * (R[slide + 1][1] - R[slide + 1][0]);
    const p = prog; tNow = t;
    { const k1 = (tr && trK > 0.45 ? tr.to : slide) + 1; if (k1 !== cur) setChapter(k1); }
    vel += ((p - lastProg) * 60 - vel) * 0.1; lastProg = p;
    if (mx >= 0) { smx += ((mx - W / 2) / W - smx) * 0.06; smy += ((my - H / 2) / H - smy) * 0.06; } else { smx *= 0.95; smy *= 0.95; }
    const bend = 0;
    pick();
    let act = -1, c = 0;
    for (let a = 0; a < 4; a++) { const [s0, e0] = R[a + 1]; if (p >= s0 && p < e0) { act = a; c = (p - s0) / (e0 - s0); } }
    const intro = ease(clamp(st.intro));

    /* hero: one editorial card that cycles through the four pains; the end card dissolves into the logo */
    const heroOn = p < R[1][0], endOn = p >= R[6][0], endIn = seg(p, 0.86, 0.9), toLogo = seg(p, 0.925, 0.975);
    const lock = seg(p, 0.015, 0.06), heroA = 1;
    pieces.forEach((m) => { m.visible = false; }); motes.visible = false;
    let hov = card.visible && hoverUV.has(card) && heroOn ? 1 : -1;
    // the cursor label invites the touch, and names the pain under it
    if (touchEl) {
      const on = FINE && mx >= 0 && heroOn && hov > 0 ? 1 : 0;
      tlx += ((mx + 18) - tlx) * 0.2; tly += ((my + 18) - tly) * 0.2;
      touchEl.style.opacity = on; touchEl.style.transform = `translate3d(${tlx.toFixed(1)}px,${tly.toFixed(1)}px,0)`;
      const txt = 'See the treatment';
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
    let cSplit = 0, cSplitA = 0, cOn = false, flip = 0, cMix = 0, cHeal = 0, cPulse = 0, cSat = 0, mk = -1, photoI = 0, painUV = PAIN[0].uv, cA = 1, hero2 = -1;
    if (heroOn) {
      // cycle the four pains with a liquid dissolve; once the story starts, settle on the neck
      cOn = true;
      if (hTr < 0) {
        if (lock > 0.4 && hIdx !== 0) { hNext = 0; hTr = t; }
        else if (lock <= 0.4 && t - hLast > 4.2 && !RM) { hNext = (hIdx + 1) % 4; hTr = t; }
      }
      const tr = hTr >= 0 ? clamp((t - hTr) / 1.4) : 0;
      if (hTr >= 0 && tr >= 1) { hIdx = hNext; hTr = -1; hLast = t; }
      photoI = PAIN[hIdx].i; painUV = new THREE.Vector2(0.5, -0.2); cMix = hTr >= 0 ? ease(tr) : 0; hero2 = hTr >= 0 ? PAIN[hNext].i : -1; cSat = 0.3;
      cA = ease(clamp(intro * 1.3));
    } else if (endOn) {
      cOn = true; photoI = PAIN[0].i; painUV = new THREE.Vector2(-9, -9); cHeal = 1;
      flip = (1 - ease(clamp((p - 0.86) / 0.035))) * (Math.PI / 2); cA = 1 - seg(toLogo, 0.05, 0.3);
    } else if (act >= 0) {
      cOn = true; photoI = PAIN[act].i; painUV = PAIN[act].uv; mk = act;
      flip = 0; cA = ease(clamp(intro * 1.3)); media[(act + 1) % 4].ensure();
      cSat = seg(c, 0.08, 0.2) * (1 - seg(c, 0.34, 0.42)); cPulse = seg(c, 0.1, 0.18) * (1 - seg(c, 0.28, 0.34));
      cMix = seg(c, 0.28, 0.4) * (1 - seg(c, 0.6, 0.7));
      cHeal = c >= 0.71 ? 1 : 0; cSplit = mix(-0.02, 1.02, seg(c, 0.72, 0.86)); cSplitA = seg(c, 0.7, 0.74) * (1 - seg(c, 0.86, 0.9));
    } else if (p >= R[5][0] && p < R[5][1]) {
      const cc = (p - R[5][0]) / (R[5][1] - R[5][0]); cOn = true; mk = 4; photoI = PAIN[3].i; painUV = new THREE.Vector2(0.5, 0.5);
      flip = (1 - ease(clamp(cc / 0.12))) * (Math.PI / 2) - ease(clamp((cc - 0.88) / 0.12)) * (Math.PI / 2); cMix = 1; cHeal = 1;
    }
    card.visible = cOn && Math.abs(flip) < Math.PI / 2 - 0.01;
    if (cOn) {
      // from the ring's front slot to the feature position (first chapter), then rest with a soft cursor tilt
      const from = 0;
      ring.updateMatrixWorld(); const slot = pieces[NECKP], sq = PIECES[NECKP];
      slot.updateMatrixWorld(); slot.matrixWorld.decompose(V3, Q2, S3);
      E.set(-smy * 0.14, smx * 0.2 + flip, 0); Q.setFromEuler(E);
      card.position.set(CX, CY + (heroOn ? (1 - cA) * -30 : 0), 0);
      card.quaternion.copy(Q).slerp(Q2, from);
      const w = mix(CW, sq.w * HB, from), h = mix(CH, sq.h * HB, from); card.scale.set(w, h, 1);
      const m = mk >= 0 ? media[mk] : null, tex2 = m ? m.ensure() : null;
      // hero lens: the treatment for the pain on the card, under the cursor
      const lm = heroOn ? media[hIdx] : null, lOn = heroOn && FINE && hoverUV.has(card) && hTr < 0 && lock < 0.3;
      if (lOn) lensUV.lerp(hoverUV.get(card), 0.22);
      lensA += ((lOn ? 1 : 0) - lensA) * 0.12;
      if (heroOn) { if (lensA > 0.01 && lm.vid) playOnly(hIdx); else playOnly(-1); }
      else if (cMix > 0.001 && m && m.vid && hero2 < 0) playOnly(mk); else playOnly(-1);
      const l3 = heroOn && lensA > 0.001 ? lm.ensure() : null;
      cu.uTex3.value = l3 || PHOTO[photoI]; cu.uA3.value = l3 ? l3.userData.aspect || 0.56 : 0.73; cu.uLens.value.set(lensUV.x, lensUV.y, 0.21); cu.uLensA.value = heroOn ? lensA : 0;
      hoverOn(card, t);
      const t2 = hero2 >= 0 ? PHOTO[hero2] : tex2;
      setU(card, { uTex: PHOTO[photoI], uTex2: t2 || PHOTO[photoI], uHas2: t2 ? 1 : 0, uA2: hero2 >= 0 ? 273 / 373 : tex2 ? tex2.userData.aspect || 0.56 : 0.73, uKB: hero2 < 0 && m && !m.vid ? 1 : 0, uCrop: hero2 < 0 && m && m.crop ? 0.17 : 0,
        uSize: [w, h], uRad: MOB ? 10 : 8, uZoom: mix(1, sq.zoom, from), uMir: 0, uAlpha: cA, uMix: cMix, uHeal: cHeal, uSplit: cSplit, uSplitA: cSplitA, uPulse: cPulse, uSat: cSat, uTime: t, uBend: bend, uWave: 0, uDim: 0 });
      cu.uPain.value.copy(painUV); cu.uUVc.value.set(mix(0.5, sq.uvc.x, from), mix(0.5, sq.uvc.y, from));
    } else playOnly(-1);
    if (tr && cOn) {
      // the current card swings away into depth; the next swings in from the other side (direction follows the move)
      const e = ease(trK), dir = tr.dir, off = W * (MOB ? 0.55 : 0.36), bw = Math.sin(Math.PI * e) * 34;
      card.position.set(CX - dir * e * off, CY, -e * 560); E.set(-smy * 0.14, smx * 0.2 + dir * e * 0.85, dir * e * 0.04); card.quaternion.setFromEuler(E);
      cu.uAlpha.value = cA * (1 - e); cu.uBend.value = bw;
      card2.visible = true; card2.scale.set(CW, CH, 1);
      card2.position.set(CX + dir * (1 - e) * off, CY, -(1 - e) * 560); E.set(-smy * 0.14, smx * 0.2 - dir * (1 - e) * 0.85, -dir * (1 - e) * 0.04); card2.quaternion.setFromEuler(E);
      setU(card2, { uTex: PHOTO[PAIN[tr.to].i], uHas2: 0, uMix: 0, uHeal: 0, uSplitA: 0, uSize: [CW, CH], uRad: MOB ? 10 : 8, uAlpha: cA * Math.min(1, e * 1.4), uTime: t, uBend: bw, uSat: 0, uPulse: 0, uLensA: 0, uDim: 0, uZoom: 1, uMir: 0 });
      card2.material.uniforms.uPain.value.set(-9, -9); card2.material.uniforms.uUVc.value.set(0.5, 0.5);
    } else card2.visible = false;

    stack.forEach((m) => { m.visible = false; });

    // the margin note (hero: the pain and its treatment; chapters: pain, treatment, recovery), the numbered marker, before / after
    {
      const sx = W / 2 + CX, sy = H / 2 - CY + (heroOn ? (1 - cA) * 30 : 0), hv = heroOn ? cA * (1 - lock) : 0, curH = hTr >= 0 ? hNext : hIdx;
      const settle = hTr < 0 ? ease(clamp((t - hLast - 0.15) / 0.7)) : 0, ch = !heroOn && act >= 0;
      const chA = ch && card.visible ? ease(clamp(intro * 1.3)) : 0, nA = heroOn ? hv : chA;
      if (note) {
        note.classList.toggle('is-ch', ch);
        const key = heroOn ? 'h' + curH : ch ? 'c' + act : noteKey;
        if (key !== noteKey) {
          noteKey = key; const k = heroOn ? curH : act;
          noteN.textContent = '0' + (k + 1); noteT.textContent = TAGS[k + 1][0]; noteM.textContent = TAGS[k + 1][1]; if (stepM) stepM.textContent = TAGS[k + 1][1];
          if (!RM) g.fromTo([noteT, noteM], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out', overwrite: true });
        }
        const nx = MOB ? sx - CW / 2 : sx + CW / 2 + Math.max(30, W * 0.024), nw = MOB ? CW : Math.min(190, W - nx - 92);
        note.style.width = nw + 'px'; note.style.height = MOB ? 'auto' : CH + 'px'; note.style.opacity = nA.toFixed(3);
        note.style.transform = `translate3d(${nx.toFixed(1)}px,${(MOB ? sy + CH / 2 + 16 : sy - CH / 2).toFixed(1)}px,0)`;
        const want = hv > 0.01 && !MOB ? curH : -1;
        if (want !== pipOn) { pipOn = want; pipM.forEach((m2, i) => { const on = i === want; if (on && !m2.getAttribute('src')) m2.src = m2.dataset.src; m2.classList.toggle('is-on', on); if (m2.tagName === 'VIDEO') { if (on) { const pr = m2.play(); if (pr) pr.catch(() => {}); } else m2.pause(); } }); }
        if (ch) {
          const fs = [seg(c, 0.05, 0.28), seg(c, 0.28, 0.7), seg(c, 0.7, 0.88)], cs = c < 0.28 ? 0 : c < 0.7 ? 1 : 2;
          steps.forEach((li, k) => { li.classList.toggle('is-on', k === cs); li.classList.toggle('is-done', k < cs); li.style.setProperty('--f', fs[k].toFixed(3)); });
          if (stepsOl) stepsOl.style.setProperty('--p', (0.5 * seg(c, 0.26, 0.34) + 0.5 * seg(c, 0.68, 0.76)).toFixed(3));
        }
      }
      if (prg) {
        const bv = ease(clamp(intro * 1.3)); prg.style.width = CW + 'px'; prg.style.opacity = bv.toFixed(3); prg.classList.toggle('is-live', bv > 0.5);
        prg.style.transform = `translate3d(${(sx - CW / 2).toFixed(1)}px,${(sy + CH / 2 + (MOB ? 20 : 26)).toFixed(1)}px,0)`;
        prgB.forEach((b, k) => { b.classList.toggle('is-on', k === act); b.style.setProperty('--f', k === act ? c.toFixed(3) : k < act ? 1 : 0); });
      }
      if (pin) {
        let pv = 0, num = 0, calm = false;
        if (heroOn) { pv = hv * settle; num = hIdx; }
        else if (ch && card.visible) { pv = seg(c, 0.12, 0.2) * (1 - seg(c, 0.26, 0.31)) + seg(c, 0.85, 0.87) * (1 - seg(c, 0.88, 0.9)); num = act; calm = c > 0.8; }
        if (pv > 0.001) {
          const uvp = heroOn ? PAIN[hIdx].uv : painUV; V3.set(uvp.x - 0.5, uvp.y - 0.5, 0); card.updateMatrixWorld(); V3.applyMatrix4(card.matrixWorld).project(camera);
          pin.style.transform = `translate3d(${((V3.x * 0.5 + 0.5) * W).toFixed(1)}px,${((-V3.y * 0.5 + 0.5) * H).toFixed(1)}px,0)`;
          const nt = '0' + (num + 1); if (pinB.textContent !== nt) pinB.textContent = nt; pin.classList.toggle('is-calm', calm);
        }
        pin.style.opacity = pv.toFixed(3);
      }
      if (arwP && arwN) {
        const aw = arwP.offsetWidth || 44, ay = sy - aw / 2, ao = ease(clamp(intro * 1.3)).toFixed(3), eg = MOB ? 8 : Math.max(12, W * 0.008);
        arwP.style.transform = `translate3d(${eg.toFixed(1)}px,${ay.toFixed(1)}px,0)`; arwN.style.transform = `translate3d(${(W - eg - aw).toFixed(1)}px,${ay.toFixed(1)}px,0)`;
        arwP.style.opacity = ao; arwN.style.opacity = ao;
      }
      if (ba) { ba.style.opacity = cSplitA.toFixed(3); ba.style.width = (CW - 32) + 'px'; ba.style.transform = `translate3d(${(sx - CW / 2 + 16).toFixed(1)}px,${(sy - CH / 2 + 16).toFixed(1)}px,0)`; }
      if (tag) tag.style.opacity = 0;
    }

    /* captions + the label at the pain */
    const capEl = $('.h3-cap'), capT = capEl && $('span', capEl);
    if (capEl) {
      const ca = heroOn ? 0 : endOn ? 0 : cOn && card.visible ? clamp((cMix - 0.6) / 0.4) : 0;
      const ct = heroOn ? `0${(hTr >= 0 ? hNext : hIdx) + 1} / 04 · ${HERO[hTr >= 0 ? hNext : hIdx]}` : mk >= 0 ? media[mk].cap : '';
      if (ca > 0 && capT.textContent !== ct) capT.textContent = ct;
      capEl.style.opacity = ca.toFixed(3);
      capEl.style.transform = `translate3d(${(CX + W / 2).toFixed(1)}px,${(H / 2 - CY + CH / 2 + 18 + (1 - ca) * 8).toFixed(1)}px,0) translateX(-50%)`;
    }
    for (let k = 0; k < 24; k++) PU.uGrid.value[k].set(CX, CY, CW, CH);
    PU.uK.value = toLogo; PU.uA.value = clamp(toLogo * 12); PU.uTime.value = t; PU.uPx.value = (MOB ? 1.6 : 1.8) * DPR;
    PU.uLogo.value.set(CX, CY, LH); pts.visible = toLogo > 0.001;

    renderer.render(scene, camera);
  };

  /* ---------- drive ---------- */
  // the hero is one screen: copy stays on the first chapter, the card plays the story on its own
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
