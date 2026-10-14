"use client";

import { useEffect } from "react";

/**
 * Sets the tab title from the browser. Next serves 404s as a shell that React
 * builds in the browser, and that build brings back the site's default title
 * even though the server HTML (what search engines read) had the right one.
 */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
