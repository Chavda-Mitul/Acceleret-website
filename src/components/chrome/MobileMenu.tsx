"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site, whatsappHref } from "@/content/site";
import { isActive } from "./NavLinks";
import { Logo } from "./Logo";

export function MobileMenuButton({ onClick, open = false }: { onClick?: () => void; open?: boolean }) {
  return (
    <button
      type="button"
      className="menu-button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="mobile-menu"
      onClick={onClick}
    >
      <span className="menu-button__label">Menu</span>
      <span className="menu-button__lines" aria-hidden>
        <span />
        <span />
      </span>
    </button>
  );
}

/** Full-screen navigation for small screens, built on <dialog> for focus handling and Esc. */
export function MobileMenu() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const wa = whatsappHref();

  const show = () => {
    dialog.current?.showModal();
    document.documentElement.dataset.menuOpen = "true";
    window.__lenis?.stop();
    setOpen(true);
  };
  const close = () => dialog.current?.close();

  // Keep the page state in step however the dialog closes (button, link, Esc).
  const onClose = () => {
    delete document.documentElement.dataset.menuOpen;
    window.__lenis?.start();
    setOpen(false);
  };

  // Close on any route change, including browser Back/Forward, which never touches a menu link.
  useEffect(() => {
    if (dialog.current?.open) dialog.current.close();
  }, [pathname]);

  // A transient menu should not survive the page being hidden (Activity).
  useLayoutEffect(() => {
    const d = dialog.current;
    return () => {
      if (d?.open) d.close();
      delete document.documentElement.dataset.menuOpen;
    };
  }, []);

  return (
    <>
      <MobileMenuButton onClick={show} open={open} />
      <dialog ref={dialog} id="mobile-menu" className="mobile-menu" aria-label="Menu" onClose={onClose}>
        <div className="mobile-menu__top wrap">
          <Link href="/" onClick={close} aria-label={`${site.name} home`}>
            <Logo tone="white" />
          </Link>
          <button type="button" className="mobile-menu__close" onClick={close}>
            Close
          </button>
        </div>
        <nav aria-label="Main" className="wrap mobile-menu__nav">
          <ol>
            {site.nav.map((item, i) => (
              <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="wrap mobile-menu__foot">
          <Link href={site.primaryCta.href} onClick={close} className="btn btn-inverse">
            {site.primaryCta.label}
            <span className="btn-node" aria-hidden />
          </Link>
          <div className="mobile-menu__contact">
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
