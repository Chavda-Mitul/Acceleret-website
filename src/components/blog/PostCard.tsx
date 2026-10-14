import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/payload-types";
import { categoryOf, formatDate, mediaOf, readingMinutes } from "@/lib/blog";
import { SketchFrame } from "@/components/motion/SketchFrame";

/** An article on the blog list: cover (if any), category and date, title, excerpt. */
export function PostCard({
  post,
  index = 0,
  as: Heading = "h2",
  priority = false,
}: {
  post: Post;
  index?: number;
  as?: "h2" | "h3";
  priority?: boolean;
}) {
  const cover = mediaOf(post.coverImage);
  const category = categoryOf(post);
  const card = cover?.sizes?.card;

  return (
    <SketchFrame radius={26} seed={index + 11} delay={(index % 3) * 0.15} priority={priority}>
      <article className="post-card">
        {cover ? (
          <div className="post-card__cover">
            <Image
              src={card?.url ?? cover.url!}
              alt=""
              width={card?.width ?? cover.width ?? 720}
              height={card?.height ?? cover.height ?? 450}
              sizes="(min-width: 1100px) 400px, (min-width: 700px) 45vw, 100vw"
              priority={priority}
            />
          </div>
        ) : null}
        <p className="post-card__meta">
          {category ? <span>{category.title}</span> : null}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
          <span>{readingMinutes(post)} min read</span>
        </p>
        <Heading className="t-h4 post-card__title">
          <Link href={`/blog/${post.slug}`} className="post-card__link">
            {post.title}
          </Link>
        </Heading>
        <p className="post-card__excerpt">{post.excerpt}</p>
      </article>
    </SketchFrame>
  );
}
