/**
 * Site-wide settings: navigation, contact details, the shared call to action.
 *
 * Values marked PENDING are placeholders until the founders supply them
 * (brief §7: "Form destination email, phone number, WhatsApp number,
 * booking link — by 27 Oct"). Search the codebase for "PENDING" to list them.
 */

export type NavItem = { label: string; href: string };

export const site = {
  name: "Acceleret",
  url: "https://acceleret.com",
  tagline: "Build > Automate > Accelerate",

  nav: [
    { label: "Services", href: "/services" },
    { label: "How we work", href: "/how-we-work" },
    { label: "Products", href: "/products" },
    { label: "Work", href: "/work" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],

  companyLinks: [
    { label: "How we work", href: "/how-we-work" },
    { label: "Work", href: "/work" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
  ] satisfies NavItem[],

  /** Primary CTA everywhere (brief §1). */
  primaryCta: { label: "Book a walkthrough", href: "/contact" },
  /** Long form of the CTA, used where there is room. */
  primaryCtaLong: "Book a 30-minute operations walkthrough",

  contact: {
    email: "hello@acceleret.com",
    /** PENDING: full street address line. */
    addressLine: "",
    city: "Surat",
    region: "Gujarat",
    country: "India",
    /** PENDING: company phone, display format, e.g. "+91 98765 43210". Empty hides it. */
    phone: "",
    /** PENDING: WhatsApp Business number, digits only with country code, e.g. "919876543210". */
    whatsappNumber: "",
    whatsappMessage: "Hi Acceleret, I'd like to talk about how our operations run today.",
    /** PENDING: company LinkedIn URL. Empty hides the icon. */
    linkedin: "",
    /** PENDING: company Instagram URL. Empty hides the icon. */
    instagram: "",
    /** PENDING: Calendly (or equivalent) booking link. */
    bookingUrl: "",
  },

  ctaBand: {
    heading: "Tell us what runs on WhatsApp and Excel today.",
    sub: "A 30-minute call. We'll tell you what we'd build and what we wouldn't.",
    button: "Book a walkthrough",
  },

  copyright: "© 2026 Acceleret. Built in Surat.",

  /**
   * While true, slots still waiting on founder content (partner, photos,
   * merger line, sample case studies) are shown with a "Pending" marker so
   * they can be reviewed. Set to false before launch to hide them.
   */
  showPending: false,
};

/** WhatsApp click-to-chat link, or null until the number is supplied. */
export function whatsappHref(): string | null {
  const { whatsappNumber, whatsappMessage } = site.contact;
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
}

export function phoneHref(): string | null {
  const digits = site.contact.phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export function addressText() {
  const { addressLine, city, region } = site.contact;
  return [addressLine, `${city}, ${region}`].filter(Boolean).join(", ");
}
