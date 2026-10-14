import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { baseOpenGraph } from "@/content/seo";
import { caseShareImage, coverOf, getCaseStudies, getCaseStudy } from "@/lib/work";
import { CtaBand } from "@/components/CtaBand";
import { Spine } from "@/components/motion/Spine";
import { InView } from "@/components/motion/InView";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";

/* Cache Components needs at least one param to prerender; with no case studies yet, a placeholder 404s.
   Case studies published later render on their first visit and are cached from then on. */
export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.length ? studies.map((c) => ({ slug: c.slug })) : [{ slug: "none" }];
}

export async function generateMetadata(props: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = await getCaseStudy(slug);
  if (!c) return {};
  const title = c.meta?.title || `${c.title} | Case studies | Acceleret`;
  const description = c.meta?.description || `${c.client}: ${c.result}`;
  return {
    title,
    description,
    alternates: { canonical: c.meta?.canonical || `/case-studies/${c.slug}` },
    robots: c.meta?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      title,
      description,
      url: `/case-studies/${c.slug}`,
      images: [caseShareImage(c)],
    },
  };
}

/*
 * The static shell (route, back link, closing CTA) renders immediately; the
 * case study itself depends on the URL, so it sits inside <Suspense>. Every
 * slug is prerendered by generateStaticParams, so visitors get it all in the HTML.
 */
/*
 * The slug is checked before anything streams, so an unknown one gets a real 404
 * (once the shell is sent the status is fixed at 200). That reads params outside
 * <Suspense>, so the route blocks on its (cached) data instead of showing an
 * instant shell on client navigation.
 */
export const instant = false;

export default async function CaseStudyPage(props: PageProps<"/case-studies/[slug]">) {
  if (!(await getCaseStudy((await props.params).slug))) notFound();
  return (
    <>
      <article className="case" aria-labelledby="case-title">
        <Spine />
        <div className="wrap">
          <p className="case__back">
            <Link href="/case-studies" className="link">
              All case studies
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

async function CaseBody({ params }: { params: PageProps<"/case-studies/[slug]">["params"] }) {
  const { slug } = await params;
  const c = await getCaseStudy(slug);
  if (!c) notFound();
  const cover = coverOf(c);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Case studies", path: "/case-studies" },
          { name: c.title, path: `/case-studies/${c.slug}` },
        ])}
      />
      <header className="case__head">
        <p className="case__client">
          {c.client}
          {c.tags?.length ? <span className="case__tags">{c.tags.join(" · ")}</span> : null}
        </p>
        <SplitHeading as="h1" id="case-title" className="t-h1 case__title" sketch onLoad>
          {c.title}
        </SplitHeading>
        <p className="t-lead case__result">{c.result}</p>
      </header>

      {cover ? (
        <figure className="case__cover">
          <Image
            src={cover.sizes?.content?.url ?? cover.url!}
            alt={cover.alt}
            width={cover.sizes?.content?.width ?? cover.width ?? 1440}
            height={cover.sizes?.content?.height ?? cover.height ?? 810}
            sizes="(min-width: 1320px) 1240px, 100vw"
            priority
          />
        </figure>
      ) : null}

      <Reveal as="ol" className="case__route" stagger>
        <li className="case__part" data-kind="situation">
          <SplitHeading className="case__label" sketch>The situation</SplitHeading>
          <p className="case__text">{c.situation}</p>
        </li>
        <li className="case__part" data-kind="built">
          <SplitHeading className="case__label" sketch>What we built</SplitHeading>
          <p className="case__text">{c.whatWeBuilt}</p>
          {c.features?.length ? (
            <ul className="case__features">
              {c.features.map((f) => (
                <li key={f.id ?? f.text}>{f.text}</li>
              ))}
            </ul>
          ) : null}
          {c.techStack?.length ? (
            <p className="case__stack">
              <span className="case__stack-label">Built with</span> {c.techStack.join(", ")}
            </p>
          ) : null}
        </li>
        <li className="case__part" data-kind="changed">
          <SplitHeading className="case__label" sketch>What changed</SplitHeading>
          <InView as="ul" className="case__outcomes" threshold={0.3}>
            {(c.outcomes ?? []).map((o, i) => (
              <li key={o.id ?? o.label} className="rise" style={{ "--rise-delay": `${i * 0.12}s` } as React.CSSProperties}>
                {o.value ? <span className="case__value">{o.value}</span> : null}
                <span className="case__outcome">{o.label}</span>
              </li>
            ))}
          </InView>
        </li>
      </Reveal>

      {c.quote?.text ? (
        <figure className="case__quote">
          <blockquote>
            <p>{c.quote.text}</p>
          </blockquote>
          <figcaption>{[c.quote.name, c.quote.role, c.client].filter(Boolean).join(", ")}</figcaption>
        </figure>
      ) : null}
    </>
  );
}
