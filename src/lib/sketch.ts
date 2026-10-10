import { seeded } from "@/lib/geometry";

/*
 * Pencil illustration, drawn in code. Shapes become strokes the way a hand
 * makes them: lines bow a little and overshoot their corners, circles don't
 * quite close, shading is hatched. Strokes are collected per layer in the
 * order they're drawn, so a layer rendered as one path with pathLength=1
 * draws itself stroke by stroke, like the artist working across the page.
 * Seeded, so the same drawing comes out every time (server-rendered).
 */

export type P = [number, number];
export type Layer = "faint" | "hatch" | "line" | "ink" | "blue";
export const LAYERS: Layer[] = ["faint", "hatch", "line", "ink", "blue"];

const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (p: P) => `${r1(p[0])},${r1(p[1])}`;

/** Where an infinite line (origin o, direction d) crosses a convex polygon. */
function clip(poly: P[], o: P, d: P): [number, number] | null {
  const ts: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const den = d[0] * ey - d[1] * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = ((a[0] - o[0]) * ey - (a[1] - o[1]) * ex) / den;
    const s = ((a[0] - o[0]) * d[1] - (a[1] - o[1]) * d[0]) / den;
    if (s >= -1e-6 && s <= 1 + 1e-6) ts.push(t);
  }
  if (ts.length < 2) return null;
  return [Math.min(...ts), Math.max(...ts)];
}

/** A smooth curve through points (Catmull-Rom as cubic Béziers). */
function smooth(p: P[]): string {
  if (p.length < 2) return "";
  let d = `M${pt(p[0])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
}

export class Sketch {
  readonly layers: Record<Layer, string[]> = { faint: [], hatch: [], line: [], ink: [], blue: [] };
  /** Paper-coloured shapes behind the near objects, so the far city doesn't show through them. */
  readonly paper: string[] = [];
  /** Route nodes, drawn as filled dots after the blue line. */
  readonly nodes: P[] = [];
  private rnd: () => number;

  constructor(seed: number) {
    this.rnd = seeded(seed);
  }

  /** ±n of hand wobble. */
  j(n = 1) {
    return (this.rnd() - 0.5) * 2 * n;
  }
  /** A random number in [a, b). */
  r(a: number, b: number) {
    return a + this.rnd() * (b - a);
  }

  /** A pencil line: a slight bow, ends that overshoot; `twice` goes over it again, lighter. */
  line(a: P, b: P, layer: Layer = "ink", o: { over?: number; bow?: number; twice?: boolean } = {}) {
    const { over = 2.2, bow = 1.1, twice = false } = o;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const pass = (k: number) => {
      const s: P = [a[0] - ux * over * this.rnd() + this.j(0.45 * k), a[1] - uy * over * this.rnd() + this.j(0.45 * k)];
      const e: P = [b[0] + ux * over * this.rnd() + this.j(0.45 * k), b[1] + uy * over * this.rnd() + this.j(0.45 * k)];
      const m = this.j(bow) * Math.min(1.4, len / 90) * k;
      const c: P = [(s[0] + e[0]) / 2 - uy * m, (s[1] + e[1]) / 2 + ux * m];
      return `M${pt(s)}Q${pt(c)} ${pt(e)}`;
    };
    this.layers[layer].push(pass(1));
    if (twice) this.layers[layer === "ink" ? "line" : layer].push(pass(1.8));
  }

  /** Straight segments between points, each its own stroke (corners overshoot). */
  poly(points: P[], layer: Layer = "ink", closed = false, o: { over?: number; bow?: number; twice?: boolean } = {}) {
    const n = closed ? points.length : points.length - 1;
    for (let i = 0; i < n; i++) this.line(points[i], points[(i + 1) % points.length], layer, o);
  }

  rect(x: number, y: number, w: number, h: number, layer: Layer = "ink", o: { over?: number; bow?: number; twice?: boolean } = {}) {
    this.poly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      layer,
      true,
      o,
    );
  }

  /** An ellipse (or an arc of one); full ones start anywhere and don't quite close. */
  ellipse(cx: number, cy: number, rx: number, ry: number, layer: Layer = "ink", o: { from?: number; to?: number } = {}) {
    const full = o.from === undefined;
    const start = full ? this.rnd() * Math.PI * 2 : (o.from as number);
    const span = full ? Math.PI * 2 * this.r(1.04, 1.12) : (o.to ?? Math.PI * 2) - start;
    const n = Math.max(8, Math.round(((rx + ry) * Math.abs(span)) / 14));
    const pts: P[] = [];
    for (let i = 0; i <= n; i++) {
      const t = start + (span * i) / n;
      const w = 1 + this.j(0.03);
      pts.push([cx + Math.cos(t) * rx * w, cy + Math.sin(t) * ry * w]);
    }
    this.layers[layer].push(smooth(pts));
  }

  /** A freehand curve through points. */
  curve(points: P[], layer: Layer = "ink", wobble = 0.8) {
    this.layers[layer].push(smooth(points.map((p) => [p[0] + this.j(wobble), p[1] + this.j(wobble)] as P)));
  }

  /** A loose scribble around a centre, for foliage and smoke. */
  scribble(cx: number, cy: number, rx: number, ry: number, turns = 3, layer: Layer = "line") {
    const pts: P[] = [];
    const n = Math.round(turns * 9);
    let a = this.rnd() * Math.PI * 2;
    for (let i = 0; i <= n; i++) {
      a += (Math.PI * 2) / 9 + this.j(0.25);
      const k = this.r(0.55, 1);
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    this.layers[layer].push(smooth(pts));
  }

  /** Hatching inside a convex polygon: parallel, slightly uneven strokes. */
  hatch(poly: P[], o: { angle?: number; gap?: number; layer?: Layer; trim?: number } = {}) {
    const { angle = -58, gap = 4.6, layer = "hatch", trim = 1.4 } = o;
    const a = (angle * Math.PI) / 180;
    const dir: P = [Math.cos(a), Math.sin(a)];
    const nrm: P = [-dir[1], dir[0]];
    const proj = poly.map((p) => p[0] * nrm[0] + p[1] * nrm[1]);
    const hi = Math.max(...proj);
    for (let d = Math.min(...proj) + gap * this.r(0.3, 0.8); d < hi; d += gap * this.r(0.82, 1.18)) {
      const seg = clip(poly, [nrm[0] * d, nrm[1] * d], dir);
      if (!seg) continue;
      const t0 = seg[0] + this.rnd() * trim;
      const t1 = seg[1] - this.rnd() * trim;
      if (t1 - t0 < 2.5) continue;
      const s: P = [nrm[0] * d + dir[0] * t0 + this.j(0.35), nrm[1] * d + dir[1] * t0 + this.j(0.35)];
      const e: P = [nrm[0] * d + dir[0] * t1 + this.j(0.35), nrm[1] * d + dir[1] * t1 + this.j(0.35)];
      this.layers[layer].push(`M${pt(s)}L${pt(e)}`);
    }
  }

  hatchRect(x: number, y: number, w: number, h: number, o: { angle?: number; gap?: number; layer?: Layer; trim?: number } = {}) {
    this.hatch(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      o,
    );
  }

  /** Masks what's behind a near object (no stroke). */
  fill(poly: P[]) {
    this.paper.push(`M${poly.map(pt).join("L")}Z`);
  }

  /** The engineered line: straight, exact, no wobble. */
  route(points: P[]) {
    this.layers.blue.push(`M${points.map(pt).join("L")}`);
  }
  node(p: P) {
    this.nodes.push(p);
  }
}
