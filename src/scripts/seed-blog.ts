/**
 * Adds one example article that uses every editor feature, so writers can
 * open it in /admin and see how each piece looks on the site.
 *
 *   npm run seed:blog              creates it as a draft (not public)
 *   SEED_PUBLISH=1 npm run seed:blog   creates it published (for local testing)
 *
 * Safe to run twice: it skips if the example already exists.
 */
import { getPayload } from "payload";
import sharp from "sharp";
import config from "../payload.config";

const SLUG = "example-outgrown-whatsapp-and-excel";
const publish = process.env.SEED_PUBLISH === "1";

/* ---------------------------------------------------------------- Lexical JSON helpers */

const BOLD = 1;
const ITALIC = 2;

type Node = Record<string, unknown>;
const base = { format: "", indent: 0, version: 1, direction: "ltr" as const };

const text = (t: string, format = 0): Node => ({ type: "text", text: t, format, detail: 0, mode: "normal", style: "", version: 1 });
const p = (...children: (Node | string)[]): Node => ({
  type: "paragraph",
  ...base,
  textFormat: 0,
  textStyle: "",
  children: children.map((c) => (typeof c === "string" ? text(c) : c)),
});
const h = (tag: "h2" | "h3" | "h4", t: string): Node => ({ type: "heading", tag, ...base, children: [text(t)] });
const link = (t: string, url: string, extra: Node = {}): Node => ({
  type: "link",
  ...base,
  version: 3,
  fields: { linkType: "custom", url, newTab: false, ...extra },
  children: [text(t)],
});
const list = (listType: "bullet" | "number" | "check", items: (string | [string, boolean])[]): Node => ({
  type: "list",
  ...base,
  listType,
  start: 1,
  tag: listType === "number" ? "ol" : "ul",
  children: items.map((item, i) => {
    const [t, checked] = Array.isArray(item) ? item : [item, undefined];
    return {
      type: "listitem",
      ...base,
      value: i + 1,
      ...(listType === "check" ? { checked: Boolean(checked) } : {}),
      children: [text(t)],
    };
  }),
});
const quote = (t: string): Node => ({ type: "quote", ...base, children: [text(t)] });
const hr = (): Node => ({ type: "horizontalrule", version: 1 });
const upload = (id: number, caption: string): Node => ({
  type: "upload",
  relationTo: "media",
  value: id,
  fields: { caption },
  format: "",
  version: 3,
});
const block = (fields: Node): Node => ({
  type: "block",
  format: "",
  version: 2,
  fields: { id: Math.random().toString(16).slice(2, 14), blockName: "", ...fields },
});
const table = (rows: string[][]): Node => ({
  type: "table",
  ...base,
  children: rows.map((row, r) => ({
    type: "tablerow",
    ...base,
    children: row.map((cell) => ({
      type: "tablecell",
      ...base,
      headerState: r === 0 ? 1 : 0,
      colSpan: 1,
      rowSpan: 1,
      backgroundColor: null,
      children: [p(cell)],
    })),
  })),
});

/* ---------------------------------------------------------------- image */

/** A simple drawn cover: the site's route line on white, as a PNG. */
async function coverPng() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#f3f6fb"/>
    <path d="M120 640 C 420 640, 420 300, 760 300 S 1120 560, 1480 260" fill="none" stroke="#9aa3b5" stroke-width="6" stroke-dasharray="14 18" stroke-linecap="round"/>
    <path d="M120 700 H 700 Q 760 700 760 640 V 420 Q 760 360 820 360 H 1480" fill="none" stroke="#2350ff" stroke-width="10" stroke-linecap="round"/>
    <circle cx="1480" cy="360" r="26" fill="#2350ff"/>
    <circle cx="120" cy="700" r="18" fill="#2350ff"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/* ---------------------------------------------------------------- seed */

const payload = await getPayload({ config });
const context = { disableRevalidate: true };

const existing = await payload.find({ collection: "posts", where: { slug: { equals: SLUG } }, limit: 1, draft: true });
if (existing.docs.length) {
  payload.logger.info(`Example article already exists (${SLUG}); nothing to do.`);
  process.exit(0);
}

const author = (await payload.find({ collection: "users", limit: 1 })).docs[0];

const category =
  (await payload.find({ collection: "categories", where: { slug: { equals: "operations" } }, limit: 1 })).docs[0] ??
  (await payload.create({
    collection: "categories",
    context,
    data: {
      title: "Operations",
      slug: "operations",
      description: "How work actually moves through a business, and where software helps.",
    },
  }));

const png = await coverPng();
const cover = await payload.create({
  collection: "media",
  context,
  data: { alt: "A dotted pencil route straightened into a single blue line" },
  file: { data: png, mimetype: "image/png", name: "example-cover.png", size: png.length },
});

const content = {
  root: {
    type: "root",
    ...base,
    children: [
      p(
        "This is an ",
        text("example article", BOLD),
        ". It shows every kind of content the editor supports, so you can see how each one looks on the site. ",
        text("Edit it, or delete it once you've had a look.", ITALIC),
      ),
      h("h2", "The signs you have outgrown chat and spreadsheets"),
      p("Most growing teams notice the same things before they change how they work:"),
      list("bullet", [
        "Orders are confirmed in a chat thread and copied into a sheet by hand.",
        "Nobody is sure which version of the stock file is the latest.",
        "Follow-ups depend on someone remembering them.",
      ]),
      h("h3", "What it costs"),
      p(
        "The cost is rarely one big mistake. It is many small delays. Read more about ",
        link("how we work", "/how-we-work"),
        ", or see ",
        link("an external reference", "https://en.wikipedia.org/wiki/Business_process", { newTab: true, nofollow: true }),
        " (this link opens in a new tab and is marked nofollow).",
      ),
      upload(cover.id, "Captions appear under the image. Alt text is set on the image itself."),
      h("h2", "Chat and spreadsheets compared with a system"),
      table([
        ["Task", "Chat + spreadsheet", "Purpose-built system"],
        ["Taking an order", "Typed twice, by hand", "Entered once"],
        ["Checking stock", "Call the warehouse", "Visible to everyone"],
        ["Following up", "Someone remembers", "Reminder is automatic"],
      ]),
      block({
        blockType: "callout",
        tone: "tip",
        title: "Tip",
        body: "Callouts are good for one short point the reader should not miss.",
      }),
      h("h2", "Where to start"),
      list("number", [
        "Write down how one order moves today, step by step.",
        "Mark every step where something is typed twice.",
        "Fix the busiest of those first.",
      ]),
      h("h3", "A checklist before you buy any software"),
      list("check", [
        ["We know which process hurts most", true],
        ["We have asked the people who do it every day", false],
        ["We know what 'better' would look like", false],
      ]),
      quote("Software should fit how the business runs, not the other way round."),
      hr(),
      h("h4", "A smaller heading"),
      p("Headings go H2 for main sections, H3 inside them, H4 for small labels. The page title is the only H1."),
      block({
        blockType: "faq",
        items: [
          { question: "Do FAQs help with search?", answer: "Yes. They are sent to Google as FAQ data with the article." },
          { question: "How many questions can I add?", answer: "As many as you need. Keep each answer short." },
        ],
      }),
      block({
        blockType: "cta",
        heading: "Want to see where your process leaks time?",
        text: "Book a 30-minute walkthrough and we'll map it with you.",
        buttonLabel: "Book a walkthrough",
        href: "/contact",
      }),
    ],
  },
};

await payload.create({
  collection: "posts",
  context,
  draft: !publish,
  data: {
    title: "Example: when your team has outgrown WhatsApp and Excel",
    slug: SLUG,
    excerpt:
      "An example article showing every formatting option: headings, lists, links, an image, a table, callouts, FAQs and a call to action.",
    coverImage: cover.id,
    content: content as never,
    category: category.id,
    author: author?.id,
    tags: ["operations", "example"],
    _status: publish ? "published" : "draft",
    meta: {
      title: "Example: outgrown WhatsApp and Excel? | Acceleret",
      description: "An example article that shows every formatting option available in the Acceleret blog editor.",
      image: cover.id,
    },
  },
});

payload.logger.info(`Example article created as ${publish ? "published" : "a draft"}: /blog/${SLUG}`);
process.exit(0);
