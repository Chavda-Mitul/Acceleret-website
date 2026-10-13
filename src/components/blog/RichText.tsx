import Image from "next/image";
import Link from "next/link";
import type { DefaultNodeTypes, SerializedBlockNode, SerializedLinkNode } from "@payloadcms/richtext-lexical";
import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { CalloutBlock, CtaBlock, FaqBlock, Media, Post } from "@/payload-types";
import { headingIds, textOf } from "@/lib/blog";

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<CalloutBlock | FaqBlock | CtaBlock>;

/** Internal links point at another post; the CMS stores the post, the site needs its URL. */
function linkHref(node: SerializedLinkNode) {
  const { fields } = node;
  if (fields.linkType === "internal") {
    const doc = fields.doc?.value;
    return typeof doc === "object" && doc && "slug" in doc ? `/blog/${doc.slug}` : "/blog";
  }
  return fields.url ?? "";
}

function linkRel(node: SerializedLinkNode) {
  const rel = [
    node.fields.newTab ? "noopener noreferrer" : "",
    (node.fields as { nofollow?: boolean }).nofollow ? "nofollow" : "",
  ].filter(Boolean);
  return rel.length ? rel.join(" ") : undefined;
}

/**
 * Turns an article's rich text into the page's own markup: headings get ids
 * for the table of contents, images go through next/image, tables scroll on
 * their own on small screens, and each CMS block has its own component.
 */
export function RichText({ data }: { data: Post["content"] }) {
  // One counter per render, walking headings in the same order as tableOfContents().
  const idFor = headingIds();

  const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
    ...defaultConverters,

    heading: ({ node, nodesToJSX }) => {
      const Tag = (["h2", "h3", "h4"].includes(node.tag) ? node.tag : "h2") as "h2" | "h3" | "h4";
      return <Tag id={idFor(textOf(node as never).trim())}>{nodesToJSX({ nodes: node.children })}</Tag>;
    },

    link: ({ node, nodesToJSX }) => {
      const href = linkHref(node);
      const children = nodesToJSX({ nodes: node.children });
      return href.startsWith("/") && !node.fields.newTab ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} rel={linkRel(node)} target={node.fields.newTab ? "_blank" : undefined}>
          {children}
        </a>
      );
    },
    autolink: ({ node, nodesToJSX }) => (
      <a href={node.fields.url ?? ""} rel={linkRel(node as unknown as SerializedLinkNode)} target={node.fields.newTab ? "_blank" : undefined}>
        {nodesToJSX({ nodes: node.children })}
      </a>
    ),

    upload: ({ node }) => {
      const doc = node.value as Media | number;
      if (typeof doc !== "object" || !doc?.url) return null;
      const caption = (node.fields as { caption?: string } | undefined)?.caption;
      const src = doc.sizes?.content?.url ?? doc.url;
      const width = doc.sizes?.content?.width ?? doc.width ?? 1440;
      const height = doc.sizes?.content?.height ?? doc.height ?? 810;
      return (
        <figure className="prose__figure">
          <Image src={src} alt={doc.alt} width={width} height={height} sizes="(min-width: 760px) 720px, 100vw" />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    },

    // Checklist items: the default renders a random-id <input>; a marker plus screen-reader text is enough to read.
    listitem: ({ node, nodesToJSX, parent }) => {
      const children = nodesToJSX({ nodes: node.children });
      if ("listType" in parent && parent.listType === "check") {
        return (
          <li className="prose__check" data-checked={node.checked ? "true" : "false"} value={node.value}>
            <span className="sr-only">{node.checked ? "Done: " : "To do: "}</span>
            {children}
          </li>
        );
      }
      return <li value={node.value}>{children}</li>;
    },

    table: ({ node, nodesToJSX }) => (
      // Wide tables scroll inside their frame instead of widening the page.
      <div className="prose__table" role="region" aria-label="Table" tabIndex={0}>
        <table>
          <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
        </table>
      </div>
    ),
    tablerow: ({ node, nodesToJSX }) => <tr>{nodesToJSX({ nodes: node.children })}</tr>,
    tablecell: ({ node, nodesToJSX }) => {
      const Cell = node.headerState > 0 ? "th" : "td";
      return (
        <Cell
          colSpan={node.colSpan && node.colSpan > 1 ? node.colSpan : undefined}
          rowSpan={node.rowSpan && node.rowSpan > 1 ? node.rowSpan : undefined}
        >
          {nodesToJSX({ nodes: node.children })}
        </Cell>
      );
    },

    blocks: {
      callout: ({ node }: { node: SerializedBlockNode<CalloutBlock> }) => (
        <aside className="prose__callout" data-tone={node.fields.tone ?? "note"}>
          {node.fields.title ? <p className="prose__callout-title">{node.fields.title}</p> : null}
          <p>{node.fields.body}</p>
        </aside>
      ),
      faq: ({ node }: { node: SerializedBlockNode<FaqBlock> }) => (
        <div className="prose__faq">
          {(node.fields.items ?? []).map((item) => (
            <details key={item.id ?? item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      ),
      cta: ({ node }: { node: SerializedBlockNode<CtaBlock> }) => (
        <aside className="prose__cta">
          <p className="prose__cta-heading">{node.fields.heading}</p>
          {node.fields.text ? <p>{node.fields.text}</p> : null}
          <Link href={node.fields.href} className="btn btn-inverse">
            {node.fields.buttonLabel}
            <span className="btn-node" aria-hidden />
          </Link>
        </aside>
      ),
    },
  });

  return <LexicalRichText data={data as never} converters={converters as never} className="prose" />;
}
