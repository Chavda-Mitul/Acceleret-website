import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/how-we-work", "/products", "/work", "/contact", "/privacy"];
  return [
    ...pages.map((p) => ({
      url: `${site.url}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p === "/privacy" ? 0.3 : 0.8,
    })),
    // Sample case studies are layout previews and stay out of the sitemap.
    ...caseStudies
      .filter((c) => !c.sample)
      .map((c) => ({ url: `${site.url}/work/${c.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
