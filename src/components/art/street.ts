import { Sketch, type P } from "@/lib/sketch";

/*
 * "The street": a Surat trading street drawn in pencil — a textile shop with
 * bolts of cloth, an office block, a sawtooth-roofed weaving shed, a
 * warehouse, a loaded tempo, an old trading house with a chhatri — and the
 * engineered route running along the road, connecting every door.
 * Everything is built from simple shapes drawn by hand (lib/sketch).
 */

export const STREET_W = 1600;
export const STREET_H = 470;
const G = 392; // the pavement line

export function drawStreet(): Sketch {
  const s = new Sketch(20261010);
  farCity(s);
  clouds(s);
  lamp(s, 12);
  bolts(s, 26, 2);
  textileShop(s, 64, 240, 236);
  tree(s, 346);
  office(s, 388, 178, 300);
  pole(s, 590);
  weavingShed(s, 616, 256, 148);
  warehouse(s, 908, 246, 134);
  pole(s, 1182);
  lowWall(s, 1172, 1334);
  tradeHouse(s, 1344, 236, 218);
  wires(s);
  street(s);
  tempo(s, 1192, G + 52);
  scooter(s, 1442, G + 44);
  routeAlong(s);
  return s;
}

/* ------------------------------------------------------------------ helpers */

/** Squiggles that read as lettering without saying anything. */
function lettering(s: Sketch, x: number, y: number, w: number, rows = 1) {
  for (let r = 0; r < rows; r++) {
    let cx = x;
    const end = x + w * (r ? 0.7 : 1);
    while (cx < end - 6) {
      const word = Math.min(end - cx, s.r(14, 34));
      const pts: P[] = [];
      for (let t = 0; t <= word; t += 3.2) pts.push([cx + t, y + r * 10 + Math.sin(t * 1.3 + cx) * s.r(1.2, 2.8)]);
      if (pts.length > 2) s.curve(pts, "line", 0.25);
      cx += word + s.r(5, 9);
    }
  }
}

function windowPane(s: Sketch, x: number, y: number, w: number, h: number, o: { grille?: boolean; dark?: boolean; arch?: boolean } = {}) {
  if (o.arch) {
    const r = w / 2;
    s.line([x, y + r], [x, y + h], "ink");
    s.line([x + w, y + r], [x + w, y + h], "ink");
    s.ellipse(x + r, y + r, r, r, "ink", { from: Math.PI, to: Math.PI * 2 });
    s.line([x - 3, y + h], [x + w + 3, y + h], "ink");
    s.line([x + r, y + 2], [x + r, y + h], "line");
    if (o.dark) s.hatch([[x + 1, y + r], [x + w - 1, y + r], [x + w - 1, y + h - 1], [x + 1, y + h - 1]], { angle: -58, gap: 3.6 });
    return;
  }
  s.rect(x, y, w, h, "ink", { over: 1.6 });
  s.line([x - 4, y + h + 3], [x + w + 4, y + h + 3], "line"); // sill
  if (o.dark) s.hatchRect(x + 1, y + 1, w - 2, h - 2, { angle: -58, gap: 3.4 });
  if (o.grille) for (let gx = x + 6; gx < x + w - 2; gx += 7) s.line([gx, y + 2], [gx, y + h - 2], "line", { over: 0.4, bow: 0.3 });
  else if (!o.dark) {
    s.line([x + w / 2, y + 1], [x + w / 2, y + h - 1], "line", { over: 0.4 });
    s.line([x + 4, y + h * 0.62], [x + w * 0.42, y + h * 0.18], "hatch", { over: 0 }); // a reflection
  }
}

function box(s: Sketch, x: number, y: number, size: number) {
  const d = size * 0.32;
  s.rect(x, y - size, size, size, "ink", { over: 1.2 });
  s.poly([[x, y - size], [x + d, y - size - d], [x + size + d, y - size - d], [x + size, y - size]], "ink", false, { over: 1 });
  s.poly([[x + size + d, y - size - d], [x + size + d, y - d], [x + size, y]], "ink", false, { over: 1 });
  s.hatch([[x + size, y - size], [x + size + d, y - size - d], [x + size + d, y - d], [x + size, y]], { angle: -80, gap: 3.2 });
  s.line([x + size * 0.5, y - size], [x + size * 0.5 + d, y - size - d], "line", { over: 0 }); // tape
  s.line([x + size * 0.3, y - size * 0.55], [x + size * 0.7, y - size * 0.55], "line", { over: 0, bow: 0.2 });
}

/* ------------------------------------------------------------------ the far city */

function farCity(s: Sketch) {
  const blocks: [number, number, number][] = [
    [0, 70, 236], [78, 62, 196], [150, 96, 224], [264, 58, 170], [460, 84, 204], [552, 50, 246],
    [646, 76, 190], [842, 64, 214], [934, 96, 176], [1050, 70, 226], [1130, 90, 198], [1240, 60, 160],
    [1318, 88, 202], [1424, 72, 182], [1508, 92, 220],
  ];
  for (const [x, w, top] of blocks) {
    s.poly([[x, G], [x, top], [x + w, top], [x + w, G]], "faint", false, { over: 3, bow: 1.6 });
    for (let wy = top + 14; wy < G - 24; wy += 21)
      for (let wx = x + 9; wx < x + w - 12; wx += 15) if (s.r(0, 1) < 0.32) s.line([wx, wy], [wx + 6, wy], "faint", { over: 0.4, bow: 0.2 });
  }
  // a mobile mast behind the weaving shed
  const mx = 794;
  s.line([mx - 15, G], [mx - 3, 44], "faint", { over: 2 });
  s.line([mx + 15, G], [mx + 3, 44], "faint", { over: 2 });
  for (let y = 70; y < G - 10; y += 26) {
    const k = (y - 44) / (G - 44);
    const l = mx - 3 - 12 * k;
    const r = mx + 3 + 12 * k;
    s.line([l, y], [r + 1.5, y + 20], "faint", { over: 0.5, bow: 0.3 });
    s.line([r, y], [l - 1.5, y + 20], "faint", { over: 0.5, bow: 0.3 });
  }
  s.line([mx - 12, 52], [mx + 12, 52], "faint");
  for (const ax of [mx - 9, mx + 1, mx + 9]) s.rect(ax - 2, 30, 4, 16, "faint", { over: 0.4 });
  // birds, far up
  for (const [bx, by] of [[1290, 70], [1316, 58], [1338, 76]] as P[]) s.curve([[bx - 6, by - 3], [bx - 2, by], [bx, by + 1], [bx + 2, by], [bx + 6, by - 3]], "line", 0.2);
}

function clouds(s: Sketch) {
  for (const [cx, cy, w] of [[318, 66, 96], [1040, 50, 128], [1490, 104, 74]]) {
    s.line([cx - w / 2, cy], [cx + w / 2, cy], "faint", { over: 4, bow: 0.6 });
    const n = Math.round(w / 26);
    for (let i = 0; i < n; i++) {
      const bx = cx - w / 2 + ((i + 0.5) * w) / n;
      const r = (w / n) * s.r(0.55, 0.85) * (i === Math.floor(n / 2) ? 1.35 : 1);
      s.ellipse(bx, cy, r, r * 0.8, "faint", { from: Math.PI, to: Math.PI * 2 });
    }
  }
}

/* ------------------------------------------------------------------ street furniture */

function lamp(s: Sketch, x: number) {
  s.line([x, G], [x + 1, 186], "ink", { twice: true });
  s.curve([[x + 1, 190], [x + 7, 177], [x + 21, 172], [x + 34, 178]], "ink", 0.3);
  s.poly([[x + 27, 178], [x + 42, 178], [x + 38, 189], [x + 31, 189]], "ink", true, { over: 0.8 });
  s.rect(x - 6, G - 14, 13, 14, "line", { over: 1 });
}

function pole(s: Sketch, x: number) {
  s.line([x, G], [x + 1, 134], "ink", { twice: true });
  s.line([x - 19, 146], [x + 20, 143], "ink");
  for (const ix of [x - 15, x + 16]) s.ellipse(ix, 140, 2.4, 3, "line");
  s.rect(x - 7, 300, 14, 20, "line", { over: 0.8 }); // posters stuck on the pole
  s.hatchRect(x - 6, 301, 12, 18, { angle: 30, gap: 3 });
}

function tree(s: Sketch, x: number) {
  const cx = x;
  const cy = G - 176;
  const rx = 38;
  const ry = 44;
  // paper behind the canopy, so nothing shows through the leaves
  const rim: P[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    rim.push([cx + Math.cos(a) * rx * 1.08, cy + Math.sin(a) * ry * 1.08]);
  }
  s.fill(rim);
  s.curve([[x - 6, G], [x - 5, G - 50], [x - 4, G - 96], [x - 10, G - 128]], "ink", 0.4);
  s.curve([[x + 6, G], [x + 5, G - 52], [x + 4, G - 98], [x + 12, G - 132]], "ink", 0.4);
  s.curve([[x - 3, G - 108], [x - 14, G - 124], [x - 24, G - 136]], "line", 0.4);
  s.curve([[x + 3, G - 112], [x + 14, G - 128], [x + 22, G - 142]], "line", 0.4);
  // a scalloped outline, lobe by lobe
  const lobes = 12;
  for (let i = 0; i < lobes; i++) {
    const a = ((i + 0.5) / lobes) * Math.PI * 2;
    const lr = s.r(10, 14);
    s.ellipse(cx + Math.cos(a) * (rx - lr * 0.55), cy + Math.sin(a) * (ry - lr * 0.55), lr, lr * 0.9, "ink", { from: a - 1.55, to: a + 1.55 });
  }
  // leaves: small strokes inside, denser on the shaded side
  for (let i = 0; i < 34; i++) {
    const a = s.r(0, Math.PI * 2);
    const d = Math.sqrt(s.r(0, 1)) * 0.78;
    const lx = cx + Math.cos(a) * rx * d;
    const ly = cy + Math.sin(a) * ry * d;
    const lr = s.r(3, 5.5);
    s.ellipse(lx, ly, lr, lr * 0.75, "line", { from: Math.PI * 0.15, to: Math.PI * 0.95 });
  }
  s.hatch([[cx + 4, cy + 6], [cx + rx - 6, cy - 6], [cx + rx - 4, cy + 18], [cx + 10, cy + ry - 8]], { angle: -42, gap: 3.8 });
  // the iron tree guard
  s.rect(x - 15, G - 38, 30, 38, "line", { over: 1.4 });
  for (let gx = x - 9; gx < x + 14; gx += 6) s.line([gx, G - 36], [gx, G - 1], "line", { over: 0.4, bow: 0.2 });
}

function wires(s: Sketch) {
  const spans: [P, P][] = [
    [[-10, 156], [590, 142]],
    [[590, 142], [1182, 142]],
    [[1182, 142], [1610, 158]],
  ];
  for (const [a, b] of spans)
    for (const dy of [0, 7]) {
      const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 18 + dy];
      s.curve([[a[0], a[1] + dy], [(a[0] + m[0]) / 2, (a[1] + m[1]) / 2 + 6], m, [(m[0] + b[0]) / 2, (m[1] + b[1]) / 2 + 6], [b[0], b[1] + dy]], "line", 0.2);
    }
  // birds on the wire
  for (const bx of [824, 844, 922]) {
    const t = (bx - 590) / (1182 - 590);
    const by = 142 + 4 * 18 * t * (1 - t) + 4.5;
    s.ellipse(bx, by - 4, 4.2, 3.2, "ink");
    s.ellipse(bx + 3.5, by - 8, 2, 2, "ink");
    s.line([bx - 4, by - 3], [bx - 8, by + 1], "ink", { over: 0 });
  }
}

/* ------------------------------------------------------------------ the buildings */

function textileShop(s: Sketch, x: number, w: number, h: number) {
  const top = G - h;
  s.fill([[x - 6, top - 9], [x + w + 6, top - 9], [x + w, G], [x, G]]);
  s.line([x, G], [x, top], "ink", { twice: true });
  s.line([x + w, G], [x + w, top], "ink", { twice: true });
  s.line([x - 6, top], [x + w + 6, top], "ink");
  s.line([x - 4, top - 8], [x + w + 4, top - 8], "line");
  s.hatchRect(x + w - 12, top + 2, 11, G - top - 4, { angle: -76, gap: 5 });

  // the water tank on the roof
  const tx = x + w - 64;
  const ty = top - 8;
  s.ellipse(tx + 17, ty - 28, 17, 4.5, "ink");
  s.line([tx, ty - 28], [tx + 1, ty], "ink");
  s.line([tx + 34, ty - 28], [tx + 33, ty], "ink");
  for (const by of [ty - 19, ty - 10]) s.ellipse(tx + 17, by, 17, 3.5, "line", { from: 0, to: Math.PI });
  s.hatchRect(tx + 22, ty - 25, 10, 24, { angle: -78, gap: 3 });

  // cloth drying on the roof
  const ly = top - 40;
  s.line([x + 20, top - 9], [x + 20, ly - 4], "ink", { over: 0.6 });
  s.line([x + 156, top - 9], [x + 156, ly - 4], "ink", { over: 0.6 });
  s.curve([[x + 20, ly], [x + 60, ly + 5], [x + 104, ly + 6], [x + 156, ly]], "line", 0.2);
  const cloths: [number, number, number, string][] = [[x + 32, 26, 30, "stripes"], [x + 68, 34, 24, "dots"], [x + 112, 26, 34, "plain"]];
  for (const [cx0, cw, ch, kind] of cloths) {
    const t0 = ly + 4;
    s.fill([[cx0, t0], [cx0 + cw, t0 + 1], [cx0 + cw - 1, t0 + ch + 3], [cx0, t0 + ch + 3]]);
    s.line([cx0, t0], [cx0 + cw, t0 + 1], "ink", { over: 0.4 });
    s.line([cx0, t0], [cx0 + 1, t0 + ch], "ink", { over: 0.4 });
    s.line([cx0 + cw, t0 + 1], [cx0 + cw - 1, t0 + ch + 2], "ink", { over: 0.4 });
    const hem: P[] = [];
    for (let k = 0; k <= 6; k++) hem.push([cx0 + 1 + ((cw - 2) * k) / 6, t0 + ch + (k % 2 ? 3 : 0)]);
    s.curve(hem, "ink", 0.2);
    if (kind === "stripes") s.hatchRect(cx0 + 2, t0 + 2, cw - 4, ch - 3, { angle: 90, gap: 4.5, layer: "line", trim: 0.3 });
    if (kind === "dots") for (let k = 0; k < 7; k++) s.ellipse(cx0 + s.r(5, cw - 5), t0 + s.r(5, ch - 4), 1.6, 1.6, "line");
    if (kind === "plain") s.line([cx0 + cw * 0.6, t0 + 3], [cx0 + cw * 0.5, t0 + ch - 2], "hatch", { over: 0 });
    s.line([cx0 + 4, t0 - 4], [cx0 + 4, t0 + 2], "ink", { over: 0 });
    s.line([cx0 + cw - 4, t0 - 4], [cx0 + cw - 4, t0 + 2], "ink", { over: 0 });
  }

  // upper floor
  windowPane(s, x + 26, top + 16, 58, 56, { grille: true, dark: true });
  windowPane(s, x + w - 84, top + 16, 58, 56, { grille: true });
  // balcony with a potted plant
  const by = top + 80;
  s.line([x + 14, by], [x + w - 14, by], "ink");
  s.line([x + 14, by + 18], [x + w - 14, by + 18], "line");
  for (let bx = x + 20; bx < x + w - 16; bx += 8) s.line([bx, by + 1], [bx, by + 17], "line", { over: 0.3, bow: 0.2 });
  s.poly([[x + w - 46, by - 1], [x + w - 30, by - 1], [x + w - 33, by - 14], [x + w - 43, by - 14]], "ink", true, { over: 0.6 });
  s.scribble(x + w - 38, by - 24, 11, 9, 2, "line");

  // the signboard: no words, only the marks of lettering
  s.rect(x + 16, top + 104, w - 32, 26, "ink");
  lettering(s, x + 30, top + 117, w - 60);

  // the awning: stripes and a scalloped edge
  const ay = top + 134;
  const ah = 20;
  const ax = x + 4;
  const aw = w - 8;
  s.line([ax + 8, ay], [ax + aw - 8, ay], "ink");
  s.line([ax + 8, ay], [ax, ay + ah], "ink");
  s.line([ax + aw - 8, ay], [ax + aw, ay + ah], "ink");
  const n = 9;
  const seg = aw / n;
  for (let i = 0; i < n; i++) {
    const sx = ax + i * seg;
    s.ellipse(sx + seg / 2, ay + ah, seg / 2, seg * 0.28, "ink", { from: 0, to: Math.PI });
    const top0 = ax + 8 + ((aw - 16) * i) / n;
    const top1 = ax + 8 + ((aw - 16) * (i + 1)) / n;
    if (i > 0) s.line([top0, ay + 1], [sx, ay + ah], "line", { over: 0.4 });
    if (i % 2 === 0) s.hatch([[top0, ay + 1], [top1, ay + 1], [sx + seg, ay + ah], [sx, ay + ah]], { angle: -82, gap: 2.8 });
  }

  // the shop: shutter half up, bolts of cloth on the shelves
  const oy = ay + ah + 8;
  const ox = x + 14;
  const ow = w - 28;
  s.line([ox, oy], [ox, G], "ink");
  s.line([ox + ow, oy], [ox + ow, G], "ink");
  for (let y = oy + 3; y < oy + 20; y += 4.5) s.line([ox + 2, y], [ox + ow - 2, y], "line", { over: 0.5, bow: 0.3 });
  s.line([ox, oy + 22], [ox + ow, oy + 22], "ink");
  s.rect(ox + ow / 2 - 7, oy + 22, 14, 4, "line", { over: 0.3 });
  for (const sy of [oy + 46, oy + 68]) {
    s.line([ox + 4, sy], [ox + ow - 4, sy], "line");
    for (let bx = ox + 14; bx < ox + ow - 8; bx += 16) {
      s.ellipse(bx, sy - 8, 7, 7, "ink");
      s.ellipse(bx, sy - 8, 2.4, 2.4, "line");
    }
  }
  s.hatchRect(ox + 2, oy + 24, ow - 4, 13, { angle: -60, gap: 4 });

}

function bolts(s: Sketch, x: number, n: number) {
  for (let i = 0; i < n; i++) {
    const bx = x + i * 19;
    const hh = 46 + (i % 2) * 12 + (i === 2 ? 6 : 0);
    s.line([bx, G], [bx, G - hh], "ink", { over: 0.8 });
    s.line([bx + 16, G], [bx + 16, G - hh], "ink", { over: 0.8 });
    s.ellipse(bx + 8, G - hh, 8, 3.2, "ink");
    s.ellipse(bx + 8, G - hh, 2.6, 1.2, "line");
    s.hatchRect(bx + 10, G - hh + 4, 5, hh - 6, { angle: -72, gap: 3 });
    if (i % 2) for (let k = 0; k < 3; k++) s.line([bx + 1, G - hh + 10 + k * 13], [bx + 15, G - hh + 4 + k * 13], "line", { over: 0, bow: 0.2 });
  }
}

function office(s: Sketch, x: number, w: number, h: number) {
  const top = G - h;
  s.fill([[x - 6, top - 10], [x + w + 6, top - 10], [x + w, G], [x, G]]);
  s.line([x, G], [x, top], "ink", { twice: true });
  s.line([x + w, G], [x + w, top], "ink", { twice: true });
  s.line([x - 6, top], [x + w + 6, top], "ink");
  s.line([x - 3, top - 9], [x + w + 3, top - 9], "line");
  s.hatchRect(x + w - 13, top + 2, 12, G - top - 4, { angle: -76, gap: 5 });
  // the stair room and a dish on the roof
  s.rect(x + 16, top - 30, 40, 21, "ink", { over: 1 });
  s.rect(x + 26, top - 24, 10, 15, "line", { over: 0.4 });
  s.line([x + w - 40, top - 9], [x + w - 36, top - 30], "line");
  s.ellipse(x + w - 33, top - 34, 12, 6, "ink", { from: Math.PI * 0.85, to: Math.PI * 1.95 });

  const ground = 82;
  const floorH = (h - ground - 12) / 3;
  for (let f = 0; f < 3; f++) {
    const fy = top + 12 + f * floorH;
    if (f > 0) s.line([x + 2, fy - 4], [x + w - 2, fy - 4], "line", { over: 0.6 });
    for (let k = 0; k < 3; k++) {
      const wx = x + 16 + k * ((w - 32 - 34) / 2);
      windowPane(s, wx, fy + 8, 34, 42, { dark: (f * 3 + k) % 4 === 1 });
      if ((f + k) % 3 === 0) {
        // an AC unit under the window
        s.rect(wx + 4, fy + 56, 26, 12, "line", { over: 0.6 });
        s.ellipse(wx + 11, fy + 62, 3.5, 3.5, "line");
        for (let gx = wx + 18; gx < wx + 28; gx += 3) s.line([gx, fy + 58], [gx, fy + 66], "hatch", { over: 0 });
      }
    }
  }
  // the entrance
  const dx = x + w / 2 - 22;
  const dy = G - 64;
  s.rect(dx, dy, 44, 64, "ink");
  s.line([dx + 22, dy + 2], [dx + 22, G - 1], "line");
  s.hatchRect(dx + 2, dy + 2, 18, 58, { angle: -58, gap: 3.4 });
  s.rect(dx - 18, dy - 12, 80, 6, "ink", { over: 1 });
  s.line([dx - 12, dy - 6], [dx - 2, dy + 8], "line");
  s.line([dx + 56, dy - 6], [dx + 46, dy + 8], "line");
  s.line([dx - 10, G - 4], [dx + 54, G - 4], "line");
  for (const wx of [x + 12, x + w - 50]) windowPane(s, wx, G - 60, 38, 34, { dark: true });
}

function weavingShed(s: Sketch, x: number, w: number, wallH: number) {
  const top = G - wallH;
  const n = 4;
  const tw = w / n;
  const teeth = 44;
  const outline: P[] = [[x - 4, top]];
  for (let i = 0; i < n; i++) outline.push([x + i * tw, top - teeth], [x + (i + 1) * tw, top]);
  s.fill([...outline, [x + w, G], [x, G]]);
  for (let i = 0; i < n; i++) {
    const xi = x + i * tw;
    s.line([xi, top + 1], [xi, top - teeth], "ink");
    s.line([xi, top - teeth], [xi + tw + 3, top + 2], "ink", { twice: i % 2 === 0 });
    s.line([xi + 3, top - teeth + 6], [xi + 3, top - 4], "line", { over: 0.4 }); // north-light glazing
    for (let gy = top - teeth + 12; gy < top - 4; gy += 8) s.line([xi, gy], [xi + 3, gy], "line", { over: 0 });
    s.hatch([[xi + 6, top - teeth + 4], [xi + tw - 4, top - 1], [xi + 6, top - 1]], { angle: 34, gap: 5 });
  }
  s.line([x - 6, top], [x + w + 6, top], "ink");
  s.line([x, top], [x, G], "ink", { twice: true });
  s.line([x + w, top], [x + w, G], "ink", { twice: true });
  s.hatchRect(x + w - 12, top + 2, 11, wallH - 4, { angle: -76, gap: 5 });
  // high ribbon windows
  for (let k = 0; k < 6; k++) windowPane(s, x + 16 + k * 38, top + 14, 24, 14, { dark: true });

  // the chimney, still warm
  const cx = x + w - 40;
  s.rect(cx, top - 112, 18, 112 - teeth + 30, "ink");
  s.rect(cx - 3, top - 118, 24, 7, "ink", { over: 1 });
  for (const yy of [top - 92, top - 70]) s.line([cx, yy], [cx + 18, yy], "line", { over: 0.4 });
  s.scribble(cx + 10, top - 134, 9, 7, 1.6, "faint");
  s.scribble(cx + 22, top - 154, 13, 9, 1.8, "faint");
  s.scribble(cx + 40, top - 176, 18, 11, 2, "faint");

  // the door: half slid open on a loom at work
  const dw = 108;
  const dx = x + w * 0.34;
  const dh = 112;
  s.rect(dx, G - dh, dw, dh, "ink");
  s.line([dx - 8, G - dh - 6], [dx + dw + 52, G - dh - 6], "line"); // the track
  s.rect(dx - 2, G - dh, dw / 2, dh, "ink", { over: 1 });
  s.line([dx, G - dh + 2], [dx + dw / 2 - 2, G - 2], "line");
  s.line([dx + dw / 2 - 2, G - dh + 2], [dx, G - 2], "line");
  const lx = dx + dw / 2 + 4;
  const lw = dw / 2 - 8;
  s.line([lx, G - 92], [lx + lw, G - 92], "ink");
  s.line([lx, G - 34], [lx + lw, G - 34], "ink");
  for (let tx = lx + 3; tx < lx + lw - 1; tx += 3.2) s.line([tx, G - 91], [tx + 0.6, G - 35], "hatch", { over: 0, bow: 0.15 });
  s.ellipse(lx + lw / 2, G - 26, lw / 2, 5, "ink");
  s.line([lx + 2, G - 21], [lx + 2, G - 4], "line");
  s.line([lx + lw - 2, G - 21], [lx + lw - 2, G - 4], "line");
  // a plaque and a few bricks
  s.rect(dx + dw + 14, G - 86, 46, 20, "ink", { over: 0.8 });
  lettering(s, dx + dw + 20, G - 76, 34);
  for (const [bx, by] of [[x + 22, G - 58], [x + w - 70, G - 44]] as P[])
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3 - r; c++) s.rect(bx + c * 14 + (r % 2) * 7, by + r * 7, 12, 6, "line", { over: 0.5, bow: 0.3 });
}

function warehouse(s: Sketch, x: number, w: number, wallH: number) {
  const top = G - wallH;
  const apex: P = [x + w / 2, top - 58];
  s.fill([[x - 12, top + 3], apex, [x + w + 12, top + 3], [x + w, G], [x, G]]);
  s.line([x - 12, top + 4], apex, "ink", { twice: true });
  s.line(apex, [x + w + 12, top + 4], "ink", { twice: true });
  s.line([x - 2, top - 2], [apex[0], apex[1] + 8], "line", { over: 0.5 });
  s.line([apex[0], apex[1] + 8], [x + w + 2, top - 2], "line", { over: 0.5 });
  s.ellipse(apex[0], top - 24, 10, 10, "ink");
  for (const vy of [-28, -24, -20]) s.line([apex[0] - 7, top + vy], [apex[0] + 7, top + vy], "line", { over: 0 });
  s.line([x, top], [x, G], "ink", { twice: true });
  s.line([x + w, top], [x + w, G], "ink", { twice: true });
  s.line([x, top], [x + w, top], "line");
  // corrugated cladding either side of the door
  const dx = x + w * 0.28;
  const dw = w * 0.44;
  const dh = 98;
  s.hatchRect(x + 2, top + 3, dx - x - 6, wallH - 6, { angle: 90, gap: 6, trim: 0.6 });
  s.hatchRect(dx + dw + 4, top + 3, x + w - dx - dw - 6, wallH - 6, { angle: 90, gap: 6, trim: 0.6 });
  // the doorway, dark, a sign above it
  s.rect(dx, G - dh, dw, dh, "ink");
  s.hatchRect(dx + 2, G - dh + 2, dw - 4, dh - 4, { angle: -58, gap: 3.6 });
  s.rect(dx + 10, G - dh - 26, dw - 20, 18, "ink", { over: 0.8 });
  lettering(s, dx + 20, G - dh - 17, dw - 40);
  // boxes stacked outside, a pallet truck carrying more
  box(s, x + 10, G, 24);
  box(s, x + 38, G, 22);
  box(s, x + 20, G - 24, 22);
  const px = dx + dw + 10;
  s.rect(px, G - 8, 46, 5, "ink", { over: 0.8 });
  s.line([px + 46, G - 6], [px + 62, G - 44], "ink");
  s.line([px + 56, G - 46], [px + 68, G - 42], "ink", { over: 0.5 });
  s.ellipse(px + 44, G - 2, 3, 3, "line");
  box(s, px + 4, G - 8, 26);
}

function lowWall(s: Sketch, x1: number, x2: number) {
  const y = G - 30;
  s.fill([[x1, y - 4], [x2, y - 4], [x2, G], [x1, G]]);
  s.line([x1, y], [x2, y], "ink");
  s.line([x1 - 2, y - 4], [x2 + 2, y - 4], "line");
  s.line([x1, y], [x1, G], "ink");
  for (let bx = x1 + 6; bx < x2 - 14; bx += 34) s.rect(bx, y + 6 + (bx % 2) * 6, 14, 6, "line", { over: 0.4, bow: 0.2 });
  for (const wx of [x1 + 24, x1 + 98, x2 - 30]) s.scribble(wx, G - 4, 7, 4, 1.4, "line");
}

function tradeHouse(s: Sketch, x: number, w: number, h: number) {
  const top = G - h;
  s.fill([[x - 8, top - 12], [x + w + 8, top - 12], [x + w, G], [x, G]]);
  s.line([x, G], [x, top], "ink", { twice: true });
  s.line([x + w, G], [x + w, top], "ink", { twice: true });
  s.line([x - 8, top], [x + w + 8, top], "ink");
  s.line([x - 8, top - 8], [x + w + 8, top - 8], "ink");
  for (let dx = x - 4; dx < x + w + 6; dx += 7) s.line([dx, top - 7], [dx, top - 1], "line", { over: 0 });
  s.hatchRect(x + w - 12, top + 2, 11, h - 4, { angle: -76, gap: 5 });
  // the chhatri on the corner
  const cx = x + w - 36;
  s.line([cx - 16, top - 9], [cx - 16, top - 40], "ink");
  s.line([cx + 16, top - 9], [cx + 16, top - 40], "ink");
  s.line([cx - 22, top - 40], [cx + 22, top - 40], "ink");
  s.ellipse(cx, top - 40, 20, 18, "ink", { from: Math.PI, to: Math.PI * 2 });
  s.line([cx, top - 58], [cx, top - 68], "ink", { over: 0.4 });
  s.ellipse(cx, top - 70, 2.2, 2.2, "ink");
  s.hatch([[cx + 4, top - 54], [cx + 18, top - 44], [cx + 6, top - 41]], { angle: -60, gap: 3 });
  // arched windows above a carved balcony
  for (let k = 0; k < 3; k++) windowPane(s, x + 22 + k * 66, top + 22, 38, 56, { arch: true, dark: k === 1 });
  const by = top + 88;
  s.rect(x + 12, by, w - 24, 22, "ink", { over: 1.2 });
  s.hatchRect(x + 14, by + 2, w - 28, 18, { angle: 45, gap: 6, layer: "line", trim: 0.4 });
  s.hatchRect(x + 14, by + 2, w - 28, 18, { angle: -45, gap: 6, layer: "line", trim: 0.4 });
  // the shop below: a signboard, a glass front, the door
  s.rect(x + 14, top + 118, w - 28, 24, "ink");
  lettering(s, x + 28, top + 130, w - 60);
  const gy = top + 150;
  s.rect(x + 16, gy, w - 104, G - gy, "ink");
  for (const k of [0.18, 0.42, 0.7]) s.line([x + 16 + (w - 104) * k, G - 12], [x + 16 + (w - 104) * k + 26, gy + 14], "hatch", { over: 0 });
  s.line([x + 16, gy + 26], [x + w - 88, gy + 26], "line", { over: 0.6 });
  const dx = x + w - 72;
  s.rect(dx, gy, 48, G - gy, "ink");
  s.hatchRect(dx + 2, gy + 2, 44, G - gy - 4, { angle: -58, gap: 3.6 });
  s.ellipse(dx + 40, gy + 34, 2, 2, "line");
}

/* ------------------------------------------------------------------ vehicles */

function tempo(s: Sketch, x: number, y: number) {
  // the cab
  s.fill([[x, y - 18], [x + 4, y - 60], [x + 28, y - 72], [x + 56, y - 70], [x + 56, y - 18]]);
  s.curve([[x, y - 18], [x + 1, y - 44], [x + 6, y - 62], [x + 28, y - 72], [x + 56, y - 70]], "ink", 0.3);
  s.line([x + 56, y - 70], [x + 56, y - 18], "ink");
  s.poly([[x + 10, y - 60], [x + 30, y - 66], [x + 42, y - 64], [x + 40, y - 44], [x + 8, y - 44]], "ink", true, { over: 0.6 });
  s.hatch([[x + 12, y - 58], [x + 30, y - 64], [x + 40, y - 62], [x + 38, y - 46], [x + 10, y - 46]], { angle: -60, gap: 3.6 });
  s.ellipse(x + 6, y - 30, 4, 4, "ink");
  // the bed and its load
  s.fill([[x + 56, y - 52], [x + 166, y - 52], [x + 166, y - 18], [x + 56, y - 18]]);
  s.rect(x + 56, y - 52, 110, 32, "ink");
  for (let rx = x + 68; rx < x + 166; rx += 13) s.line([rx, y - 51], [rx, y - 21], "line", { over: 0.3, bow: 0.2 });
  s.line([x + 20, y - 18], [x + 168, y - 18], "ink");
  box(s, x + 66, y - 52, 26);
  box(s, x + 100, y - 52, 30);
  box(s, x + 82, y - 78, 22);
  // wheels
  for (const wx of [x + 22, x + 136]) {
    s.ellipse(wx, y - 11, 12, 12, "ink");
    s.ellipse(wx, y - 11, 4, 4, "line");
    s.ellipse(wx, y - 13, 16, 9, "line", { from: Math.PI * 1.05, to: Math.PI * 1.95 });
  }
  s.hatchRect(x + 6, y - 1, 156, 6, { angle: -18, gap: 4 });
}

function scooter(s: Sketch, x: number, y: number) {
  s.fill([[x - 2, y - 12], [x + 6, y - 28], [x + 32, y - 30], [x + 38, y - 14], [x + 54, y - 40], [x + 60, y - 14]]);
  s.curve([[x - 2, y - 12], [x + 4, y - 26], [x + 18, y - 30], [x + 32, y - 30]], "ink", 0.3);
  s.curve([[x + 32, y - 30], [x + 36, y - 16], [x + 46, y - 16]], "ink", 0.3);
  s.curve([[x + 46, y - 16], [x + 52, y - 30], [x + 56, y - 44]], "ink", 0.3);
  s.line([x + 56, y - 44], [x + 58, y - 52], "ink");
  s.line([x + 50, y - 53], [x + 66, y - 51], "ink");
  s.ellipse(x + 60, y - 42, 3, 3, "line");
  s.rect(x + 8, y - 34, 22, 5, "ink", { over: 0.6 });
  for (const wx of [x + 10, x + 62]) {
    s.ellipse(wx, y - 8, 8.5, 8.5, "ink");
    s.ellipse(wx, y - 8, 2.6, 2.6, "line");
  }
  s.hatchRect(x - 2, y + 1, 72, 5, { angle: -18, gap: 4 });
}

/* ------------------------------------------------------------------ the street and the route */

function street(s: Sketch) {
  for (const [a, b] of [[-10, 380], [376, 790], [786, 1210], [1206, 1610]]) s.line([a, G], [b, G], "ink", { bow: 0.8 });
  for (const [a, b] of [[-10, 520], [516, 1060], [1056, 1610]]) s.line([a, G + 7], [b, G + 7], "line", { bow: 0.6 });
  for (let kx = 14; kx < 1600; kx += 32) s.line([kx, G + 1], [kx + 1, G + 6], "line", { over: 0 });
  for (let rx = 20; rx < 1600; rx += 66) s.line([rx, 452], [rx + 30, 452], "line", { over: 0.6, bow: 0.3 });
  for (let i = 0; i < 30; i++) {
    const px = s.r(0, 1600);
    const py = s.r(G + 12, 466);
    s.line([px, py], [px + s.r(2, 5), py + s.r(-1, 1)], "hatch", { over: 0 });
  }
}

function routeAlong(s: Sketch) {
  const y = G + 24;
  const doors: P[] = [
    [184, G - 2], // the textile shop
    [477, G - 2], // the office
    [757, G - 2], // the weaving shed
    [1031, G - 2], // the warehouse
    [1532, G - 2], // the trading house
  ];
  s.route([[-10, y], [1610, y]]);
  for (const d of doors) {
    s.route([[d[0], y], d]);
    s.node(d);
  }
  s.node([1300, y]); // the tempo, on its way
}
