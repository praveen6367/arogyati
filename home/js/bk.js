/* AROGYATI — book an appointment. A self-contained date and time picker that stands in until Calendly is connected.
   Clinic hours: Monday to Saturday, 10 am – 2 pm and 4 pm – 7 pm; Sunday closed. Nothing is sent anywhere:
   the last step offers to send the chosen slot to the clinic on WhatsApp, or to call. */
(() => {
  const d = document, card = d.querySelector('.bk-card'); if (!card) return;
  const $ = (s, r = card) => r.querySelector(s), $$ = (s, r = card) => [...r.querySelectorAll(s)];
  const g = window.gsap, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const monthEl = $('.bk-cal__month'), daysEl = $('.bk-cal__days'), prevB = $('.bk-cal__nav--prev'), nextB = $('.bk-cal__nav--next');
  const tDate = $('.bk-times__date'), lists = { am: $('[data-slots="am"]'), pm: $('[data-slots="pm"]') };
  const form = $('.bk-pane--form'), when = $('.bk-back__when'), err = $('.bk-err'), doneW = $('.bk-done__w'), wa = $('.bk-wa');
  const steps = $$('.bk-card__steps span');
  const SLOTS = { am: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'], pm: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'] };
  const AHEAD = 2; // months bookable beyond the current one
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  let view = new Date(first), date = null, time = null;
  const fmtDay = (x) => x.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtT = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
  const same = (a, b) => a && b && a.getTime() === b.getTime();

  const setStep = (n) => {
    card.dataset.step = String(n);
    steps.forEach((s, i) => { s.classList.toggle('is-on', i < n); s.classList.toggle('is-now', i === n - 1); });
  };

  const renderCal = () => {
    monthEl.textContent = view.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const y = view.getFullYear(), m = view.getMonth(), lead = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
    const frag = d.createDocumentFragment();
    for (let i = 0; i < lead; i++) frag.appendChild(d.createElement('span'));
    for (let k = 1; k <= n; k++) {
      const dt = new Date(y, m, k), b = d.createElement('button');
      b.type = 'button'; b.className = 'bk-day'; b.textContent = k; b.setAttribute('aria-label', fmtDay(dt));
      const off = dt < today || dt.getDay() === 0;
      if (off) { b.disabled = true; if (dt.getDay() === 0) b.title = 'Sunday closed'; }
      if (same(dt, today)) b.classList.add('is-today');
      if (same(dt, date)) { b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); }
      b.addEventListener('click', () => pickDate(dt));
      frag.appendChild(b);
    }
    daysEl.replaceChildren(frag);
    prevB.disabled = view <= first;
    nextB.disabled = view >= new Date(first.getFullYear(), first.getMonth() + AHEAD, 1);
  };
  const shift = (dir) => {
    view = new Date(view.getFullYear(), view.getMonth() + dir, 1); renderCal();
    if (g && !RM) g.fromTo(daysEl, { opacity: 0, x: 14 * dir }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' });
  };
  prevB.addEventListener('click', () => shift(-1));
  nextB.addEventListener('click', () => shift(1));

  const renderTimes = () => {
    const now = new Date(), isToday = same(date, today);
    let any = false;
    Object.entries(SLOTS).forEach(([k, arr]) => {
      const frag = d.createDocumentFragment();
      arr.forEach((t) => {
        const [h, mm] = t.split(':').map(Number), b = d.createElement('button');
        b.type = 'button'; b.className = 'bk-slot'; b.textContent = fmtT(t);
        const past = isToday && (h * 60 + mm) < now.getHours() * 60 + now.getMinutes() + 60;
        if (past) b.disabled = true; else any = true;
        if (time === t) b.classList.add('is-on');
        b.addEventListener('click', () => pickTime(t));
        frag.appendChild(b);
      });
      lists[k].replaceChildren(frag);
    });
    card.classList.toggle('has-none', !any);
    if (g && !RM) g.fromTo($$('.bk-slot'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.025, ease: 'expo.out' });
  };

  const pickDate = (dt) => {
    date = dt; time = null; renderCal();
    tDate.textContent = fmtDay(dt); card.classList.add('has-date');
    renderTimes(); setStep(2);
  };
  const pickTime = (t) => {
    time = t; renderTimes();
    when.textContent = `${fmtDay(date)} · ${fmtT(t)}`;
    setStep(3); err.textContent = '';
    setTimeout(() => { const f = form.querySelector('input'); if (f && matchMedia('(hover: hover)').matches) f.focus({ preventScroll: true }); }, 450);
  };
  $('.bk-back').addEventListener('click', () => setStep(2));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim(), phone = form.phone.value.replace(/[^\d+]/g, ''), note = form.note.value.trim();
    if (name.length < 2) { err.textContent = 'Please add your name.'; form.name.focus(); return; }
    if (phone.replace(/\D/g, '').length < 10) { err.textContent = 'Please add a 10 digit phone number.'; form.phone.focus(); return; }
    err.textContent = '';
    const w = `${fmtDay(date)} at ${fmtT(time)}`;
    doneW.textContent = `${name}, ${w}`;
    const msg = `Hello Arogyati, I would like to book an appointment on ${w}.\nName: ${name}\nPhone: ${phone}${note ? `\nConcern: ${note}` : ''}`;
    wa.href = `https://wa.me/919420294219?text=${encodeURIComponent(msg)}`;
    setStep(4);
  });
  $('.bk-again').addEventListener('click', () => { time = null; renderTimes(); setStep(2); });

  renderCal(); setStep(1);
  // reveal
  if (g && window.ScrollTrigger && !RM) {
    const sec = d.querySelector('.bk');
    g.from(sec.querySelectorAll('.bk__h2, .bk__sub, .bk__facts li'), { y: 28, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 72%', once: true } });
    g.from(card, { y: 60, opacity: 0, scale: 0.97, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 72%', once: true } });
  }
})();
