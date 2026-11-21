# Cuts the anatomy cut-out (home/assets/img/body-anatomy.png, from bodycut.py) into rigged parts, cut-out-
# animation style: head, torso, and per side upper arm / forearm / hand / thigh / shin / foot. Each part gets a
# round cap around its proximal joint (drawn over its parent) so no gap can open when a limb rotates.
# Output: home/assets/img/rig/<part>.png + rig.json (positions/pivots in source-image pixels).
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

R = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/assets/img/'
UP = 2  # upscale for smoother rotated edges
src = Image.open(R + 'body-anatomy.png').convert('RGBA')
src = src.resize((src.width * UP, src.height * UP), Image.LANCZOS)
A = np.asarray(src).astype(np.float32)
H, W = A.shape[:2]
alpha = A[..., 3] / 255.0
body = alpha > 0.5
U = 0.5232  # figure units across the image width (height = 1 unit)

def fu(fx, fy): return np.array([fx * W, fy * H])
J = {'H': fu(.5, .06), 'N': fu(.5, .135), 'C': fu(.5, .19), 'P': fu(.5, .47),
     'sA': fu(.29, .2), 'eA': fu(.2, .34), 'wA': fu(.11, .46), 'tA': fu(.04, .53),
     'sB': fu(.71, .2), 'eB': fu(.8, .34), 'wB': fu(.89, .46), 'tB': fu(.96, .53),
     'iA': fu(.4, .48), 'kA': fu(.375, .68), 'aA': fu(.36, .92), 'oA': fu(.33, .98),
     'iB': fu(.6, .48), 'kB': fu(.625, .68), 'aB': fu(.64, .92), 'oB': fu(.67, .98)}
PARTS = {  # name: (bone a, bone b, region, side, cap radius in units)
    'torso': ('P', 'C', 'torso', None, 0), 'head': ('N', 'H', 'head', None, 0.04),
    'uarmA': ('sA', 'eA', 'arm', 'A', 0.05), 'farmA': ('eA', 'wA', 'arm', 'A', 0.032), 'handA': ('wA', 'tA', 'arm', 'A', 0.024),
    'uarmB': ('sB', 'eB', 'arm', 'B', 0.05), 'farmB': ('eB', 'wB', 'arm', 'B', 0.032), 'handB': ('wB', 'tB', 'arm', 'B', 0.024),
    'thighA': ('iA', 'kA', 'leg', 'A', 0.058), 'shinA': ('kA', 'aA', 'leg', 'A', 0.038), 'footA': ('aA', 'oA', 'leg', 'A', 0.028),
    'thighB': ('iB', 'kB', 'leg', 'B', 0.058), 'shinB': ('kB', 'aB', 'leg', 'B', 0.038), 'footB': ('aB', 'oB', 'leg', 'B', 0.028),
}
yy, xx = np.mgrid[0:H, 0:W]
fx, fy = xx / W, yy / H
ax = np.abs((fx - 0.5) * U)
# regions (measured: arms separate from the torso below the armpit at fy≈0.29)
AT = [(0.29, 0.096), (0.36, 0.097), (0.4, 0.106), (0.44, 0.125), (0.48, 0.138), (0.56, 0.152)]
thr = np.full(fy.shape, 0.102)
m = fy >= 0.29
thr[m] = np.interp(fy[m], [a for a, _ in AT], [b for _, b in AT])
leg = (fy > 0.5) & (ax < 0.15)
arm = ~leg & (fy > 0.16) & (ax > thr)
head = ~arm & ~leg & (fy < 0.152) & (ax < 0.06)
torso = ~arm & ~leg & ~head
sideA = fx < 0.5

def segdist(p, a, b):
    ab = b - a; t = np.clip(((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab @ ab), 0, 1)
    return np.hypot(p[0] - (a[0] + ab[0] * t), p[1] - (a[1] + ab[1] * t))

P = (xx.astype(np.float32), yy.astype(np.float32))
owner = np.full((H, W), '', dtype=object)
owner[body & torso] = 'torso'; owner[body & head] = 'head'
for reg, names in (('arm', ['uarm', 'farm', 'hand']), ('leg', ['thigh', 'shin', 'foot'])):
    for s, sm in (('A', sideA), ('B', ~sideA)):
        msk = body & (arm if reg == 'arm' else leg) & sm
        ds = np.stack([segdist(P, J[PARTS[n + s][0]], J[PARTS[n + s][1]]) for n in names])
        near = np.argmin(ds, 0)
        for k, n in enumerate(names): owner[msk & (near == k)] = n + s

os.makedirs(R + 'rig', exist_ok=True)
meta = {'w': W, 'h': H, 'units': U, 'joints': {k: [round(float(v[0]), 1), round(float(v[1]), 1)] for k, v in J.items()}, 'parts': {}}
for name, (a, b, reg, side, cap) in PARTS.items():
    msk = owner == name
    if cap:  # round cap at the proximal joint, limited to the body silhouette
        r = cap * H
        msk = msk | (body & ((xx - J[a][0]) ** 2 + (yy - J[a][1]) ** 2 <= r * r))
    msk = ndimage.binary_closing(msk, iterations=2)
    # solid overlap at internal cuts (no seams); the soft edge comes only from the outer silhouette alpha
    msk = ndimage.binary_dilation(msk, iterations=3) & body
    soft = np.clip(ndimage.gaussian_filter(msk.astype(np.float32), 0.6) * 2.0, 0, 1) * alpha
    ys, xs = np.where(soft > 0.02)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = A[y0:y1, x0:x1].copy(); rgba[..., 3] = soft[y0:y1, x0:x1] * 255
    Image.fromarray(rgba.astype(np.uint8)).save(R + f'rig/{name}.png', optimize=True)
    meta['parts'][name] = {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0), 'a': a, 'b': b}
json.dump(meta, open(R + 'rig/rig.json', 'w'), separators=(',', ':'))
print({k: (v['w'], v['h']) for k, v in meta['parts'].items()})
