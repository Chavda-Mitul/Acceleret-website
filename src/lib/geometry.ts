/** Small geometry helpers for the site's diagrams: engineered routes and pencil sketches. */

export type Pt = { x: number; y: number };
export type Axis = "h" | "v";

const r1 = (n: number) => Math.round(n * 10) / 10;
const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

/** Seeded pseudo-random numbers, so sketches look hand-drawn but stay identical between renders. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

/**
 * Orthogonal waypoints through `nodes`. `axes[i]` says how the segment into
 * node i starts: "h" = horizontal first, "v" = vertical first. Tiny offsets
 * (under `snap` px) are straightened instead of producing a jog.
 */
export function orthoWaypoints(nodes: Pt[], axes: Axis[], snap = 6): { pts: Pt[]; nodeIndex: number[] } {
  const pts: Pt[] = [nodes[0]];
  const nodeIndex = [0];
  for (let i = 1; i < nodes.length; i++) {
    const a = pts[pts.length - 1];
    const b = { ...nodes[i] };
    if (Math.abs(a.y - b.y) < snap) b.y = a.y;
    if (Math.abs(a.x - b.x) < snap) b.x = a.x;
    if (a.x !== b.x && a.y !== b.y) {
      pts.push(axes[i] === "v" ? { x: a.x, y: b.y } : { x: b.x, y: a.y });
    }
    nodeIndex.push(pts.length);
    pts.push(b);
  }
  return { pts, nodeIndex };
}

/** Removes repeated points; keeps collinear ones (they may be steps the route passes through). */
export function dedupe(pts: Pt[]) {
  const out: Pt[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - p.x) < 0.5 && Math.abs(last.y - p.y) < 0.5) continue;
    out.push(p);
  }
  return out;
}

/** Polyline with rounded corners (quadratic joins), as an SVG path string. */
export function roundedPath(pts: Pt[], radius = 22): string {
  if (pts.length < 2) return "";
  let d = `M${r1(pts[0].x)},${r1(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const rr = Math.min(radius, dist(p0, p1) / 2, dist(p1, p2) / 2);
    const a = towards(p1, p0, rr);
    const b = towards(p1, p2, rr);
    d += ` L${r1(a.x)},${r1(a.y)} Q${r1(p1.x)},${r1(p1.y)} ${r1(b.x)},${r1(b.y)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${r1(last.x)},${r1(last.y)}`;
}

function towards(from: Pt, to: Pt, len: number): Pt {
  const d = dist(from, to) || 1;
  return { x: from.x + ((to.x - from.x) / d) * len, y: from.y + ((to.y - from.y) / d) * len };
}

/** Cumulative length along a polyline at each point. */
export function cumulative(pts: Pt[]) {
  const out = [0];
  for (let i = 1; i < pts.length; i++) out.push(out[i - 1] + dist(pts[i - 1], pts[i]));
  return out;
}

/** A loose pencil curve from a to b: bowed, slightly overshooting, never quite straight. */
export function sketchCurve(a: Pt, b: Pt, rnd: () => number, bend = 0.32): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const k1 = (rnd() - 0.5) * 2 * bend * len;
  const k2 = (rnd() - 0.5) * 2 * bend * len;
  const j = () => (rnd() - 0.5) * 6;
  const s = { x: a.x + j(), y: a.y + j() };
  const e = { x: b.x + dx * 0.03 + j(), y: b.y + dy * 0.03 + j() };
  const c1 = { x: a.x + dx * 0.3 + nx * k1, y: a.y + dy * 0.3 + ny * k1 };
  const c2 = { x: a.x + dx * 0.72 + nx * k2, y: a.y + dy * 0.72 + ny * k2 };
  return `M${r1(s.x)},${r1(s.y)} C${r1(c1.x)},${r1(c1.y)} ${r1(c2.x)},${r1(c2.y)} ${r1(e.x)},${r1(e.y)}`;
}

/** A hand-drawn rectangle: four slightly bowed strokes that overshoot at the corners. */
export function sketchRect(x: number, y: number, w: number, h: number, rnd: () => number): string {
  const j = (n = 3) => (rnd() - 0.5) * n;
  const o = 5; // overshoot
  const side = (ax: number, ay: number, bx: number, by: number) => {
    const mx = (ax + bx) / 2 + j(4);
    const my = (ay + by) / 2 + j(4);
    return `M${r1(ax + j())},${r1(ay + j())} Q${r1(mx)},${r1(my)} ${r1(bx + j())},${r1(by + j())}`;
  };
  return [
    side(x - o, y, x + w + o, y),
    side(x + w, y - o, x + w, y + h + o),
    side(x + w + o, y + h, x - o, y + h),
    side(x, y + h + o, x, y - o),
  ].join(" ");
}

/** A hand-drawn rounded box of size w × h (origin 0,0): bowed sides, loose corners, a little overshoot. */
export function sketchRoundRect(w: number, h: number, r: number, rnd: () => number, pad = 4): string {
  const j = (n = 2.4) => (rnd() - 0.5) * n;
  const rr = Math.min(r, w / 2, h / 2);
  const x0 = pad + j();
  const y0 = pad + j();
  const x1 = w - pad + j();
  const y1 = h - pad + j();
  const bow = (a: number) => a + j(5);
  return [
    `M${r1(x0 + rr - 6)},${r1(y0 + j())}`,
    `Q${r1((x0 + x1) / 2)},${r1(bow(y0))} ${r1(x1 - rr)},${r1(y0 + j())}`,
    `Q${r1(x1 + j())},${r1(y0 + j())} ${r1(x1 + j())},${r1(y0 + rr)}`,
    `Q${r1(bow(x1))},${r1((y0 + y1) / 2)} ${r1(x1 + j())},${r1(y1 - rr)}`,
    `Q${r1(x1 + j())},${r1(y1 + j())} ${r1(x1 - rr)},${r1(y1 + j())}`,
    `Q${r1((x0 + x1) / 2)},${r1(bow(y1))} ${r1(x0 + rr)},${r1(y1 + j())}`,
    `Q${r1(x0 + j())},${r1(y1 + j())} ${r1(x0 + j())},${r1(y1 - rr)}`,
    `Q${r1(bow(x0))},${r1((y0 + y1) / 2)} ${r1(x0 + j())},${r1(y0 + rr)}`,
    `Q${r1(x0 + j())},${r1(y0 + j())} ${r1(x0 + rr + 8)},${r1(y0 + j(4))}`,
  ].join(" ");
}

/** A pencil copy of an existing SVG path: sampled along its length with a slight hand wobble. */
export function wobbleAlong(path: SVGPathElement, rnd: () => number, amount = 1.4): string {
  const len = path.getTotalLength();
  const steps = Math.max(6, Math.min(140, Math.round(len / 9)));
  let d = "";
  let prev = path.getPointAtLength(0);
  for (let i = 0; i <= steps; i++) {
    const p = path.getPointAtLength((i / steps) * len);
    const next = path.getPointAtLength(Math.min(len, ((i + 1) / steps) * len));
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tl = Math.hypot(tx, ty) || 1;
    const off = (rnd() - 0.5) * 2 * amount;
    const x = p.x + (-ty / tl) * off;
    const y = p.y + (tx / tl) * off;
    d += `${i === 0 ? "M" : " L"}${r1(x)},${r1(y)}`;
    prev = p;
  }
  return d;
}

/** A small pencil scribble loop around a point, like someone circling something twice. */
export function scribbleLoop(c: Pt, rx: number, ry: number, rnd: () => number): string {
  const turns = 2;
  const steps = 28;
  let d = "";
  for (let i = 0; i <= steps * turns; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wob = 1 + (rnd() - 0.5) * 0.12;
    const x = c.x + Math.cos(t) * rx * wob + i * 0.25;
    const y = c.y + Math.sin(t) * ry * wob;
    d += `${i === 0 ? "M" : " L"}${r1(x)},${r1(y)}`;
  }
  return d;
}
