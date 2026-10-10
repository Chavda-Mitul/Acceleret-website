import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/content/site";
import { Logo } from "./Logo";
import { NavLinks, NavList } from "./NavLinks";
import { MobileMenu, MobileMenuButton } from "./MobileMenu";
import { HeaderScroll } from "./HeaderScroll";

/** Sticky header (brief §3): logo left, five links, "Book a walkthrough" right. Shrinks on scroll. */
export function Header() {
  return (
    <header className="site-header" data-scrolled="false">
      <HeaderScroll />
      <div className="wrap site-header__inner">
        <Link href="/" className="site-header__logo" aria-label={`${site.name} home`}>
          <Logo />
        </Link>
        <nav aria-label="Main" className="site-nav">
          <Suspense fallback={<NavList />}>
            <NavLinks />
          </Suspense>
        </nav>
        <Link href={site.primaryCta.href} className="btn btn-sm site-header__cta">
          {site.primaryCta.label}
          <span className="btn-node" aria-hidden />
        </Link>
        <Suspense fallback={<MobileMenuButton />}>
          <MobileMenu />
        </Suspense>
      </div>
    </header>
  );
}
