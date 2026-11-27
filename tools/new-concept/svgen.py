# Services page: builds home/services/index.html from the saved original (services-src.html) plus new sections.
# Order: hero - our services (grid) - home visits - our approach - team - reels - schedule appointment - next page.
import io, re, os, json, html as _h
HERE = os.path.dirname(os.path.abspath(__file__))
R = HERE + '/../../home/'
src = io.open(HERE + '/services-src.html', encoding='utf8').read()
about = io.open(R + 'about/index.html', encoding='utf8').read()
hfinal = io.open(R + 'home-final/index.html', encoding='utf8').read()
sec = lambda h, cls: re.search(r'<section class="' + cls + r'"[^>]*>.*?</section>', h, re.S).group(0)
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>'
CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>'

# ---- our services: the seven services (copy from the original page), each with its branded image
SERV = [
  ('Physiotherapy At Home', 'For Hospitalized &amp; Bedridden Patients', 'home-visit', 'A physiotherapist supporting a patient at home'),
  ('Psychological Counselling', 'Address Emotional Well-Being', 'counselling', 'Hands held in support'),
  ('Dietitian Advice', 'Nutrition, part of a rehab approach', 'dietitian', 'A consultation at Arogyati'),
  ('Speech Therapy', 'Speech consultation', 'speech', 'An illustration of the brain'),
  ('Prosthesis &amp; Orthosis', 'Promote Independence', 'prosthesis', 'A therapist guiding a patient through arm movement'),
  ('Super Induction Therapy', 'Strong muscle contractions', 'sis', 'Super Inductive System treatment at Arogyati'),
  ('Cupping And Dry Needling Taping', 'Manage Pain', 'cupping', "A therapist treating a patient's arm"),
]
cards = ''.join(
  f'<a class="svx-card" href="#contact" data-svx-card><figure class="svx-card__ph"><img src="/home/assets/img/svc/{img}.webp" alt="{alt}" width="960" height="744" loading="lazy" decoding="async"></figure>'
  f'<div class="svx-card__body"><span class="svx-card__n">{k + 1:02d}</span><h3 class="svx-card__t">{t}</h3><p class="svx-card__l">{l}</p><span class="svx-card__go">Book this service{ARROW}</span></div></a>'
  for k, (t, l, img, alt) in enumerate(SERV))
cards += (f'<a class="svx-card svx-card--cta" href="#contact" data-svx-card><div class="svx-card__body"><h3 class="svx-card__t">Not sure where to start?</h3>'
          f'<p class="svx-card__l">Tell us what hurts. We will suggest the right care and book your first visit.</p><span class="svx-card__go">Schedule appointment{ARROW}</span></div></a>')
SVX = ('<section class="svx" id="services" aria-label="Our services"><div class="az-wrap">'
  '<div class="svx__head"><h2 class="svx__h2">Working like a <em>rehab center.</em></h2>'
  '<p class="svx__lede">Physiotherapy for hospitalised and bedridden patients at home, with speech therapy, nutrition, prosthesis &amp; orthosis and psychological counselling.</p></div>'
  f'<div class="svx__grid">{cards}</div></div></section>')

# ---- reels: short films from the clinic (placeholders until the patients' own testimonial reels arrive)
data = json.loads(re.search(r'id="hp3-data">(.*?)</script>', hfinal, re.S).group(1).replace('<\\/', '</'))
srcs = re.findall(r'<div class="hp3__vids">(.*?)</div>', hfinal, re.S)[0]
vids = re.findall(r'data-poster="([^"]+)" data-src="([^"]+)"', srcs)
seen, REELS = set(), []
for (po, sr), x in zip(vids, data):
    if sr in seen: continue
    seen.add(sr); REELS.append((po, sr, x['cb'], x['cs'], x['n']))
SPK = '<svg class="rlx-snd__off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg><svg class="rlx-snd__on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
reels = ''.join(
  f'<figure class="rlx-card" data-k="{k}"><video muted loop playsinline preload="none" poster="{po}" data-src="{sr}"></video>'
  f'<figcaption><span class="rlx-card__tag">{_h.escape(n)}</span><b>{_h.escape(cb)}</b><small>{_h.escape(cs)}</small></figcaption>'
  f'<button type="button" class="rlx-snd" aria-pressed="false" aria-label="Unmute {_h.escape(cb)}">{SPK}</button><i class="rlx-card__bar" aria-hidden="true"><b></b></i></figure>'
  for k, (po, sr, cb, cs, n) in enumerate(REELS))
RLX = ('<section class="rlx" id="reels" aria-label="Reels"><div class="az-wrap rlx__head">'
  '<h2 class="rlx__h2">Recovery, <em>in reels.</em></h2>'
  f'<div class="rlx__nav"><button type="button" class="rlx__arw rlx__arw--prev" aria-label="Previous reel">{CHEV}</button><button type="button" class="rlx__arw rlx__arw--next" aria-label="Next reel">{CHEV}</button></div></div>'
  f'<div class="rlx__track" tabindex="0" aria-label="Reels, scroll sideways">{reels}</div></section>')

TEAM = sec(about, 'tx abt')
BK = sec(hfinal, 'bk')
PH, HV, AP, PN = sec(src, 'ph'), sec(src, 'hv'), sec(src, 'ap'), sec(src, 'pn')
PH = PH.replace('href="/home/contact/"', 'href="#contact"')
PH = PH.replace('Our Services, <em>for faster recovery of patients.</em>', 'Our services, for faster <em>recovery of patients.</em>').replace('Physiotherapy Services For Hospitalized &amp; Bedridden Patients At Home — with Speech Therapy, Nutritionist, Prosthesis &amp; Orthosis and Psychological Counselling.', 'Physiotherapy for hospitalised and bedridden patients at home, with speech therapy, a nutritionist, prosthesis &amp; orthosis and psychological counselling.')
assert 'recovery of patients.</em>' in PH
MAIN = '\n'.join([PH, SVX, HV, AP, TEAM, RLX, BK, PN])

h = src
a = h.index('<main id="main" class="pg pg--services">'); a = h.index('>', a) + 1; b = h.index('</main>', a)
h = h[:a] + '\n' + MAIN + '\n' + h[b:]
h = re.sub(r'<link rel="stylesheet" href="/home/css/pages\.css\?v=\d+">', lambda m: m.group(0) + '\n<link rel="stylesheet" href="/home/css/hf.css?v=34">\n<link rel="stylesheet" href="/home/css/about.css?v=3">\n<link rel="stylesheet" href="/home/css/services.css?v=6">', h, count=1)
h = re.sub(r'/home/js/home\.js\?v=\d+', '/home/js/home.js?v=84', h)
h = re.sub(r'(<script src="/home/js/pages\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/bk.js?v=1" defer></script>\n<script src="/home/js/svx.js?v=2" defer></script>', h, count=1)
assert 'class="svx"' in h and 'class="rlx"' in h and 'class="bk"' in h and 'tx abt' in h and 'az-foot' in h
io.open(R + 'services/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h), 'reels', len(REELS))
