import type { Metadata } from "next";
import { baseOpenGraph, seo } from "@/content/seo";
import { blog } from "@/content/blog";
import { getActiveCategories, getPosts } from "@/lib/blog";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { Spine } from "@/components/motion/Spine";
import { CategoryNav, PostGrid } from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: seo.blog.title,
  description: seo.blog.description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { ...baseOpenGraph, title: seo.blog.title, description: seo.blog.description, url: "/blog" },
};

/* Posts come from the CMS through cached queries, so this page is static
   and is refreshed whenever an article is published or changed. */
export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getActiveCategories()]);
  return (
    <>
      <PageHero title={blog.title} lead={blog.lead} />
      <section className="section blog-list" aria-label="Articles">
        <Spine />
        <div className="wrap">
          <CategoryNav categories={categories} />
          <PostGrid posts={posts} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
