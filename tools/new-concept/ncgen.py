# builds /home/new-concept/ from the live homepage: replaces the hero + 3D story with one pinned motion-graphic
# experience ("From pain to motion": a particle figure that ends as the Arogyati logo figure). Rest of page unchanged.
# Run:  python tools/new-concept/ncgen.py
import io, re, os
R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/'
h = io.open(R + 'index.html', encoding='utf8').read()
ARROW = re.search(r'<span class="hx-pill__ic">(<svg.*?</svg>)</span>', h, re.S).group(1)
FIG = re.search(r'<g class="az-lg-f" fill="#406CB4">(.*?)</g>', h, re.S).group(1)

def ln(*parts):  # masked lines for the rise-in reveal
    return ''.join(f'<span class="ncx-ln"><span>{p}</span></span>' for p in parts)

CH = [
  (None, ln('Working for wellness.', '<em>First time in Kolhapur.</em>'), 'Well Equipped Physiotherapy Center With Ultra Modern German Technologies.', True),
  ('01 · Neck', ln('Neck pain,', '<em>realigned by hand.</em>'), 'Osteopathy · FOMT', False),
  ('02 · Shoulder', ln('Frozen shoulder,', '<em>moving again.</em>'), 'Super Inductive System · 0.85 Tesla', False),
  ('03 · Lower back', ln('Lower back pain,', '<em>back in rhythm.</em>'), 'Matrix Rhythm Therapy · 8–12 Hz', False),
  ('04 · Knee', ln('Knee pain,', '<em>healed from within.</em>'), 'Class IV Laser', False),
  ('05 · Move', ln('Free to', '<em>move again.</em>'), 'Working For Holistic Approach.', False),
  ('Arogyati', ln('28 years.', '<em>12 physios + 8 assistant physios.</em>'), 'First Big Private Clinic In Kolhapur.', 'end'),
]
chs = ''
for i, (lab, hd, cap, kind) in enumerate(CH):
    tag = 'h1' if i == 0 else 'h2'
    extra = ''
    if kind is True:
        extra = f'<div class="ncx-ch__ctas" data-ncx-in><a class="hx-pill hx-pill--dark" href="#contact" data-az-magnetic>Book appointment<span class="hx-pill__ic">{ARROW}</span></a><span class="ncx-cue"><i></i>Scroll</span></div>'
    elif kind == 'end':
        extra = f'<div class="ncx-ch__ctas"><a class="hx-pill hx-pill--dark" href="#contact" data-az-magnetic>Book appointment<span class="hx-pill__ic">{ARROW}</span></a></div>'
    chs += (f'<div class="ncx-ch{" is-on" if i == 0 else ""}" data-i="{i}">' + (f'<span class="rx__label">{lab}</span>' if lab else '<span class="rx__label">First Big Private Clinic In Kolhapur</span>')
            + f'<{tag} class="ncx-ch__h">{hd}</{tag}><p class="ncx-ch__p">{cap}</p>{extra}</div>')

hero = f'''<section class="ncx" id="top" aria-label="From pain to motion">
  <div class="ncx__stage">
    <div class="ncx__tint" aria-hidden="true"></div>
    <div class="ncx__word" aria-hidden="true"><span data-ncx-word>WELLNESS</span></div>
    <canvas class="ncx__cv" aria-hidden="true"></canvas>
    <div class="ncx__copy az-wrap">{chs}</div>
    <div class="ncx__rail" aria-hidden="true"><b data-ncx-n>01</b><span class="ncx__bar"><i></i></span><b>07</b></div>
    <div class="ncx__tag" aria-hidden="true"><i></i><span><b data-ncx-tag>Neck pain</b><em data-ncx-tagm>Osteopathy</em></span></div>
    <svg class="ncx__logo" viewBox="129 0 35 42" aria-hidden="true">{FIG}</svg>
  </div>
</section>
'''

a = h.index('<section class="hx"'); b = h.index('<section class="rx"')
out = h[:a] + hero + '\n<!-- RAIL SECTION -->\n' + h[b:]
m3 = re.search(r'<script>addEventListener\("load",function\(\)\{var go=function\(\)\{import\("/home/js/m3d\.js[^<]*</script>', out)
assert m3, 'm3d loader'; out = out.replace(m3.group(0), '')
out = re.sub(r'<link rel="stylesheet" href="/home/css/home\.css\?v=(\d+)">', lambda m: m.group(0) + '\n<link rel="stylesheet" href="/home/css/nc.css?v=6">', out, count=1)
out = re.sub(r'(<script src="/home/js/home\.js\?v=\d+" defer></script>)', r'\1\n<script src="/home/js/nc.js?v=6" defer></script>', out, count=1)
assert 'nc.js' in out and 'nc.css' in out
out = out.replace('<link rel="canonical" href="https://arogyati-chi.vercel.app/home">', '<link rel="canonical" href="https://arogyati-chi.vercel.app/home">\n<meta name="robots" content="noindex">', 1)
out = re.sub(r'<link rel="preload"[^>]*(hero-|model-mid)[^>]*>\n?', '', out)
out = out.replace('<title>', '<title>New concept · ', 1)
os.makedirs(R + 'new-concept', exist_ok=True)
io.open(R + 'new-concept/index.html', 'w', encoding='utf8').write(out)
print('ok', len(out))
