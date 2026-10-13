import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { baseOpenGraph, seo } from "@/content/seo";
import { products, productsIntro, productButtonLabel } from "@/content/products";
import { site } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { InView } from "@/components/motion/InView";
import { Spine } from "@/components/motion/Spine";
import { ExternalIcon } from "@/components/icons";
import { SketchFrame } from "@/components/motion/SketchFrame";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Note } from "@/components/Note";

export const metadata: Metadata = {
  title: seo.products.title,
  description: seo.products.description,
  alternates: { canonical: "/products" },
  openGraph: { ...baseOpenGraph, title: seo.products.title, description: seo.products.description, url: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero title={productsIntro} note="more to come" />

      <section className="section products" aria-label="Products">
        <Spine />
        <div className="wrap products__list">
          {products.map((p) => (
            <SketchFrame key={p.name} radius={30} seed={9} priority>
              <article className="product">
                <div className="product__text">
                  <div className="product__brand">
                    {p.logo ? (
                      <Image src={p.logo} alt={p.name} width={180} height={48} className="product__logo" />
                    ) : (
                      <SplitHeading className="t-h2 product__name" sketch>
                        {p.name}
                      </SplitHeading>
                    )}
                    {p.pending && site.showPending ? (
                      <span className="pending-tag">Name, logo and link pending</span>
                    ) : null}
                  </div>
                  {p.logo ? <h2 className="sr-only">{p.name}</h2> : null}
                  <Note arrow="down-left" size="sm" className="product__note">
                    built inside a working agency
                  </Note>
                  <p className="product__line">{p.line}</p>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn product__cta">
                      {productButtonLabel(p)}
                      <ExternalIcon size={18} />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="btn btn-ghost product__cta" aria-disabled="true">
                      {productButtonLabel(p)}
                      <span className="product__soon">site coming soon</span>
                    </span>
                  )}
                </div>

                {/* the product's flow, drawn as one route */}
                <InView as="ol" className="product__flow" threshold={0.3} aria-label={`${p.name} covers`}>
                  {p.flow.map((step, i) => (
                    <li key={step} className="rise" style={{ "--rise-delay": `${0.15 + i * 0.12}s` } as CSSProperties}>
                      <span className="product__node" aria-hidden />
                      {step}
                    </li>
                  ))}
                  <svg
                    className="product__route"
                    viewBox="0 0 10 100"
                    preserveAspectRatio="none"
                    aria-hidden
                    focusable={false}
                  >
                    <path
                      d="M5 0 V100"
                      pathLength={1}
                      className="draw"
                      style={{ "--draw-dur": "1.4s" } as CSSProperties}
                    />
                  </svg>
                </InView>
              </article>
            </SketchFrame>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
