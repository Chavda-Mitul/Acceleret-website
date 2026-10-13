import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { baseOpenGraph } from "@/content/seo";
import { caseStudies, getCaseStudy } from "@/content/work";
import { CtaBand } from "@/components/CtaBand";
import { Spine } from "@/components/motion/Spine";
import { InView } from "@/components/motion/InView";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = getCaseStudy(slug);
  if (!c) return {};
  const title = `${c.title} | Work | Acceleret`;
  return {
    title,
    description: `${c.client}: ${c.result}`,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { ...baseOpenGraph, title, description: c.result, url: `/work/${c.slug}`, type: "article" },
    // Sample case studies exist only to review the layout; keep them out of search.
    robots: c.sample ? { index: false, follow: true } : undefined,
  };
}

/*
 * The static shell (route, back link, closing CTA) renders immediately; the
 * case study itself depends on the URL, so it sits inside <Suspense>. Every
 * slug is prerendered by generateStaticParams, so visitors get it all in the HTML.
 */
export default function CaseStudyPage(props: PageProps<"/work/[slug]">) {
  return (
    <>
      <article className="case" aria-labelledby="case-title">
        <Spine />
        <div className="wrap">
          <p className="case__back">
            <Link href="/work" className="link">
              All work
            </Link>
          </p>
          <Suspense fallback={<CaseFallback />}>
            <CaseBody params={props.params} />
          </Suspense>
        </div>
      </article>
      <CtaBand />
    </>
  );
}

function CaseFallback() {
  return (
    <div className="case__fallback" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

async function CaseBody({ params }: { params: PageProps<"/work/[slug]">["params"] }) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Work", path: "/work" },
          { name: c.title, path: `/work/${c.slug}` },
        ])}
      />
      {c.sample ? (
        <p className="case__sample" role="note">
          <span className="pending-tag">Sample</span> Layout preview with placeholder text. The founders&apos; case
          studies replace this before launch.
        </p>
      ) : null}
      <header className="case__head">
        <p className="case__client">{c.client}</p>
        <SplitHeading as="h1" id="case-title" className="t-h1 case__title" sketch onLoad>
          {c.title}
        </SplitHeading>
        <p className="t-lead case__result">{c.result}</p>
      </header>

      <Reveal as="ol" className="case__route" stagger>
        <li className="case__part" data-kind="situation">
          <h2 className="case__label">The situation</h2>
          <p className="case__text">{c.situation}</p>
        </li>
        <li className="case__part" data-kind="built">
          <h2 className="case__label">What we built</h2>
          <p className="case__text">{c.whatWeBuilt}</p>
          <ul className="case__features">
            {c.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </li>
        <li className="case__part" data-kind="changed">
          <h2 className="case__label">What changed</h2>
          <InView as="ul" className="case__outcomes" threshold={0.3}>
            {c.outcomes.map((o, i) => (
              <li key={o.label} className="rise" style={{ "--rise-delay": `${i * 0.12}s` } as React.CSSProperties}>
                {o.value ? <span className="case__value">{o.value}</span> : null}
                <span className="case__outcome">{o.label}</span>
              </li>
            ))}
          </InView>
        </li>
      </Reveal>

      {c.quote ? (
        <figure className="case__quote">
          <blockquote>
            <p>{c.quote.text}</p>
          </blockquote>
          <figcaption>
            {c.quote.name}, {c.quote.role}
          </figcaption>
        </figure>
      ) : null}
    </>
  );
}
