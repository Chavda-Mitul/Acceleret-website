import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getActiveCategories, getPosts, modifiedAt } from "@/lib/blog";
import { getCaseStudies } from "@/lib/work";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/services", "/how-we-work", "/products", "/case-studies", "/blog", "/team", "/contact", "/privacy"];
  const [posts, categories, caseStudies] = await Promise.all([getPosts(), getActiveCategories(), getCaseStudies()]);
  return [
    ...pages.map((p) => ({
      url: `${site.url}${p}`,
      changeFrequency: (p === "/blog" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: p === "" ? 1 : p === "/privacy" ? 0.3 : 0.8,
    })),
    // Pages hidden from search, or first published elsewhere, are left out.
    ...caseStudies
      .filter((c) => !c.meta?.noindex && !c.meta?.canonical)
      .map((c) => ({ url: `${site.url}/case-studies/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
    ...posts
      .filter((p) => !p.meta?.noindex && !p.meta?.canonical)
      .map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: modifiedAt(p), priority: 0.7 })),
    ...categories.map((c) => ({ url: `${site.url}/blog/category/${c.slug}`, priority: 0.5 })),
  ];
}
