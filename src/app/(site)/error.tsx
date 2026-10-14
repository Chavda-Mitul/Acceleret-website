"use client";

import Link from "next/link";
import { useEffect } from "react";
import { site } from "@/content/site";

/** Runtime errors inside the site chrome. Reuses the 404 page's layout. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="not-found" aria-labelledby="err-title">
      <div className="wrap not-found__inner">
        <svg className="not-found__art" viewBox="0 0 360 120" aria-hidden focusable={false}>
          <path d="M10 60 H120 Q140 60 140 40 V30 Q140 14 156 14 H210" className="not-found__route" />
          <path d="M210 14 C 240 10, 250 60, 228 70 S 200 110, 250 96" className="not-found__pencil" />
          <circle cx="10" cy="60" r="6" className="not-found__start" />
        </svg>
        <h1 id="err-title" className="t-h1">
          Something broke on our side.
        </h1>
        <p className="t-lead">Try again in a moment. If it keeps happening, write to {site.contact.email}.</p>
        <div className="not-found__actions">
          <button type="button" className="btn" onClick={() => retry()}>
            Try again
            <span className="btn-node" aria-hidden />
          </button>
          <Link href="/" className="btn btn-ghost">
            Go to the home page
          </Link>
        </div>
      </div>
    </section>
  );
}
