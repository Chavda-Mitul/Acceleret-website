/**
 * Runs before first paint (inlined in layout.tsx): drops the no-js class
 * (drawings only start hidden when JavaScript is there to reveal them), sets
 * <html data-motion> to the visitor's saved choice, or "calm" when the device
 * asks for reduced motion, and marks wide screens (see WIDE_QUERY). Kept out
 * of the client module so the server can inline the string.
 */

export type MotionMode = "full" | "calm";
export const MOTION_KEY = "acc-motion";

/**
 * Screens where the home page's scroll scenes pin (ProblemScene, ServicesJourney).
 * <html data-wide> marks them before first paint, so CSS can lay those scenes
 * out at their pinned height before GSAP arrives.
 */
export const WIDE_QUERY = "(min-width: 1000px) and (min-height: 620px)";

/** No imports or helpers: its source is inlined as the <head> script. */
export function prepareDocument(key: string, wideQuery: string) {
  const d = document.documentElement;
  d.classList.remove("no-js");
  try {
    const s = localStorage.getItem(key);
    const m = s === "full" || s === "calm" ? s : matchMedia("(prefers-reduced-motion: reduce)").matches ? "calm" : "full";
    d.dataset.motion = m;
    if (s) d.dataset.motionChosen = "1";
  } catch {
    d.dataset.motion = "full";
  }
  try {
    const w = matchMedia(wideQuery);
    const f = () => {
      if (w.matches) d.dataset.wide = "1";
      else delete d.dataset.wide;
    };
    f();
    w.addEventListener("change", f);
  } catch {}
}

export const motionScript = `(${prepareDocument.toString()})(${JSON.stringify(MOTION_KEY)},${JSON.stringify(WIDE_QUERY)})`;
