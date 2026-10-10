import Link from "next/link";
import { site, addressText, phoneHref, whatsappHref } from "@/content/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";
import { InstagramIcon, LinkedInIcon } from "@/components/icons";
import { MotionSwitch } from "@/components/motion/MotionToggle";

/** Footer (brief §3): white logo on deep blue, tagline, three columns, copyright. No Acceleret Media. */
export function Footer() {
  const { contact, showPending } = site;
  const tel = phoneHref();
  const wa = whatsappHref();

  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" aria-label={`${site.name} home`}>
            <Logo tone="white" />
          </Link>
          <p className="site-footer__tagline">
            {site.tagline.split(" > ").map((word, i, all) => (
              <span key={word}>
                {word}
                {i < all.length - 1 ? (
                  <span className="site-footer__chev" aria-hidden>
                    {" > "}
                  </span>
                ) : null}
              </span>
            ))}
          </p>
        </div>

        <nav className="site-footer__col" aria-labelledby="footer-services">
          <h2 id="footer-services">Services</h2>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/services#${s.id}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__col" aria-labelledby="footer-company">
          <h2 id="footer-company">Company</h2>
          <ul>
            {site.companyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col">
          <h2>Contact</h2>
          <ul>
            <li>
              <address>{addressText()}</address>
            </li>
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            {tel ? (
              <li>
                <a href={tel}>{contact.phone}</a>
              </li>
            ) : showPending ? (
              <li>
                <span className="pending-tag pending-tag--dark">Phone number pending</span>
              </li>
            ) : null}
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
          <div className="site-footer__social">
            {contact.linkedin ? (
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Acceleret on LinkedIn">
                <LinkedInIcon size={20} />
              </a>
            ) : null}
            {contact.instagram ? (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Acceleret on Instagram">
                <InstagramIcon size={20} />
              </a>
            ) : null}
            {!contact.linkedin && !contact.instagram && showPending ? (
              <span className="pending-tag pending-tag--dark">LinkedIn and Instagram links pending</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="wrap site-footer__base">
        <p>{site.copyright}</p>
        <MotionSwitch />
      </div>
    </footer>
  );
}
