import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/work";
import { getActiveCategories, getPosts, modifiedAt } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/services", "/how-we-work", "/products", "/work", "/blog", "/team", "/contact", "/privacy"];
  const [posts, categories] = await Promise.all([getPosts(), getActiveCategories()]);
  return [
    ...pages.map((p) => ({
      url: `${site.url}${p}`,
      changeFrequency: (p === "/blog" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: p === "" ? 1 : p === "/privacy" ? 0.3 : 0.8,
    })),
    // Sample case studies are layout previews and stay out of the sitemap.
    ...caseStudies
      .filter((c) => !c.sample)
      .map((c) => ({ url: `${site.url}/work/${c.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
    // Articles hidden from search, or first published elsewhere, are left out.
    ...posts
      .filter((p) => !p.meta?.noindex && !p.meta?.canonical)
      .map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: modifiedAt(p), priority: 0.7 })),
    ...categories.map((c) => ({ url: `${site.url}/blog/category/${c.slug}`, priority: 0.5 })),
  ];
}
