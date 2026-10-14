import { seo } from "@/content/seo";
import { site } from "@/content/site";
import { people } from "@/content/team";

const sameAs = () => [site.contact.linkedin, site.contact.instagram].filter(Boolean);

/** schema.org Organization, on Home (brief §6). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/logo.svg`,
    description: seo.home.description,
    email: site.contact.email,
    slogan: site.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contact.city,
      addressRegion: site.contact.region,
      addressCountry: "IN",
    },
    founder: people.filter((p) => p.role === "Co-founder").map((p) => ({ "@type": "Person", name: p.name })),
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
  };
}

/** schema.org LocalBusiness, on Contact (brief §6). */
export function localBusinessJsonLd() {
  const { contact } = site;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: `${site.url}/contact`,
    image: `${site.url}/logo.svg`,
    description: seo.contact.description,
    email: contact.email,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(contact.addressLine ? { streetAddress: contact.addressLine } : {}),
      addressLocality: contact.city,
      addressRegion: contact.region,
      addressCountry: "IN",
    },
    areaServed: "IN",
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
  };
}

/** schema.org WebSite, on Home: names the site for search results. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "en-IN",
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

/** schema.org BreadcrumbList. `trail` runs from the top level down; Home is added first. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "" }, ...trail].map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${site.url}${t.path}`,
    })),
  };
}

/** schema.org BlogPosting, on each article. Dates and image come from the CMS. */
export function blogPostingJsonLd(post: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string | null;
  modifiedAt: string;
  author?: string | null;
  image?: string | null;
  section?: string | null;
  tags?: string[] | null;
}) {
  const url = `${site.url}${post.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.modifiedAt,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/logo.svg` },
    ...(post.image ? { image: post.image } : {}),
    ...(post.section ? { articleSection: post.section } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
    inLanguage: "en-IN",
  };
}

/** schema.org FAQPage, from the FAQ blocks in an article. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
