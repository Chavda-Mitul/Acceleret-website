import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { baseOpenGraph } from "@/content/seo";
import { categoryOf, getActiveCategories, getCategories, getCategory, getPosts } from "@/lib/blog";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { CategoryNav, PostGrid } from "@/components/blog/BlogIndex";
import { breadcrumbJsonLd } from "@/lib/schema";

/* Cache Components needs at least one param to prerender; with no categories yet, a placeholder 404s. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.length ? categories.map((c) => ({ slug: c.slug })) : [{ slug: "none" }];
}

export async function generateMetadata(props: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return {};
  const title = `${category.title} | Blog | Acceleret`;
  const description = category.description || `Articles about ${category.title.toLowerCase()} from Acceleret.`;
  return {
    title,
    description,
    alternates: { canonical: `/blog/category/${slug}` },
    openGraph: { ...baseOpenGraph, title, description, url: `/blog/category/${slug}` },
  };
}

export default function CategoryPage(props: PageProps<"/blog/category/[slug]">) {
  return (
    <>
      <section className="section blog-list blog-list--category" aria-labelledby="category-title">
        <Spine />
        <div className="wrap">
          <p className="case__back">
            <Link href="/blog" className="link">
              All articles
            </Link>
          </p>
          <Suspense fallback={<div className="case__fallback" aria-hidden><span /><span /></div>}>
            <CategoryBody params={props.params} />
          </Suspense>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

async function CategoryBody({ params }: { params: PageProps<"/blog/category/[slug]">["params"] }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const [posts, categories] = await Promise.all([getPosts(), getActiveCategories()]);
  const inCategory = posts.filter((p) => categoryOf(p)?.id === category.id);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blog", path: "/blog" },
          { name: category.title, path: `/blog/category/${slug}` },
        ])}
      />
      <SplitHeading as="h1" id="category-title" className="t-h1 blog-list__title" sketch onLoad>
        {category.title}
      </SplitHeading>
      {category.description ? <p className="t-lead blog-list__lead">{category.description}</p> : null}
      <CategoryNav categories={categories} current={slug} />
      <PostGrid posts={inCategory} />
    </>
  );
}
