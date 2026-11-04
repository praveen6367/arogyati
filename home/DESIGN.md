# AROGYATI Homepage — Design System

Lives at `/home`. Fully isolated from the investor deck at `/` (no deck file is touched).
Every class is prefixed `az-` and scoped under `body.az-home`.

## Direction
Clinical-premium, calm, light-led. Editorial serif headlines, airy cream canvas, olive + blue from the
official logo, deep green-ink sections for contrast (same family as the deck's #04150F).
Borrowed in principle from the references: oversized editorial type, soft light gradients,
curved "sheet" transitions between sections, rounded image cards, stacked cards, one travelling
shared element that keeps every section connected (like the deck's morph).

## Colour tokens
| Token | Value | Use |
|---|---|---|
| `--az-blue` | #406CB4 | brand blue (logo figure), links, focus |
| `--az-blue-700` | #2D4F88 | hover / pressed |
| `--az-blue-100` | #E7EDF8 | tints |
| `--az-olive` | #7D8E39 | brand olive (logo letters), primary CTA |
| `--az-olive-700` | #5D6A29 | CTA hover, text on cream (AA) |
| `--az-olive-100` | #EEF1E1 | tints |
| `--az-ink` | #231F20 | text |
| `--az-ink-2` | #5A5452 | secondary text (AA on cream) |
| `--az-cream` | #F5F2EA | page canvas (warm bias) |
| `--az-paper` | #FBFAF6 | cards |
| `--az-sand` | #E8E1D1 | warm neutral surfaces |
| `--az-forest` | #0F2219 | dark sections |
| `--az-accent` | #C9E265 | restrained accent (only on dark sections) |

## Type
- Display: **Instrument Serif** (400 + italic), self-hosted WOFF2, `font-display: swap`.
- UI/body: **Plus Jakarta Sans** variable 200–800 (same file as the deck).
- Fluid scale (clamp): display `clamp(3.4rem, 9.2vw, 10rem)`, h2 `clamp(2.4rem, 5.6vw, 5.6rem)`,
  h3 `clamp(1.5rem, 2.4vw, 2.2rem)`, body `clamp(1rem, .96rem + .2vw, 1.125rem)`,
  label 0.75rem / 0.18em tracking / uppercase.
- Devanagari: not shipped yet; add Noto Serif/Sans Devanagari subsets when the Marathi toggle comes.

## Space, radius, depth
- Space scale (rem): 0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4 · 6 · 8 · 12.
- Radius: `--az-r-sm` 12px · `--az-r-md` 22px · `--az-r-lg` 36px · pill 999px.
- Shadows: one soft shadow only (`0 18px 40px -24px rgba(15,34,25,.35)`); no large blurs.

## Motion
- Signature easing: `cubic-bezier(.65,.05,.17,1)` (`--az-ease`, GSAP CustomEase `az`). Durations 0.6 / 0.9 / 1.4s.
- Lenis smooth scroll (desktop pointer only), GSAP + ScrollTrigger choreography, SplitText line reveals.
- Signature moments: preloader logo assembly (lighter echo of the deck cover), hero clip-path reveal
  that expands into a full-bleed frame, curved sheets that flatten as each section arrives,
  a travelling brand orb that glides to a new position per section, scroll-scrubbed mission words,
  sticky stacked service cards, pinned horizontal technology rail, drawn SVG timeline path,
  magnetic buttons, soft custom cursor (fine pointers only).

## iPhone / low-power safety
- Transform/opacity only; no backdrop-filter, no large blur, no permanent 3D transforms, no WebGL.
- `html.az-lite` (iOS, low memory, save-data): no orb travel, no hero expand, no pinning
  (native horizontal swipe instead), no cursor, no endless loops.
- `prefers-reduced-motion`: everything static and visible, no preloader.
- Off-screen loops paused via IntersectionObserver.

## Libraries (vendored in /home/vendor, no CDN at runtime)
- GSAP 3.13.0 + ScrollTrigger, SplitText, CustomEase — GSAP Standard "no charge" licence (free incl. commercial use).
- Lenis 1.3.11 — MIT.
- Instrument Serif (Fontsource 5.2.8) — SIL OFL 1.1. Plus Jakarta Sans — SIL OFL 1.1.

## Image sources
- Real clinic/team/device photos: arogyati.com (team, clinic, doctor, SIS, osteopathy, Matrix Rhythm, Class IV laser, Magnetodyn).
- Stock (Unsplash licence, free): hero-knee (photo-1649751361457), hands (1763982811968), elder (1648638810948),
  back (1768507423533), assist (1645005513751), band (1645005512942), shoulder (1645005512968),
  roller (1645005513709), ball (1522898467493), gun (1772122028843) — images.unsplash.com/photo-<id>.
