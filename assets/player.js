(() => {
  const N = 20;
  const id = (i) => 'S' + String(i + 1).padStart(2, '0');
  const src = (i) => `videos/${id(i)}.mp4`;
  const $ = (s) => document.querySelector(s);
  const vids = [$('#v0'), $('#v1')];
  const music = $('#music');
  let front = 0, cur = -1, auto = false, token = 0, musicOn = true, sndOn = true, begun = false, autoT = null, idle = null;
  music.volume = 0.22;

  const once = (el, ev) => new Promise((r) => el.addEventListener(ev, r, {once: true}));
  const active = () => vids[front];

  async function show(i, end = false) {
    i = Math.max(0, Math.min(N - 1, i));
    const my = ++token;
    clearTimeout(autoT);
    const nv = vids[1 - front], ov = vids[front];
    nv.pause();
    nv.muted = !sndOn;
    nv.src = src(i);
    nv.load();
    await once(nv, 'loadedmetadata');
    if (my !== token) return;
    if (end) {
      nv.currentTime = Math.max(0, nv.duration - 0.04);
      await once(nv, 'seeked');
    } else {
      nv.currentTime = 0;
      try { await nv.play(); } catch (e) {}
    }
    if (my !== token) return;
    nv.classList.add('front');
    ov.classList.remove('front');
    front = 1 - front;
    setTimeout(() => { if (ov !== active()) ov.pause(); }, 700);
    cur = i;
    $('#cur').textContent = String(i + 1).padStart(2, '0');
    document.querySelectorAll('.th').forEach((t, k) => t.classList.toggle('cur', k === i));
    history.replaceState(null, '', '#' + (i + 1));
    sync();
    nv.onended = () => {
      sync();
      if (auto && cur < N - 1) { clearTimeout(autoT); autoT = setTimeout(() => cur === i && next(), 1800); }
    };
  }

  function next() {
    if (cur < N - 1) show(cur + 1);
  }
  const prev = () => { if (cur > 0) show(cur - 1); };
  const replay = () => { const v = active(); v.currentTime = 0; v.play(); sync(); };
  function togglePlay() {
    const v = active();
    if (v.ended || v.currentTime >= v.duration - 0.05) return replay();
    v.paused ? v.play() : v.pause();
    sync();
  }
  function sync() {
    const v = active();
    $('#icPause').style.display = v.paused ? 'none' : '';
    $('#icPlay').style.display = v.paused ? '' : 'none';
  }
  (function loop() {
    const v = active();
    if (v && v.duration) {
      const p = v.currentTime / v.duration;
      $('#scrubFill').style.height = p * 100 + '%';
      if (document.activeElement !== $('#scrubIn')) $('#scrubIn').value = Math.round(p * 1000);
    }
    requestAnimationFrame(loop);
  })();
  $('#scrubIn').addEventListener('input', (e) => {
    const v = active();
    if (v.duration) { v.pause(); v.currentTime = (e.target.value / 1000) * v.duration; sync(); }
  });
  $('#scrubIn').addEventListener('change', () => $('#scrubIn').blur());

  function setMusic(on) {
    musicOn = on;
    $('#bMusic').classList.toggle('off', !on);
    on ? music.play().catch(() => {}) : music.pause();
  }
  function setSnd(on) {
    sndOn = on;
    vids.forEach((v) => (v.muted = !on));
    $('#bSnd').classList.toggle('off', !on);
  }
  function setAuto(on) {
    auto = on;
    $('#bAuto').classList.toggle('on', on);
    clearTimeout(autoT);
    const v = active();
    if (on && v.ended) autoT = setTimeout(() => next(), 1200);
  }
  const fs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  const ov = (v) => $('#ov').classList.toggle('show', v === undefined ? !$('#ov').classList.contains('show') : v);

  /* overview */
  $('#ovg').innerHTML = Array.from({length: N}, (_, i) => `<div class="th" data-i="${i}"><img loading="lazy" src="videos/thumbs/${id(i)}.jpg" alt=""><b>${String(i + 1).padStart(2, '0')}</b></div>`).join('');
  $('#ovg').addEventListener('click', (e) => { const t = e.target.closest('.th'); if (t) { ov(false); show(+t.dataset.i); } });
  $('#ov').addEventListener('click', (e) => { if (e.target.id === 'ov') ov(false); });

  /* start */
  function begin() {
    if (begun) return;
    begun = true;
    $('#start').classList.add('gone');
    setMusic(true);
    const h = parseInt(location.hash.slice(1));
    show(h >= 1 && h <= N ? h - 1 : 0);
  }
  $('#go').addEventListener('click', begin);

  /* input */
  addEventListener('keydown', (e) => {
    if (!begun) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(); } return; }
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(N - 1, true);
    else if (k === 'f' || k === 'F') fs();
    else if (k === 'm' || k === 'M') { setMusic(!musicOn); }
    else if (k === 's' || k === 'S') setSnd(!sndOn);
    else if (k === 'p' || k === 'P') togglePlay();
    else if (k === 'a' || k === 'A') setAuto(!auto);
    else if (k === 'r' || k === 'R') replay();
    else if (k === 'o' || k === 'O' || k === 'Tab') { e.preventDefault(); ov(); }
    else if (k === 'Escape') ov(false);
  });
  $('#zoneR').addEventListener('click', () => begun && next());
  $('#zoneL').addEventListener('click', () => begun && prev());
  addEventListener('wheel', (e) => {
    if (!begun || $('#ov').classList.contains('show')) return;
    const t = Date.now();
    if (t - (addEventListener._w || 0) < 900 || Math.abs(e.deltaY) < 20) return;
    addEventListener._w = t;
    e.deltaY > 0 ? next() : prev();
  }, {passive: true});
  let tx = 0, ty = 0;
  addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive: true});
  addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  }, {passive: true});

  $('#bPrev').onclick = prev; $('#bNext').onclick = () => next(); $('#bPlay').onclick = togglePlay;
  $('#bAuto').onclick = () => setAuto(!auto); $('#bMusic').onclick = () => setMusic(!musicOn); $('#bSnd').onclick = () => setSnd(!sndOn);
  $('#bOv').onclick = () => ov(); $('#bFs').onclick = fs;
  addEventListener('hashchange', () => { const h = parseInt(location.hash.slice(1)); if (begun && h >= 1 && h <= N && h - 1 !== cur) show(h - 1); });

  function wake() {
    $('#bar').classList.remove('hide');
    document.body.classList.remove('nocursor');
    clearTimeout(idle);
    idle = setTimeout(() => {
      if (begun && !$('#ov').classList.contains('show')) { document.body.classList.add('nocursor'); }
    }, 2800);
  }
  addEventListener('mousemove', wake); addEventListener('keydown', wake); addEventListener('click', wake);
})();
