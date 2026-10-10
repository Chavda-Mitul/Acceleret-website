/**
 * Runs before first paint (inlined in layout.tsx): sets <html data-motion> to
 * the visitor's saved choice, or "calm" when the device asks for reduced
 * motion. Kept out of the client module so the server can inline the string.
 */

export type MotionMode = "full" | "calm";
export const MOTION_KEY = "acc-motion";

export const motionScript = `(function(){try{var s=localStorage.getItem("${MOTION_KEY}");var m=s==="full"||s==="calm"?s:(matchMedia("(prefers-reduced-motion: reduce)").matches?"calm":"full");document.documentElement.dataset.motion=m;if(s)document.documentElement.dataset.motionChosen="1"}catch(e){document.documentElement.dataset.motion="full"}})()`;
