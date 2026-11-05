/* AROGYATI 3D page — one continuous 3D object: the hero's nurse & patient ARE the model.
   Scroll glides them from the hero into a pinned chapter story, then they scroll away with the section. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';
import { MeshoptDecoder } from '/home/vendor/three/meshopt_decoder.module.js';
import { RoomEnvironment } from '/home/vendor/three/RoomEnvironment.js';

const d = document, h = d.documentElement, $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
const fx = $('.m3fx'), box = $('.m3fx__canvas'), sec = $('.m3'), stage = $('.m3__stage'), hx = $('.hx');
const LITE = h.classList.contains('az-lite'), RM = h.classList.contains('az-rm');
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const fail = () => h.classList.add('m3-fail');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), mix = (a, b, t) => a + (b - a) * t, ss = (t) => t * t * (3 - 2 * t);

const PTS = { center: [0, 0.95, 0], shoulder: [-0.12, 1.42, 0.08], knee: [-0.33, 0.72, 0.11], back: [-0.2, 1.05, -0.15], steth: [0.18, 1.42, 0.15] };
const K = [
  { yaw: 0, dist: 1, f: 'center', spot: null },
  { yaw: 0.45, dist: 0.5, f: 'shoulder', spot: 'shoulder' },
  { yaw: 0.8, dist: 0.58, f: 'knee', spot: 'knee' },
  { yaw: 2.95, dist: 0.6, f: 'back', spot: 'back' },
  { yaw: Math.PI * 2, dist: 0.9, f: 'center', spot: 'steth' },
];

if (fx && box && sec && hx) {
  let r = null;
  try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { fail(); }
  if (r) run(r);
}

function run(renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LITE ? 1.25 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;            // natural skin and fabric tones
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !LITE; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.75;
  scene.add(new THREE.HemisphereLight(0xf2f6ff, 0xcbbd9f, 0.7));        // sky / warm floor bounce
  const key = new THREE.DirectionalLight(0xfff0dc, 2.6); key.position.set(2.4, 3.8, 3); key.castShadow = !LITE;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 2.1, bottom: -1.6, near: 0.5, far: 12 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.025; key.shadow.radius = 8; scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe2ff, 2.0); rim.position.set(-3.2, 2.6, -2.8); scene.add(rim);
  const kick = new THREE.DirectionalLight(0xffe9d6, 0.9); kick.position.set(3.2, 1.4, -2.2); scene.add(kick);
  const fill = new THREE.DirectionalLight(0xffffff, 0.55); fill.position.set(-2.4, 1, 3.2); scene.add(fill);

  const rig = new THREE.Group(); scene.add(rig);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.14 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; rig.add(ground);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 60);

  const intro = { v: 0 };
  let H = 1.9, ready = false;
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(LITE ? '/home/assets/3d/model-lite.glb' : '/home/assets/3d/model-hq.glb', (g) => {
    const m = g.scene, aniso = renderer.capabilities.getMaxAnisotropy();
    m.traverse((o) => {
      if (!o.isMesh) return; o.castShadow = !LITE;
      const s = o.material;
      /* physical material: soft fabric sheen, low specular so skin and cotton read matte and human, not plastic */
      const p = new THREE.MeshPhysicalMaterial({
        map: s.map, normalMap: s.normalMap, roughnessMap: s.roughnessMap, metalnessMap: s.metalnessMap,
        metalness: 0, roughness: 0.95, normalScale: new THREE.Vector2(1.2, 1.2),
        sheen: LITE ? 0 : 0.35, sheenRoughness: 0.85, sheenColor: new THREE.Color(0xffffff),
        specularIntensity: 0.35, side: THREE.DoubleSide,
      });
      [p.map, p.normalMap, p.roughnessMap].forEach((t) => { if (t) t.anisotropy = aniso; });
      if (p.map) p.map.colorSpace = THREE.SRGBColorSpace;
      o.material = p;
    });
    const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -b.min.y, -c.z); H = b.getSize(new THREE.Vector3()).y;
    rig.add(m); ready = true; h.classList.add('m3-ready'); fit();
    if (window.gsap && !RM) gsap.fromTo(intro, { v: 0 }, { v: 1, duration: 2.2, ease: 'expo.out', delay: 0.2 }); else intro.v = 1;
  }, undefined, fail);

  /* layout metrics */
  let W = 1, Hh = 1, mobile = false, base = 6, heroTop = 0, heroR = 1, secTop = 1;
  const fit = () => {
    W = innerWidth; Hh = innerHeight; mobile = W < 900;
    renderer.setSize(W, Hh, false); renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = Hh + 'px';
    cam.aspect = W / Hh;
    const v = THREE.MathUtils.degToRad(cam.fov);
    base = Math.max((H * 1.12) / 2 / Math.tan(v / 2), (H * 0.62) / 2 / (Math.tan(v / 2) * cam.aspect)) * (mobile ? 1.4 : 1);
    const ct = $('.hx__ctas'), cp = $('.hx__copy');
    heroTop = cp && ct ? cp.offsetTop + ct.offsetTop + ct.offsetHeight + 14 : Hh * 0.45;
    heroR = Math.max(200, Hh - heroTop);
    secTop = sec.getBoundingClientRect().top + scrollY;
  };
  let fq = 0; const qfit = () => { cancelAnimationFrame(fq); fq = requestAnimationFrame(fit); };
  addEventListener('resize', qfit);

  /* chapter UI */
  const chs = $$('.m3-ch'), tabs = $$('.m3-tab'), dial = $('.m3-dial__ring'), dialN = $('[data-m3-n]'), spot = $('.m3fx__spot'), chip = $('.m3fx__chip'), line = $('.m3fx__line path'), tints = $$('.m3fx__bg i');
  const CHIP = ['', 'Hands-on support', 'Knee &amp; cane', 'Lower back', 'Our team'];
  let curCh = -1;
  const setCh = (k) => {
    if (k === curCh) return; curCh = k;
    chs.forEach((c, i) => c.classList.toggle('is-on', i === k));
    tabs.forEach((t, i) => t.classList.toggle('is-on', i + 1 === k));
    tints.forEach((t, i) => { if (i > 0) t.classList.toggle('is-on', i === k); });
    if (dialN) dialN.textContent = String(Math.max(1, k)).padStart(2, '0');
    if (chip) chip.innerHTML = CHIP[k] || '';
  };
  let pin = null, prog = 0;
  if (window.ScrollTrigger) {
    pin = ScrollTrigger.create({ trigger: sec, start: 'top top', end: () => '+=' + Math.round(innerHeight * (K.length - 1) * 1.1), pin: stage, scrub: true, invalidateOnRefresh: true, onRefresh: () => fit(), onUpdate: (s) => { prog = s.progress; } });
    ScrollTrigger.sort(); ScrollTrigger.refresh();
    addEventListener('load', () => ScrollTrigger.refresh());
    tabs.forEach((t, i) => t.addEventListener('click', () => {
      const y = pin.start + (pin.end - pin.start) * ((i + 1) / (K.length - 1));
      scrollTo({ top: y, behavior: 'smooth' });
    }));
  }
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  if (FINE && !LITE) addEventListener('mousemove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });

  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]), tmp = new THREE.Vector3(), clock = new THREE.Clock();
  let smooth = 0, tS = 0;
  const N = K.length;
  const kf = (p) => { const t = p * (N - 1), i = Math.min(N - 2, Math.floor(t)), f = t - i, hold = 0.28; return { i, u: ss(clamp((f - hold) / (1 - 2 * hold))) }; };

  const tick = () => {
    requestAnimationFrame(tick);
    if (!ready) return;
    const y = scrollY, after = pin ? Math.max(0, y - pin.end) : 0;
    if (after > Hh * 1.05) { fx.style.visibility = 'hidden'; return; }
    fx.style.visibility = ''; fx.style.transform = after ? `translate3d(0,${-after}px,0)` : '';
    const dt = Math.min(clock.getDelta(), 0.05), e = RM ? 1 : 1 - Math.pow(0.0006, dt);
    const tRaw = clamp(y / Math.max(1, secTop)); tS += (tRaw - tS) * e; smooth += (prog - smooth) * e;
    mx += (tmx - mx) * e * 0.5; my += (tmy - my) * e * 0.5;
    const t = ss(tS);
    if (tints[0]) tints[0].style.opacity = t.toFixed(3);
    h.classList.toggle('m3-scene', t > 0.9);

    /* hero framing → chapter framing */
    const { i, u } = kf(smooth), A = K[i], B = K[i + 1];
    setCh(t < 0.98 ? 0 : (u < 0.5 ? i : i + 1));
    rig.rotation.y = mix(-0.12, A.yaw + (B.yaw - A.yaw) * u, t) + mx * 0.22 + (RM ? 0 : Math.sin(clock.elapsedTime * 0.4) * 0.025) + (1 - intro.v) * 0.6;
    rig.updateMatrixWorld();
    const T = V(PTS[A.f]).lerp(V(PTS[B.f]), u).applyMatrix4(rig.matrixWorld);
    const heroDist = ((H * 1.04) / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)) * (Hh / heroR);
    const dist = mix(heroDist, base * (A.dist + (B.dist - A.dist) * u), t);
    const hy0 = -((heroTop + heroR / 2) - Hh / 2);
    /* while the hero scrolls, the figures ride up with it (offset follows scroll) until the section takes over */
    cam.setViewOffset(W, Hh, mix(0, mobile ? 0 : -W * 0.17, t), mix(hy0 + y, mobile ? Hh * 0.2 : 0, t), W, Hh);
    const look = new THREE.Vector3(T.x * t, mix(H * 0.5, T.y, t), T.z * t);
    cam.position.set(look.x, look.y + H * 0.04 + my * 0.06, look.z + dist); cam.lookAt(look);
    renderer.domElement.style.opacity = intro.v.toFixed(3);
    renderer.render(scene, cam);

    /* hotspot + callout chip + connector to the chapter title */
    const sk = t >= 0.98 ? (u < 0.5 ? A.spot : B.spot) : null, fade = 1 - Math.min(1, Math.abs(u - (u < 0.5 ? 0 : 1)) * 4);
    if (sk && spot) {
      tmp.copy(V(PTS[sk])).applyMatrix4(rig.matrixWorld).project(cam);
      const x = (tmp.x * 0.5 + 0.5) * W, yy = (-tmp.y * 0.5 + 0.5) * Hh;
      spot.style.transform = `translate(${x.toFixed(1)}px,${yy.toFixed(1)}px)`; spot.style.opacity = fade.toFixed(3);
      const ttl = $('.m3-ch.is-on .m3-ch__t');
      if (ttl && line && !mobile) {
        const rr = ttl.getBoundingClientRect(), x2 = rr.right + 18, y2 = rr.top + rr.height / 2, mxp = (x + x2) / 2;
        line.setAttribute('d', `M${x2} ${y2} C ${mxp} ${y2}, ${mxp} ${yy}, ${x - 12} ${yy}`); line.style.opacity = (fade * 0.7).toFixed(3);
      } else if (line) line.style.opacity = 0;
    } else { if (spot) spot.style.opacity = 0; if (line) line.style.opacity = 0; }
    if (dial) dial.style.strokeDashoffset = (100 - smooth * 100).toFixed(2);
  };
  tick();
}
