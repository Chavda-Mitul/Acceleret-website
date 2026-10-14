import type { Metadata } from "next";
import { baseOpenGraph, seo } from "@/content/seo";
import { site } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";

export const metadata: Metadata = {
  title: seo.privacy.title,
  description: seo.privacy.description,
  alternates: { canonical: "/privacy" },
  openGraph: { ...baseOpenGraph, title: seo.privacy.title, description: seo.privacy.description, url: "/privacy" },
};

/*
 * Brief §4 Privacy: short, plain language — what the form collects, that it
 * is used only to respond, no sale of data, contact for deletion.
 * FOUNDER REVIEW: the wording below is a draft written by the developer.
 * Items marked "Confirm" depend on decisions not yet made (where submissions
 * are stored, whether analytics is switched on, retention period).
 */

const UPDATED = "10 October 2026";

export default function PrivacyPage() {
  const email = site.contact.email;
  return (
    <>
      <PageHero title="Privacy" lead="What happens to the details you send us. Short and plain." />
      <section className="section privacy">
        <Spine />
        <div className="wrap privacy__inner">
          {site.showPending ? (
            <p className="privacy__review" role="note">
              <span className="pending-tag">Founder review</span> Draft wording. Items marked “Confirm” depend on
              choices still to be made.
            </p>
          ) : null}

          <div className="privacy__body">
            <SplitHeading sketch>What we collect</SplitHeading>
            <p>
              When you fill in the walkthrough form, we receive your name, company, phone number, email address and what
              you tell us about how your team works today. If you email or WhatsApp us, we receive whatever you send.
            </p>

            <SplitHeading sketch>Why we collect it</SplitHeading>
            <p>
              Only to reply to you and arrange the walkthrough you asked for. We don&apos;t add you to a mailing list,
              and we don&apos;t use your details for anything else.
            </p>

            <SplitHeading sketch>Who sees it</SplitHeading>
            <p>
              The Acceleret team. Your request is delivered to our inbox
              {/* Confirm: storage — e.g. "and kept in a private spreadsheet only the founders can open". */} by an
              email service that sends it on our behalf. We never sell or rent your information, and we don&apos;t share
              it with anyone else unless the law requires us to.
            </p>

            <SplitHeading sketch>How long we keep it</SplitHeading>
            <p>
              For as long as we&apos;re talking with you about your project, and then for up to two years so we have the
              history if you come back to us.{" "}
              {site.showPending ? <span className="privacy__confirm">Confirm</span> : null}
            </p>

            <SplitHeading sketch>Analytics</SplitHeading>
            <p>
              We may use Google Analytics to count visits and see which pages are useful. It records things like the
              pages viewed and the type of device, not your name or contact details.{" "}
              {site.showPending ? (
                <span className="privacy__confirm">Confirm once analytics is switched on</span>
              ) : null}
            </p>

            <SplitHeading sketch>Your choices</SplitHeading>
            <p>
              You can ask to see the information we hold about you, correct it, or have it deleted. Email{" "}
              <a className="prose-link" href={`mailto:${email}?subject=${encodeURIComponent("Privacy request")}`}>
                {email}
              </a>{" "}
              and we&apos;ll do it and confirm by reply.
            </p>

            <SplitHeading sketch>Contact</SplitHeading>
            <p>
              Acceleret, Surat, Gujarat, India ·{" "}
              <a className="prose-link" href={`mailto:${email}`}>
                {email}
              </a>
            </p>

            <p className="privacy__updated">Last updated {UPDATED}</p>
          </div>
        </div>
      </section>
    </>
  );
}
