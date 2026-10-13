import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type { Category, Media, Post, User } from "@/payload-types";
import { BLOG_TAG } from "@/collections/revalidate";

/*
 * Blog data for the public site. Every query is cached and tagged, and the
 * CMS expires the tag whenever a post, category or image changes
 * (src/collections/revalidate.ts), so pages stay static until there is news.
 *
 * The local API skips access control, so each query asks for published
 * posts explicitly: drafts never reach the public site.
 */

const published: Where = { _status: { equals: "published" } };

async function cms() {
  return getPayload({ config });
}

/** Every published post, newest first. */
export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(BLOG_TAG);
  cacheLife("max");
  const payload = await cms();
  const { docs } = await payload.find({
    collection: "posts",
    where: published,
    sort: "-publishedAt",
    depth: 1,
    pagination: false,
    draft: false,
  });
  return docs;
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag(BLOG_TAG);
  cacheLife("max");
  const payload = await cms();
  const { docs } = await payload.find({
    collection: "posts",
    where: { and: [published, { slug: { equals: slug } }] },
    depth: 2,
    limit: 1,
    draft: false,
  });
  return docs[0] ?? null;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(BLOG_TAG);
  cacheLife("max");
  const payload = await cms();
  const { docs } = await payload.find({ collection: "categories", sort: "title", pagination: false });
  return docs;
}

export async function getCategory(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

/** Only categories that have at least one published post, for the blog's filter row. */
export async function getActiveCategories(): Promise<Category[]> {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const used = new Set(posts.map((p) => categoryOf(p)?.id));
  return categories.filter((c) => used.has(c.id));
}

/* ---------------------------------------------------------------- shape helpers */

export function categoryOf(post: Post): Category | null {
  return typeof post.category === "object" ? (post.category ?? null) : null;
}

export function authorOf(post: Post): User | null {
  return typeof post.author === "object" ? (post.author ?? null) : null;
}

export function mediaOf(value: Post["coverImage"]): Media | null {
  return typeof value === "object" && value?.url ? value : null;
}

/** Search engines see the newest of publish and edit dates. */
export function modifiedAt(post: Post) {
  return post.updatedAt > (post.publishedAt ?? "") ? post.updatedAt : (post.publishedAt ?? post.updatedAt);
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

/* ---------------------------------------------------------------- content helpers */

type LexicalNode = {
  type: string;
  tag?: string;
  text?: string;
  children?: LexicalNode[];
  fields?: Record<string, unknown>;
};

function rootNodes(post: Pick<Post, "content">): LexicalNode[] {
  return (post.content?.root?.children ?? []) as LexicalNode[];
}

export function textOf(node: LexicalNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(textOf).join("");
}

/** About 220 words a minute, never less than a minute. */
export function readingMinutes(post: Pick<Post, "content">) {
  const words = rootNodes(post).map(textOf).join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Gives each heading a URL-safe id, numbering repeats ("pricing", "pricing-2").
 * The article and its table of contents each make one and walk the headings
 * in the same order, so their ids match.
 */
export function headingIds() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base =
      text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-") || "section";
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** The article's H2s and H3s, for the "In this article" list. */
export function tableOfContents(post: Pick<Post, "content">): TocEntry[] {
  const idFor = headingIds();
  const toc: TocEntry[] = [];
  for (const node of rootNodes(post)) {
    if (node.type !== "heading") continue;
    const text = textOf(node).trim();
    const id = idFor(text);
    if (node.tag === "h2" || node.tag === "h3") toc.push({ id, text, level: node.tag === "h2" ? 2 : 3 });
  }
  return toc;
}

/** Questions from every FAQ block in the article, for FAQPage structured data. */
export function faqItems(post: Pick<Post, "content">): { question: string; answer: string }[] {
  return rootNodes(post).flatMap((node) => {
    if (node.type !== "block" || node.fields?.blockType !== "faq") return [];
    return (node.fields.items as { question: string; answer: string }[] | undefined) ?? [];
  });
}

/** Up to three other posts, same category first, then the newest. */
export async function relatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const others = (await getPosts()).filter((p) => p.id !== post.id);
  const category = categoryOf(post)?.id;
  const same = others.filter((p) => category && categoryOf(p)?.id === category);
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, limit);
}

/**
 * The picture shown when the article is shared: the SEO tab's image, else the
 * cover, else a title card drawn for this article (blog/[slug]/share.png).
 */
export function shareImage(post: Post) {
  const media = mediaOf(post.meta?.image ?? null) ?? mediaOf(post.coverImage);
  const og = media?.sizes?.og;
  if (media && og?.url) return { url: og.url, width: og.width ?? 1200, height: og.height ?? 630, alt: media.alt };
  if (media) return { url: media.url!, width: media.width ?? 1200, height: media.height ?? 630, alt: media.alt };
  return { url: `/blog/${post.slug}/share.png`, width: 1200, height: 630, alt: post.title };
}
