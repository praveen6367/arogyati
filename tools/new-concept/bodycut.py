# Cuts the anatomical body out of the client-supplied reference (grey background, flowers), neutralises the
# baked-in red head/spine glow (the page draws its own pain glows), and saves a transparent PNG the particle
# engine samples for positions and colours.
# Usage: python tools/new-concept/bodycut.py <reference.png>
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src = sys.argv[1]
OUT = 'C:/Users/offic/Desktop/arogyati-pitchdeck/home/assets/img/body-anatomy.png'
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
mx, mn = im.max(-1), im.min(-1)
sat = mx - mn
lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
body = ((sat > 16) | (lum < 175)) & ~((sat < 14) & (lum > 196))  # drop white petals from the background
body = ndimage.binary_opening(body, iterations=2)
lab, n = ndimage.label(body)
sizes = ndimage.sum(body, lab, range(1, n + 1))
body = lab == (1 + int(np.argmax(sizes)))
body = ndimage.binary_closing(body, iterations=2)
body = ndimage.binary_fill_holes(body)
# soft edge
body &= ~((lum > 212) & (sat < 22))  # stray white petal fragments touching the arm
body = ndimage.binary_opening(body, iterations=1)
lab, n = ndimage.label(body); sizes = ndimage.sum(body, lab, range(1, n + 1)); body = lab == (1 + int(np.argmax(sizes)))
body = ndimage.binary_fill_holes(body)
alpha = ndimage.gaussian_filter(body.astype(np.float32), 0.7)
# red glow -> body tone (keep luminance, swap hue toward the olive/cream palette)
red = (r > g + 35) & (r > b + 35) & body
w = np.clip((r - g - 35) / 80, 0, 1)
tone = np.stack([lum * 1.02 + 6, lum * 0.98 + 4, lum * 0.72], -1)
im[red] = im[red] * (1 - w[red, None]) + tone[red] * w[red, None]
rgba = np.dstack([np.clip(im, 0, 255), alpha * 255]).astype(np.uint8)
ys, xs = np.where(body)
crop = rgba[ys.min() - 2: ys.max() + 3, xs.min() - 2: xs.max() + 3]
Image.fromarray(crop).save(OUT, optimize=True)
print('saved', crop.shape, 'bbox', xs.min(), ys.min(), xs.max(), ys.max())
