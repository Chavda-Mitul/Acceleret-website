/**
 * Products (brief §4 Products). The card is driven entirely by this file.
 *
 * PENDING: the product's final name, logo and link. Swap these three:
 *   name — shown on the card and in the button ("Visit <name>")
 *   logo — path to an image in /public (e.g. "/products/travel-crm.svg"); empty shows the name as a wordmark
 *   url  — the product site; the button opens it in a new tab. Empty disables the button.
 */

export type Product = {
  name: string;
  logo: string;
  url: string;
  line: string;
  /** The stages the product covers, drawn as its diagram. From the product line. */
  flow: string[];
  pending?: boolean;
};

export const productsIntro = "Alongside custom work, we build products of our own.";

export const products: Product[] = [
  {
    name: "Travel CRM",
    logo: "",
    url: "",
    line: "A CRM for travel agencies, built inside a working agency with the people who run it. Enquiries, quotes, bookings, payments and follow-ups in one place.",
    flow: ["Enquiries", "Quotes", "Bookings", "Payments", "Follow-ups"],
    pending: true,
  },
];

/** Button label: "Visit [name].com" per the brief, using the URL's host once known. */
export function productButtonLabel(p: Product) {
  if (!p.url) return `Visit ${p.name}`;
  try {
    return `Visit ${new URL(p.url).host.replace(/^www\./, "")}`;
  } catch {
    return `Visit ${p.name}`;
  }
}
