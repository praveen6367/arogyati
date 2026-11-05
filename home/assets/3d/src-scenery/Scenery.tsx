import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

/* Seamless 12s loop: soft aurora blobs + slow light sweeps. Every motion uses whole cycles of the loop. */
const BLOBS = [
  { c: '#CFE6D6', x: 0.70, y: 0.42, r: 0.55, ax: 0.10, ay: 0.08, n: 1, p: 0.0 },
  { c: '#F6DCC4', x: 0.88, y: 0.80, r: 0.45, ax: 0.08, ay: 0.06, n: 1, p: 1.7 },
  { c: '#DCD6F2', x: 0.30, y: 0.20, r: 0.50, ax: 0.09, ay: 0.07, n: 2, p: 3.1 },
  { c: '#D6E8F6', x: 0.12, y: 0.78, r: 0.48, ax: 0.07, ay: 0.09, n: 1, p: 4.4 },
  { c: '#E8F4C8', x: 0.55, y: 0.95, r: 0.38, ax: 0.12, ay: 0.05, n: 2, p: 2.2 },
];

export const Scenery: React.FC = () => {
  const f = useCurrentFrame(), { durationInFrames: D, width: W, height: H } = useVideoConfig();
  const a = (f / D) * Math.PI * 2;
  return (
    <AbsoluteFill style={{ background: '#FBFCFA', overflow: 'hidden' }}>
      {BLOBS.map((b, i) => {
        const x = (b.x + Math.sin(a * b.n + b.p) * b.ax) * W, y = (b.y + Math.cos(a * b.n + b.p * 1.3) * b.ay) * H;
        const r = b.r * W * (1 + Math.sin(a * b.n + b.p * 0.7) * 0.08);
        return <div key={i} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
          background: `radial-gradient(circle, ${b.c} 0%, ${b.c}00 68%)`, mixBlendMode: 'multiply' }} />;
      })}
      {/* slow diagonal light sweeps */}
      {[0, 0.5].map((o, i) => {
        const t = ((f / D) + o) % 1;
        return <div key={'s' + i} style={{ position: 'absolute', top: -H * 0.5, left: (t * 1.8 - 0.6) * W, width: W * 0.35, height: H * 2,
          transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))', filter: 'blur(30px)' }} />;
      })}
      {/* concentric contour lines, breathing — a quiet "motion graphics" layer */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 9 }).map((_, k) => {
          const rr = ((k / 9 + f / D) % 1) * W * 0.62;
          const op = Math.sin(((k / 9 + f / D) % 1) * Math.PI) * 0.16;
          return <ellipse key={k} cx={W * 0.68} cy={H * 0.62} rx={rr} ry={rr * 0.42} fill="none" stroke="#6E8F78" strokeWidth={1} opacity={op} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
