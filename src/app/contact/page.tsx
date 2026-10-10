import type { Metadata } from "next";
import { seo } from "@/content/seo";
import { site, addressText, phoneHref, whatsappHref } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { localBusinessJsonLd } from "@/lib/schema";
import {
  CalendarIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { SketchFrame } from "@/components/motion/SketchFrame";

export const metadata: Metadata = {
  title: seo.contact.title,
  description: seo.contact.description,
  alternates: { canonical: "/contact" },
  openGraph: { title: seo.contact.title, description: seo.contact.description, url: "/contact" },
};

export default function ContactPage() {
  const { contact, showPending } = site;
  const tel = phoneHref();
  const wa = whatsappHref();

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <PageHero title={site.ctaBand.heading} lead={site.ctaBand.sub} note="the form takes a minute" />

      <section className="contact" aria-label="Book a walkthrough">
        <div className="wrap contact__grid">
          <SketchFrame radius={28} seed={17}>
            <div className="contact__form">
              <ContactForm />
            </div>
          </SketchFrame>

          <aside id="reach" className="contact__reach" aria-labelledby="reach-title">
            <h2 id="reach-title" className="t-h4">
              Reach us directly
            </h2>
            <ul className="reach-list">
              <li>
                <PinIcon />
                <address>{addressText()}</address>
                {!contact.addressLine && showPending ? (
                  <span className="pending-tag">Street address pending</span>
                ) : null}
              </li>
              <li>
                <MailIcon />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {tel || showPending ? (
                <li>
                  <PhoneIcon />
                  {tel ? <a href={tel}>{contact.phone}</a> : <span className="pending-tag">Phone number pending</span>}
                </li>
              ) : null}
              {wa || showPending ? (
                <li>
                  <WhatsAppIcon />
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      Chat on WhatsApp
                    </a>
                  ) : (
                    <span className="pending-tag">WhatsApp number pending</span>
                  )}
                </li>
              ) : null}
            </ul>
            <div className="reach-social">
              {contact.linkedin ? (
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Acceleret on LinkedIn">
                  <LinkedInIcon />
                </a>
              ) : null}
              {contact.instagram ? (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Acceleret on Instagram"
                >
                  <InstagramIcon />
                </a>
              ) : null}
              {!contact.linkedin && !contact.instagram && showPending ? (
                <span className="pending-tag">LinkedIn and Instagram links pending</span>
              ) : null}
            </div>

            <div className="slot">
              <CalendarIcon size={22} />
              <h2 className="t-h4">Prefer to pick a slot?</h2>
              {contact.bookingUrl ? (
                <a href={contact.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Choose a time
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <>
                  <p>
                    Email{" "}
                    <a
                      className="prose-link"
                      href={`mailto:${contact.email}?subject=${encodeURIComponent("Walkthrough: a time that suits us")}`}
                    >
                      {contact.email}
                    </a>{" "}
                    with a couple of times that suit you.
                  </p>
                  {showPending ? <span className="pending-tag">Booking link pending</span> : null}
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
