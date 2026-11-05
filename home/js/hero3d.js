/* AROGYATI — 3D hero (alternate version at /home/3d/). three.js r170, vendored. */
import * as THREE from '/home/vendor/three/three.module.min.js';
import { GLTFLoader } from '/home/vendor/three/GLTFLoader.js';
import { MeshoptDecoder } from '/home/vendor/three/meshopt_decoder.module.js';
import { RoomEnvironment } from '/home/vendor/three/RoomEnvironment.js';

const d = document, h = d.documentElement;
const box = d.querySelector('.hx3d'), hx = d.querySelector('.hx');
const LITE = h.classList.contains('az-lite'), RM = h.classList.contains('az-rm');
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const fail = () => h.classList.add('az-3d-fail');

if (box && hx) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { fail(); }
  if (renderer) init(renderer);
}

function init(renderer) {
  const DPR = Math.min(devicePixelRatio || 1, LITE ? 1.25 : 2);
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !LITE;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;

  /* lighting: soft sky fill + warm key with soft shadow + cool rim */
  scene.add(new THREE.HemisphereLight(0xe8f1ff, 0xd9cdb8, 0.55));
  const key = new THREE.DirectionalLight(0xfff3e2, 2.3);
  key.position.set(2.2, 3.4, 2.6);
  key.castShadow = !LITE;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 12;
  Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 1.8, bottom: -1.6 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd8ff, 1.6); rim.position.set(-2.8, 2.2, -2.4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45); fill.position.set(-2, 0.6, 3); scene.add(fill);

  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 60);
  const rig = new THREE.Group(); scene.add(rig);           // scroll + intro rotation
  const tilt = new THREE.Group(); rig.add(tilt);          // mouse parallax

  /* contact shadow ground */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; rig.add(ground);
  
  let model = null, H = 1.9, ready = false;
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(LITE ? '/home/assets/3d/model-lite.glb' : '/home/assets/3d/model.glb', (g) => {
    model = g.scene;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = !LITE; o.receiveShadow = false;
      const m = o.material;
      ['map', 'normalMap', 'roughnessMap', 'metalnessMap'].forEach((k) => { if (m[k]) { m[k].anisotropy = maxAniso; m[k].needsUpdate = true; } });
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      m.envMapIntensity = 0.9;
      if (m.metalness !== undefined) m.metalness = Math.min(m.metalness, 0.15);
      if (m.roughness !== undefined) m.roughness = Math.max(m.roughness, 0.42);
      if (m.normalScale) m.normalScale.set(1.15, 1.15);
    });
    const b = new THREE.Box3().setFromObject(model), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
    model.position.set(-c.x, -b.min.y, -c.z); H = s.y;
    tilt.add(model);
    ready = true; fit(); h.classList.add('az-3d-ready'); intro();
  }, undefined, () => fail());

  /* framing: whole figures visible, feet near the bottom, never zoomed in */
  let W = 1, Hh = 1;
  const fit = () => {
    const ct = d.querySelector('.hx__ctas'), cp = d.querySelector('.hx__copy');
    if (ct && cp) box.style.top = Math.round(cp.offsetTop + ct.offsetTop + ct.offsetHeight + 14) + 'px';
    const r = box.getBoundingClientRect(); W = Math.max(1, r.width); Hh = Math.max(1, r.height);
    renderer.setSize(W, Hh, false); renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = Hh + 'px';
    cam.aspect = W / Hh;
    const pad = 1.14, vfov = THREE.MathUtils.degToRad(cam.fov);
    const distH = (H * pad) / 2 / Math.tan(vfov / 2);
    const distW = (H * 0.62 * pad) / 2 / (Math.tan(vfov / 2) * cam.aspect);
    base.dist = Math.max(distH, distW);
    cam.updateProjectionMatrix(); dirty = true;
  };

  /* state driven by intro, scroll and pointer */
  const base = { dist: 6 };
  const st = { yaw: 0.55, lift: -0.25, op: 0, sp: 0, mx: 0, my: 0, tmx: 0, tmy: 0, t: 0 };
  let dirty = true;
  const intro = () => {
    if (RM || !window.gsap) { st.yaw = 0; st.lift = 0; st.op = 1; dirty = true; return; }
    gsap.to(st, { yaw: 0, lift: 0, op: 1, duration: 2.4, ease: 'expo.out', delay: 0.35, onUpdate: () => { dirty = true; } });
  };
  if (window.gsap && window.ScrollTrigger) {
    ScrollTrigger.create({ trigger: hx, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => { st.sp = s.progress; dirty = true; } });
  } else {
    addEventListener('scroll', () => { st.sp = Math.min(1, scrollY / hx.offsetHeight); dirty = true; }, { passive: true });
  }
  if (FINE && !LITE) {
    hx.addEventListener('mousemove', (e) => { st.tmx = e.clientX / innerWidth - 0.5; st.tmy = e.clientY / innerHeight - 0.5; });
    hx.addEventListener('mouseleave', () => { st.tmx = 0; st.tmy = 0; });
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(hx);
  let fq = 0; const qfit = () => { cancelAnimationFrame(fq); fq = requestAnimationFrame(fit); };
  addEventListener('resize', qfit); new ResizeObserver(qfit).observe(box);

  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible || !ready) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    st.t += dt;
    const ease = 1 - Math.pow(0.001, dt);                 // frame-rate independent smoothing
    st.mx += (st.tmx - st.mx) * ease * 0.9; st.my += (st.tmy - st.my) * ease * 0.9;
    const idle = !RM && !LITE;
    const moving = Math.abs(st.tmx - st.mx) + Math.abs(st.tmy - st.my) > 0.0005;
    if (!dirty && !moving && !idle) return;

    /* scroll: turn the pair to reveal a three-quarter view, step back, drift up and fade */
    const sp = st.sp, sq = Math.min(1, sp / 0.45), se = sq * sq * (3 - 2 * sq);
    rig.rotation.y = st.yaw + se * 1.1 + (idle ? Math.sin(st.t * 0.35) * 0.09 : 0);
    rig.position.y = st.lift * H * 0.4;
    tilt.rotation.y = st.mx * 0.32; tilt.rotation.x = st.my * 0.05;
    const dist = base.dist * (1 + se * 0.18);
    cam.position.set(0, H * (0.55 + se * 0.12), dist);
    cam.lookAt(0, H * 0.47, 0);
    renderer.domElement.style.opacity = (st.op * (1 - Math.min(1, Math.max(0, (sp - 0.08) / 0.34)))).toFixed(3);
    renderer.render(scene, cam);
    dirty = false;
  };
  tick();
}
