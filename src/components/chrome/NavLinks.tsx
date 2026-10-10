"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

export function isActive(pathname: string | undefined, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavList({ pathname, onNavigate }: { pathname?: string; onNavigate?: () => void }) {
  return (
    <ul className="nav-list">
      {site.nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className="nav-link"
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <span className="nav-link__node" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinks() {
  const pathname = usePathname();
  return <NavList pathname={pathname} />;
}
