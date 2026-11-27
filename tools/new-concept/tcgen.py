# Technology page: builds home/technology/index.html from the saved original (technology-src.html) plus new sections.
# Order: hero - our machines - the phone section (from the homepage) - testimonials - schedule appointment - next page.
import io, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
R = HERE + '/../../home/'
src = io.open(HERE + '/technology-src.html', encoding='utf8').read()
about = io.open(HERE + '/about-src.html', encoding='utf8').read()
hfinal = io.open(R + 'home-final/index.html', encoding='utf8').read()
sec = lambda h, cls: re.search(r'<section class="' + cls + r'"[^>]*>.*?</section>', h, re.S).group(0)
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>'

# ---- our machines (copy from the original Technology page). Photos: stills from the clinic's own machine films, until photographs arrive.
MACH = [
  ('Matrix Rhythm Therapy', '8–12', 'Hz resonance', 'A specially developed resonator produces vibration between 8 &amp; 12 Hz, equal &amp; similar to the normal cells in human body.', 'Our cells oscillate rhythmically.', '2009', 'tech-mrt'),
  ('Magnetodyn', '2–20', 'Hz magnetic field', 'Unique feature is the combination of magnetic therapy &amp; electrotherapy.', '100 times stronger than Earth’s magnetic field, which improves the cellular metabolism.', '2016', 'tech-magneto'),
  ('Class IV Laser', 'Class IV', 'Laser', 'Non-invasive use of laser energy to generate a photochemical response in damaged/dysfunctional tissue.', 'Penetrates deep into the tissue &amp; stimulates healing at a cellular level.', '2019', 'tech-laser'),
  ('Super Inductive System', '0.85', 'Tesla intensity', 'It gives the effect of a strong pulsed electromagnetic field in human tissue.', 'Triggers strong muscle contractions &amp; contributes to pain management.', '2024', 'tech-sis'),
]
cards = ''.join(
  f'<article class="mch" data-mch><figure class="mch__ph"><img src="/home/assets/video/{img}.jpg" alt="{n} at Arogyati" width="600" height="1066" loading="lazy" decoding="async"><figcaption>Since {y}</figcaption></figure>'
  f'<div class="mch__body"><p class="mch__n">{k + 1:02d}</p><h3 class="mch__t">{n}</h3><p class="mch__stat"><b>{v}</b><span>{u}</span></p>'
  f'<p class="mch__d">{d}</p><p class="mch__d2">{d2}</p><a class="mch__go" href="#contact">Book a session{ARROW}</a></div></article>'
  for k, (n, v, u, d, d2, y, img) in enumerate(MACH))
MCH = ('<section class="mchs" id="machines" aria-label="Our machines"><div class="az-wrap">'
  '<div class="mchs__head"><h2 class="mchs__h2">German technologies, <em>first in Kolhapur.</em></h2>'
  '<p class="mchs__lede">Additional facilities at Arogyati, several launched for the first time in India and Kolhapur.</p></div>'
  f'<div class="mchs__grid">{cards}</div>'
  '<p class="mchs__note"><b>2007</b><span>Mentamove, the first advanced modality at Arogyati.</span></p>'
  '</div></section>')

PH, TC, PN = sec(src, 'ph'), sec(src, 'tc'), sec(src, 'pn')
PH = PH.replace('href="/home/contact/"', 'href="#contact"')
PH = PH.replace('Well Equipped Physiotherapy Center With Ultra Modern German Technologies. Working For Holistic Approach.', 'A well equipped physiotherapy centre with ultra modern German technologies, working for a holistic approach.')
PN = PN.replace('href="/home/#conditions"', 'href="/home/contact/"').replace('>Conditions<i>', '>Contact<i>')
assert 'Contact<i>' in PN
ST, BK = sec(about, 'st'), sec(hfinal, 'bk')
MAIN = '\n'.join([PH, MCH, TC, ST, BK, PN])

h = src
a = h.index('<main id="main" class="pg pg--technology">'); a = h.index('>', a) + 1; b = h.index('</main>', a)
h = h[:a] + '\n' + MAIN + '\n' + h[b:]
h = re.sub(r'<link rel="stylesheet" href="/home/css/pages\.css\?v=\d+">', lambda m: m.group(0) + '\n<link rel="stylesheet" href="/home/css/hf.css?v=34">\n<link rel="stylesheet" href="/home/css/technology.css?v=3">', h, count=1)
h = re.sub(r'/home/js/home\.js\?v=\d+', '/home/js/home.js?v=84', h)
h = re.sub(r'(<script src="/home/js/pages\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/bk.js?v=1" defer></script>\n<script src="/home/js/tcp.js?v=1" defer></script>', h, count=1)
assert 'class="mchs"' in h and 'class="tc"' in h and 'class="st"' in h and 'class="bk"' in h and 'az-foot' in h
io.open(R + 'technology/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h))
