# About page: builds home/about/index.html from the saved original (about-src.html) plus new sections.
# Order: our story (particle ambulance) - why Arogyati - vision & mission - team - advanced modalities - history - testimonials - contact - next page.
import io, re, os, json
R = os.path.dirname(os.path.abspath(__file__)) + '/../../home/'
src = io.open(os.path.dirname(os.path.abspath(__file__)) + '/about-src.html', encoding='utf8').read()
home = io.open(R + 'index.html', encoding='utf8').read()
hfinal = io.open(R + 'home-final/index.html', encoding='utf8').read()
sec = lambda h, cls: re.search(r'<section class="' + cls + r'"[^>]*>.*?</section>', h, re.S).group(0)

ARROW = '<svg class="az-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>'
PHONE = '<svg class="az-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'

# ---- our story: four stops of the ambulance
STORY = ('<section class="abs" id="top" aria-label="Our story"><div class="abs__pin">'
  '<canvas class="abs__gl" aria-hidden="true"></canvas><div class="abs__veil" aria-hidden="true"></div>'
  '<div class="az-wrap abs__ui">'
  '<nav class="ph__crumb abs__crumb" aria-label="Breadcrumb"><a href="/home/">Home</a><i></i><span>About</span></nav>'
  '<div class="abs__beats">'
  '<article class="abs__beat is-on" aria-hidden="false">'
  '<h1 class="abs__h" data-ph-h1>First big private clinic in <em>Kolhapur.</em></h1>'
  '<p class="abs__p">A well equipped physiotherapy centre with ultra modern German technologies, working for a holistic approach.</p>'
  '<ul class="abs__stats"><li><b>2007</b><span>To present</span></li><li><b>18 yrs</b><span>Own private set up</span></li><li><b>12+8</b><span>Physios + assistants</span></li></ul>'
  '</article>'
  '<article class="abs__beat" aria-hidden="true">'
  '<h2 class="abs__h">Physiotherapy <em>at home.</em></h2>'
  '<p class="abs__p">Physiotherapy services for hospitalised and bedridden patients, at home.</p>'
  '</article>'
  '<article class="abs__beat" aria-hidden="true">'
  '<h2 class="abs__h">Hospital <em>visits.</em></h2>'
  '<p class="abs__p">Staff has experience not only working under a private set up but also in multi-specialty hospital and home visit.</p>'
  '</article>'
  '<article class="abs__beat" aria-hidden="true">'
  '<h2 class="abs__h">On call, <em>at your door.</em></h2>'
  '<p class="abs__p">When a patient cannot come to the clinic, our van brings the physiotherapist home. Call us, and we come to you.</p>'
  '<ul class="abs__tags"><li>Home visits</li><li>Hospital visits</li><li>Bedridden patients</li></ul>'
  f'<a class="hx-pill hx-pill--dark abs__cta" href="tel:+919420294219" data-az-magnetic>Request a home visit<span class="hx-pill__ic">{PHONE}</span></a>'
  '</article>'
  '</div>'
  '<ol class="abs__prog" aria-hidden="true"><li class="is-on is-now"><i></i>The clinic</li><li><i></i>On the road</li><li><i></i>Hospital</li><li><i></i>At home</li></ol>'
  '<p class="abs__hint" aria-hidden="true">Scroll</p>'
  '</div></div></section>')

# ---- vision & mission (copy from the Team and About pages)
VM = ('<section class="avm" id="vision" aria-label="Vision and mission"><div class="avm__pin"><div class="az-wrap avm__grid">'
  '<div class="avm__copy"><div class="avm__items">'
  '<article class="avm__item is-on" aria-hidden="false"><h2 class="avm__h">Our <em>vision.</em></h2>'
  '<p class="avm__big">Arogyati aims to achieve big, vision of Arogyati is to serve society.</p>'
  '<p class="avm__p">Believe in quality than quantity.</p></article>'
  '<article class="avm__item" aria-hidden="true"><h2 class="avm__h">Our <em>mission.</em></h2>'
  '<p class="avm__big">Working for wellness and making societal wellness accessible to all.</p>'
  '<p class="avm__p">Spread physio awareness, and provide advanced treatments.</p>'
  '<ul class="avm__list"><li>Our charges to patients are affordable.</li><li>We are focused to get you results.</li><li>We take the work seriously.</li></ul></article>'
  '</div><div class="avm__ticks" aria-hidden="true"><i class="is-on"></i><i></i></div></div>'
  '<div class="avm__stage"><canvas class="avm__cv" aria-hidden="true"></canvas></div>'
  '</div></div></section>')

# ---- team: the two doctors as cards, everyone else as the homepage list
TXH = sec(home, 'tx')
head = re.search(r'<div class="tx__head">.*?</div>\s*</div>\s*</div>', TXH, re.S).group(0)
rows = re.findall(r'<li class="tx-row".*?</li>', TXH, re.S)
def card(r):
    name = re.search(r'tx-row__n"><span>([^<]*)', r).group(1)
    role = re.search(r'data-role="([^"]*)"', r).group(1)
    img = re.search(r'data-img="([^"]*)"', r).group(1)
    stat, unit = re.search(r'data-stat="([^"]*)"', r).group(1), re.search(r'data-unit="([^"]*)"', r).group(1)
    bio = re.search(r'<div class="tx-row__bio"><div>(.*?)</div></div>', r, re.S).group(1)
    return (f'<article class="tmf"><figure class="tmf__ph"><img src="{img}" alt="{name}" width="600" height="750" loading="lazy" decoding="async"></figure>'
            f'<div class="tmf__body"><p class="tmf__stat"><b>{stat}</b><span>{unit}</span></p><h3 class="tmf__n">{name}</h3><p class="tmf__r">{role}</p>'
            f'<div class="tmf__bio">{bio}</div></div></article>')
TEAM = ('<section class="tx abt" id="team"><div class="az-wrap">' + head +
        '<div class="tmf__grid">' + card(rows[0]) + card(rows[1]) + '</div>'
        '<ol class="tx__list">' + ''.join(rows[2:]) + '</ol></div></section>')

MDX = sec(hfinal, 'mdx')
WY, HX2, ST, CX, PN = sec(src, 'wy'), sec(src, 'hx2'), sec(src, 'st'), sec(src, 'cx'), sec(src, 'pn')
MAIN = '\n'.join([STORY, WY, VM, TEAM, MDX, HX2, ST, CX, PN])

h = src
a = h.index('<main id="main" class="pg pg--about">'); a = h.index('>', a) + 1; b = h.index('</main>', a)
h = h[:a] + '\n' + MAIN + '\n' + h[b:]
h = re.sub(r'<link rel="stylesheet" href="/home/css/pages\.css\?v=\d+">', lambda m: m.group(0) + '\n<link rel="stylesheet" href="/home/css/hf.css?v=31">\n<link rel="stylesheet" href="/home/css/about.css?v=3">', h, count=1)
h = re.sub(r'/home/js/home\.js\?v=\d+', '/home/js/home.js?v=83', h)
h = re.sub(r'/home/css/home\.css\?v=\d+', '/home/css/home.css?v=133', h)
h = re.sub(r'(<script src="/home/js/pages\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/mdx.js?v=2" defer></script>\n<script src="/home/js/ab-vm.js?v=1" defer></script>\n<script type="module" src="/home/js/ab-story.js?v=3"></script>', h, count=1)
assert 'ab-story.js' in h and 'about.css' in h and 'class="abs"' in h and 'class="mdx"' in h and 'az-foot' in h
io.open(R + 'about/index.html', 'w', encoding='utf8').write(h)
print('ok', len(h), 'team rows', len(rows))
