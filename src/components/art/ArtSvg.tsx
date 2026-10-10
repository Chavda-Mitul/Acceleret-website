import type { CSSProperties } from "react";
import type { Layer, Sketch } from "@/lib/sketch";

const STROKES: Layer[] = ["hatch", "line", "ink", "blue"];

/**
 * A pencil drawing (lib/sketch) as SVG, one path per layer: the far city
 * first, paper to hide it behind near things, then hatching, details, ink
 * and the blue route with its nodes. CSS draws each layer in (art.css).
 */
export function ArtSvg({ sketch, width, height }: { sketch: Sketch; width: number; height: number }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMax slice" aria-hidden focusable={false}>
      {sketch.layers.faint.length ? <path className="art__faint" d={sketch.layers.faint.join("")} pathLength={1} /> : null}
      {sketch.paper.length ? <path className="art__paper" d={sketch.paper.join("")} /> : null}
      {STROKES.map((l) =>
        sketch.layers[l].length ? <path key={l} className={`art__${l}`} d={sketch.layers[l].join("")} pathLength={1} /> : null,
      )}
      {sketch.nodes.map(([x, y], i) => (
        <circle key={i} className="art__node" cx={x} cy={y} r={5.5} style={{ "--n": i } as CSSProperties} />
      ))}
    </svg>
  );
}
