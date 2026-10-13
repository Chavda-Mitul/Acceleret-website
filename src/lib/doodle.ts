/**
 * What the visitor is drawing with the pencil (PencilLayer), for anything on
 * the page that wants to react to it. Points are in page coordinates.
 * - "draw":  a stroke grew (fires per pointer move while drawing)
 * - "end":   the pencil lifted
 * - "clear": the doodle was rubbed out
 */

export type DoodlePoint = { x: number; y: number };
export type DoodleChange = "draw" | "end" | "clear";
type Listener = (change: DoodleChange, strokes: readonly (readonly DoodlePoint[])[]) => void;

const listeners = new Set<Listener>();

export function onDoodle(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitDoodle(change: DoodleChange, strokes: readonly { points: readonly DoodlePoint[] }[]) {
  if (!listeners.size) return;
  const lines = strokes.map((s) => s.points);
  listeners.forEach((fn) => fn(change, lines));
}
