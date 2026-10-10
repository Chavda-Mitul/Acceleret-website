import Link from "next/link";
import { whatsappHref } from "@/content/site";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Secondary CTA (brief §1): WhatsApp click-to-chat, bottom right.
 * Until the company number is set in content/site.ts it points to the
 * contact details on /contact instead of a broken chat link.
 */
export function WhatsAppButton() {
  const href = whatsappHref();
  const inner = (
    <>
      <span className="wa-button__icon">
        <WhatsAppIcon size={26} />
      </span>
      <span className="wa-button__label">Chat on WhatsApp</span>
    </>
  );

  return href ? (
    <a className="wa-button" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with Acceleret on WhatsApp">
      {inner}
    </a>
  ) : (
    <Link className="wa-button" href="/contact#reach" aria-label="Contact Acceleret (WhatsApp number coming soon)">
      {inner}
    </Link>
  );
}
