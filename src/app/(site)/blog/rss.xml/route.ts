import { site } from "@/content/site";
import { seo } from "@/content/seo";
import { categoryOf, getPosts } from "@/lib/blog";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of published articles, for feed readers and newsletter tools. */
export async function GET() {
  const posts = (await getPosts()).filter((p) => !p.meta?.noindex);
  const items = posts
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      const category = categoryOf(p);
      return [
        "<item>",
        `<title>${escape(p.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<description>${escape(p.excerpt)}</description>`,
        p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : "",
        category ? `<category>${escape(category.title)}</category>` : "",
        "</item>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(seo.blog.title)}</title><link>${site.url}/blog</link><description>${escape(seo.blog.description)}</description><language>en-in</language><atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
