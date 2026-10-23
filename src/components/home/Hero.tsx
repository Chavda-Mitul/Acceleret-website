import Link from "next/link";
import { hero } from "@/content/home";
import { site } from "@/content/site";
import { HeroSystems } from "./HeroSystems";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { VenomString } from "@/components/motion/VenomString";
import { Note } from "@/components/Note";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__inner">
        <div className="hero__text">
          <SplitHeading as="h1" id="hero-title" className="t-display hero__title" sketch onLoad>
            {hero.headline}
          </SplitHeading>
          <p className="t-lead hero__sub">{hero.sub}</p>
          <div className="hero__actions">
            <Link href={site.primaryCta.href} className="btn">
              {site.primaryCta.label}
              <span className="btn-node" aria-hidden />
              <VenomString />
            </Link>
            <Link href={hero.secondaryCta.href} className="btn btn-ghost">
              {hero.secondaryCta.label}
            </Link>
            <Note arrow="left" size="sm" className="hero__note">
              a 30-minute call
            </Note>
          </div>
        </div>
      </div>
      <HeroSystems />
      <p className="hero__cue" aria-hidden>
        follow the line
        <svg viewBox="0 0 24 40" focusable={false}>
          <path d="M12 2 C 10 14, 14 22, 12 34 M6 28 L12 35 L18 28" />
        </svg>
      </p>
    </section>
  );
}
