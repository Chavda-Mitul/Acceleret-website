"use client";

import { useEffect, useState } from "react";
import { motionChosen, setMotionMode, useMotionMode } from "@/lib/motion";

/** Footer switch: full or calm motion, remembered on this device. */
export function MotionSwitch() {
  const mode = useMotionMode();
  return (
    <div className="motion-switch" role="group" aria-label="Animation">
      <span className="motion-switch__label">Animation</span>
      <button type="button" aria-pressed={mode === "full"} onClick={() => setMotionMode("full")}>
        Full
      </button>
      <button type="button" aria-pressed={mode === "calm"} onClick={() => setMotionMode("calm")}>
        Calm
      </button>
    </div>
  );
}

/**
 * When the device asks for reduced motion (and the visitor hasn't chosen),
 * the site starts calm and offers the full version once, quietly.
 */
export function MotionPrompt() {
  const mode = useMotionMode();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(mode === "calm" && !motionChosen()), 1400);
    return () => window.clearTimeout(t);
  }, [mode]);

  if (!show) return null;
  return (
    <div className="motion-prompt" role="region" aria-label="Animation setting">
      <p>Animation is calm because your device asks for reduced motion.</p>
      <div className="motion-prompt__actions">
        <button type="button" className="btn btn-sm" onClick={() => setMotionMode("full")}>
          Play full animation
          <span className="btn-node" aria-hidden />
        </button>
        <button type="button" className="motion-prompt__keep" onClick={() => setMotionMode("calm")}>
          Keep calm
        </button>
      </div>
    </div>
  );
}
