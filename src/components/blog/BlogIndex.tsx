import Link from "next/link";
import type { Category, Post } from "@/payload-types";
import { blog } from "@/content/blog";
import { PostCard } from "./PostCard";

/** Category links above the list; the current one is marked for screen readers and styled. */
export function CategoryNav({ categories, current }: { categories: Category[]; current?: string }) {
  if (!categories.length) return null;
  return (
    <nav className="blog-cats" aria-label="Blog categories">
      <ul>
        <li>
          <Link href="/blog" aria-current={current ? undefined : "page"}>
            {blog.allLabel}
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/blog/category/${c.slug}`} aria-current={current === c.slug ? "page" : undefined}>
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p className="t-lead blog-empty">{blog.empty}</p>;
  return (
    <div className="post-grid">
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} index={i} priority={i < 3} />
      ))}
    </div>
  );
}
