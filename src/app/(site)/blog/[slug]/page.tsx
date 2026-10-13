import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { baseOpenGraph } from "@/content/seo";
import {
  authorOf,
  categoryOf,
  faqItems,
  formatDate,
  getPost,
  getPosts,
  mediaOf,
  modifiedAt,
  readingMinutes,
  relatedPosts,
  shareImage,
  tableOfContents,
} from "@/lib/blog";
import { blogPostingJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { Spine } from "@/components/motion/Spine";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { RichText } from "@/components/blog/RichText";
import { PostCard } from "@/components/blog/PostCard";

/* Cache Components needs at least one param to prerender; with no posts yet, a placeholder 404s.
   Posts published later render on their first visit and are cached from then on. */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "none" }];
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.meta?.title || `${post.title} | Acceleret`;
  const description = post.meta?.description || post.excerpt;
  const author = authorOf(post);
  return {
    title,
    description,
    alternates: { canonical: post.meta?.canonical || `/blog/${slug}` },
    robots: post.meta?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      title,
      description,
      url: `/blog/${slug}`,
      images: [shareImage(post)],
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: modifiedAt(post),
      authors: author ? [author.name] : undefined,
      section: categoryOf(post)?.title,
      tags: post.tags ?? undefined,
    },
  };
}

/*
 * Same shape as a case study: the back link and closing CTA are the static
 * shell; the article depends on the URL, so it sits inside <Suspense>.
 */
export default function PostPage(props: PageProps<"/blog/[slug]">) {
  return (
    <>
      <article className="post" aria-labelledby="post-title">
        <Spine />
        <div className="wrap">
          <p className="case__back">
            <Link href="/blog" className="link">
              All articles
            </Link>
          </p>
          <Suspense fallback={<PostFallback />}>
            <PostBody params={props.params} />
          </Suspense>
        </div>
      </article>
      <CtaBand />
    </>
  );
}

function PostFallback() {
  return (
    <div className="case__fallback" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

async function PostBody({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const category = categoryOf(post);
  const author = authorOf(post);
  const cover = mediaOf(post.coverImage);
  const toc = tableOfContents(post);
  const faq = faqItems(post);
  const related = await relatedPosts(post);
  const image = shareImage(post).url;
  const updated = modifiedAt(post);
  // Only mention an update when it is on a later day than publishing.
  const showUpdated = post.publishedAt && formatDate(updated) !== formatDate(post.publishedAt);

  return (
    <>
      <JsonLd
        data={blogPostingJsonLd({
          title: post.title,
          description: post.meta?.description || post.excerpt,
          path: `/blog/${post.slug}`,
          publishedAt: post.publishedAt,
          modifiedAt: updated,
          author: author?.name,
          image: image.startsWith("/") ? `${site.url}${image}` : image,
          section: category?.title,
          tags: post.tags,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blog", path: "/blog" },
          ...(category ? [{ name: category.title, path: `/blog/category/${category.slug}` }] : []),
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      {faq.length ? <JsonLd data={faqJsonLd(faq)} /> : null}

      <header className="post__head">
        <p className="post__meta">
          {category ? (
            <Link href={`/blog/category/${category.slug}`} className="link">
              {category.title}
            </Link>
          ) : null}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
          <span>{readingMinutes(post)} min read</span>
        </p>
        <SplitHeading as="h1" id="post-title" className="t-h1 post__title" sketch onLoad>
          {post.title}
        </SplitHeading>
        <p className="t-lead post__lead">{post.excerpt}</p>
        {author || showUpdated ? (
          <p className="post__byline">
            {author ? <span>By {author.name}</span> : null}
            {showUpdated ? (
              <span>
                Updated <time dateTime={updated}>{formatDate(updated)}</time>
              </span>
            ) : null}
          </p>
        ) : null}
      </header>

      {cover ? (
        <figure className="post__cover">
          <Image
            src={cover.sizes?.content?.url ?? cover.url!}
            alt={cover.alt}
            width={cover.sizes?.content?.width ?? cover.width ?? 1440}
            height={cover.sizes?.content?.height ?? cover.height ?? 810}
            sizes="(min-width: 1320px) 1240px, 100vw"
            priority
          />
        </figure>
      ) : null}

      <div className={`post__layout${toc.length > 1 ? " post__layout--toc" : ""}`}>
        {toc.length > 1 ? (
          <nav className="post__toc" aria-labelledby="toc-title">
            <p id="toc-title">In this article</p>
            <ol>
              {toc.map((t) => (
                <li key={t.id} data-level={t.level}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="post__body">
          <RichText data={post.content} />
          {post.tags?.length ? (
            <ul className="post__tags" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="post__related" aria-labelledby="related-title">
          <h2 id="related-title" className="t-h3 post__related-title">
            Keep reading
          </h2>
          <div className="post-grid">
            {related.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} as="h3" />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
