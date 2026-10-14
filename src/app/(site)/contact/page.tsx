import type { Metadata } from "next";
import { baseOpenGraph, seo } from "@/content/seo";
import { site, addressText, phoneHref, whatsappHref } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { localBusinessJsonLd } from "@/lib/schema";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { SketchFrame } from "@/components/motion/SketchFrame";
import { SplitHeading } from "@/components/motion/SplitHeading";

export const metadata: Metadata = {
  title: seo.contact.title,
  description: seo.contact.description,
  alternates: { canonical: "/contact" },
  openGraph: { ...baseOpenGraph, title: seo.contact.title, description: seo.contact.description, url: "/contact" },
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
          <SketchFrame radius={28} seed={17} priority>
            <div className="contact__form">
              <ContactForm />
            </div>
          </SketchFrame>

          <aside id="reach" className="contact__reach" aria-labelledby="reach-title">
            <SplitHeading id="reach-title" className="t-h4" sketch>
              Reach us directly
            </SplitHeading>
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
              {contact.facebook ? (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Acceleret on Facebook">
                  <FacebookIcon />
                </a>
              ) : null}
              {!contact.linkedin && !contact.instagram && !contact.facebook && showPending ? (
                <span className="pending-tag">Social links pending</span>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
