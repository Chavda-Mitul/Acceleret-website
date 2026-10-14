import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { DocumentTitle } from "@/components/DocumentTitle";

const TITLE = "Page not found | Acceleret";

export const metadata: Metadata = { title: TITLE };

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="nf-title">
      <DocumentTitle title={TITLE} />
      <div className="wrap not-found__inner">
        <svg className="not-found__art" viewBox="0 0 360 120" aria-hidden focusable={false}>
          <path d="M10 60 H120 Q140 60 140 40 V30 Q140 14 156 14 H210" className="not-found__route" />
          <path d="M210 14 C 240 10, 250 60, 228 70 S 200 110, 250 96" className="not-found__pencil" />
          <text x="262" y="104" className="not-found__q">
            ?
          </text>
          <circle cx="10" cy="60" r="6" className="not-found__start" />
        </svg>
        <SplitHeading as="h1" id="nf-title" className="t-h1" sketch onLoad>
          {"This page isn't on the map."}
        </SplitHeading>
        <p className="t-lead">The link may be old, or the address may have a typo.</p>
        <div className="not-found__actions">
          <Link href="/" className="btn">
            Go to the home page
            <span className="btn-node" aria-hidden />
          </Link>
          <Link href={site.primaryCta.href} className="btn btn-ghost">
            {site.primaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
