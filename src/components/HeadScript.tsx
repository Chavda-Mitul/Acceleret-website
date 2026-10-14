"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * An inline <head> script that only exists in server-rendered HTML. When React
 * builds the page in the browser instead (Next's 404 error shell), it can't run
 * an inline script and warns about it, so this renders nothing there and
 * MotionProvider applies the same setup.
 */
export function HeadScript({ html }: { html: string }) {
  const fromServer = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
  return fromServer ? <script dangerouslySetInnerHTML={{ __html: html }} /> : null;
}
