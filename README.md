# acceleret.com (V2)

The Acceleret website, built from `../08-website-brief-acceleret-com.md` (with
`../Innodify-Website-Inventory.md` as background on the service offering).
Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4.
Every page is prerendered as static HTML. The server code is the contact form and the blog CMS
(Payload 3 at `/admin`, Postgres), which refreshes blog pages whenever an article changes.

## Run it

The blog needs a Postgres database. Locally, Docker is the quickest:

```bash
docker run -d --name acceleret-blog-pg -e POSTGRES_USER=acceleret -e POSTGRES_PASSWORD=acceleret   -e POSTGRES_DB=acceleret -p 5433:5432 postgres:17-alpine
```

Then copy `.env.example` to `.env.local` and set `PAYLOAD_SECRET` and
`DATABASE_URI=postgres://acceleret:acceleret@localhost:5433/acceleret`.

```bash
npm install
npm run dev          # http://localhost:3000, CMS at /admin (first visit creates the admin user)
npm run seed:blog    # optional: an example draft article that uses every editor feature
npm run build        # production build
npm start            # serve the production build
npm run typecheck    # route types + TypeScript
npm run lint
npm run test:e2e     # Playwright, against a production build (run `npm run build` first)
npm run check        # all of the above in order
```

`npm run build` reads the published articles, so it needs `DATABASE_URI` too. In development the
database schema follows the collections automatically. After changing a collection, run
`npm run migrate:create <name>` and commit the file in `src/migrations/`; deploys apply it with
`npm run migrate` (part of `vercel-build`). Run `npm run generate:types` to refresh `src/payload-types.ts`.

If a newly added CSS file doesn't show up in `npm run dev`, stop the server and delete `.next/dev`.

Playwright uses the Chrome installed on the machine (`channel: "chrome"`), so no browser download is needed.

## The idea

**Same business, engineered connections.** The site follows one enquiry through a business. The
hero draws the seven steps it passes through (enquiry → payment). First a pencil sketch shows how they
are held together today (WhatsApp, Excel, memory), then a blue route re-wires them. The steps never
move: the software is built around the business, and the route literally runs around the headline.
That route then runs down the page margin (the "spine") and arrives at the booking button in the closing band.

- **Pencil** (grey sketch lines) = how it works today.
- **Route** (electric blue) = what we build.
- **Type, two voices only:** every heading and big statement is handwritten (Kalam, deep-blue ink),
  written in and left handwritten. Everything else, however small (body, labels, buttons, nav, form
  fields, diagram labels), is Anek Latin at its regular weight, with no bold anywhere (the logo
  wordmark is the one exception). The only small handwriting is lettering drawn inside the pencil
  sketches themselves (the Day 1 notebook, the hero map's pencil notes, the sticky notes).
- Home sections: hero map → the three places work lives (a chat that scrolls the enquiry away, a sheet
  that keeps getting copied, notes that blur when the person is on leave) → six services as stations
  with a live diagram → Embed / Map / Build / Run as one drawing that evolves while pinned → work →
  who we are → closing band.

### Sketch first, then build

Everything on the site is first drawn by hand, then built, which is Acceleret's own story (understanding before code):

- **Headings** write themselves in, word by word, in handwriting and stay that way (`SplitHeading sketch`).
  The same goes for the big lines: the tagline band, the step names and the closing statement of the
  "three things" scene, which is underlined with a pen swoosh that ends in the route's node.
- **Diagrams** get a pencil layer generated from their own shapes; it draws first, the crisp diagram inks in over it, and the sketch stays as a faint ghost (`SketchSolid`). Diagrams carry short pencil captions.
- **Cards and panels** get a hand-drawn outline before the finished box appears (`SketchFrame`). Boxes on
  screen at load use `priority`: the box shows straight away and the outline is traced around it.
- **Notes**: short asides with a pencil arrow that write themselves in (`src/components/Note.tsx`), set in
  the body font: by the hero buttons, on the problem piles, over each service drawing, beside the work,
  team and closing sections, and on the inner pages. Wording sits next to where each one appears.

## Pages

The site lives in the `src/app/(site)/` route group and the CMS in `src/app/(payload)/`. Each has its own
root layout; the folder names in brackets don't appear in URLs.

| URL | File |
| --- | --- |
| `/` | `src/app/(site)/page.tsx` (sections in `src/components/home/`) |
| `/services` | `src/app/(site)/services/page.tsx` |
| `/how-we-work` | `src/app/(site)/how-we-work/page.tsx` |
| `/products` | `src/app/(site)/products/page.tsx` |
| `/work`, `/work/<slug>` | `src/app/(site)/work/` |
| `/blog`, `/blog/<slug>`, `/blog/category/<slug>`, `/blog/rss.xml` | `src/app/(site)/blog/` (data in `src/lib/blog.ts`) |
| `/team` | `src/app/(site)/team/page.tsx` |
| `/contact` | `src/app/(site)/contact/` (server action in `actions.ts`, shared checks in `validation.ts`) |
| `/privacy` | `src/app/(site)/privacy/page.tsx` |
| `/admin` | Payload CMS (`src/payload.config.ts`, collections in `src/collections/`) |

## Editing content (for Media)

All copy lives in `src/content/`. Change the text between the quotes and redeploy.

| To change | Edit |
| --- | --- |
| Contact details, nav, closing call to action, footer line | `src/content/site.ts` |
| Home page text, hero diagram labels | `src/content/home.ts` |
| The six services | `src/content/services.ts` |
| Embed / Map / Build / Run, "Why this way" | `src/content/process.ts` |
| Case studies | `src/content/work.ts` |
| Founders and partner | `src/content/team.ts` |
| Product card (name, logo, link) | `src/content/products.ts` |
| Page titles and descriptions | `src/content/seo.ts` |

**Add a case study:** copy one entry in `src/content/work.ts`, give it a new `slug`, fill in every
field and leave out `sample`. It appears on `/work`, on Home (first three), in the sitemap, and gets its
own page and share image. `outcomes` takes up to three items; add a `value` ("6 hrs") when there's a
number, otherwise just the `label`.

**Founder photos:** put the files in `public/team/` and set `photo: "/team/<file>.jpg"` in
`src/content/team.ts`.

**Product:** set `name`, `logo` (a file in `public/`) and `url` in `src/content/products.ts`. The button
reads "Visit <domain>" and opens in a new tab once `url` is set.

### Placeholders waiting on the founders

Search for `PENDING` in `src/content/`. `site.showPending` is currently `false`, so missing details are
simply left out (no phone row, no booking link, and so on). Set it to `true` to show a dashed "pending"
marker at each gap when reviewing the site with the founders.

- Phone number, WhatsApp number, full street address, LinkedIn and Instagram URLs, booking link (`site.ts`).
  Until the WhatsApp number is set, the floating button links to the contact details instead of a broken chat.
- The two case studies (current ones are labelled **Sample**, use placeholder text and are excluded from search).
- Founder photos; partner's name, line and photo; the merger line from "File 02" (`team.ts`).
- Travel CRM name, logo and link (`products.ts`).
- Brand kit: logo, colours, fonts (see below).
- Privacy policy wording: drafted plainly; items marked "Confirm" need a decision (`src/app/(site)/privacy/page.tsx`).

## Brand kit swap

- **Colours, spacing, type scale:** `src/styles/base.css` (`:root` tokens).
- **Fonts:** `src/app/(site)/layout.tsx` (Anek Latin + Kalam via `next/font`, self-hosted at build time).
- **Logo:** `src/components/chrome/Logo.tsx`, `src/app/icon.svg`, `src/app/apple-icon.tsx`.
- **Share images:** `src/lib/og.tsx`.

## Motion

Two modes, stored on `<html data-motion>` before first paint (`src/lib/motion-script.ts`):

- **Full**: scroll scenes, pinning, parallax, smooth scrolling (Lenis), magnetic buttons.
- **Calm**: nothing travels across the screen; lines still draw and parts still fade in.

Devices that ask for reduced motion (on Windows: Settings › Accessibility › Visual effects ›
*Animation effects* off) start in calm, and a small prompt offers "Play full animation". The footer has
an **Animation: Full / Calm** switch; the choice is remembered on that device. If the site looks still on
your computer, that Windows setting is why.

Scroll scenes (GSAP + ScrollTrigger + SplitText, loaded after the page is interactive so they never slow
the first paint; `src/lib/motion.ts` → `useScene`):

| Where | What happens |
| --- | --- |
| Hero | Pencil sketch → engineered route on load; each step swaps its workaround for what is built; the enquiry then runs the route on its own every few seconds, and scrolling carries it out down the margin; the map leans with the cursor |
| Most businesses run on three things | Pinned: WhatsApp messages, Excel cells, memory notes and notification noise flood in, sort into three piles, fall apart and collapse into one line; then "We replace all three…" writes itself in and a pen swoosh underlines "already works." |
| Tagline band | "Build > Automate > Accelerate" in giant handwriting, two rows sliding opposite ways, skewing with scroll speed; the outlined row inks in |
| What we build | Pinned horizontal journey through the six services; each diagram draws as it arrives; stations light along the route |
| How we work | Pinned: one drawing evolves Embed → Map → Build → Run |
| Work, team, inner pages | Headings write themselves in; cards get their pencil outline, then the box; service figures drift with parallax |
| Closing band | Deep blue floods out from a single node until it fills the screen |

On screens narrower than 1000 px (or shorter than 620 px) the pinned scenes become stacked layouts with
their own entrance animation.

### Art: the street

Between the tagline band and the services, a pencil drawing of a Surat trading street: a textile shop
with bolts of cloth and fabric drying on the roof, an office block, a sawtooth-roofed weaving shed with a
loom behind the door, a warehouse, a loaded tempo, an old trading house with a chhatri, wires, birds and
the far city. It draws itself in as it comes into view (far city, ink, details, shading), then one blue
line runs along the road and connects every door.

- It is drawn in code, not an image: `src/lib/sketch.ts` turns shapes into hand-made strokes (bowed,
  overshooting lines, hatching) and `src/components/art/street.ts` composes the street from them.
  Seeded, so it comes out the same every time.
- It stays out of the page HTML: `LazyArt` holds the space, loads the drawing as you scroll near it and
  starts drawing once it is in view, so it costs nothing on first load.
- On phones the drawing is cropped to its middle (the weaving shed and the warehouse).

### The pencil

With a mouse or pen, the cursors are hand-drawn in the site's ink: an arrow, and a pointing hand on links
and buttons. Press anywhere that isn't a link, button or form field and the arrow turns into a pencil;
drag to draw. The line is grainy graphite (light chalk on the deep-blue sections),
lighter when you move fast, and follows a pen's pressure. The doodle travels with the page when you
scroll, then smudges away after a short scroll. Esc clears it, Alt + drag selects text instead, and a
plain click never leaves a mark. Touch screens are left alone so dragging still scrolls.

- Drawing: `src/components/motion/PencilLayer.tsx`. Cursor and layer styles: `src/styles/pencil.css`.
- Cursor art: `public/cursors/arrow.svg`, `hand.svg` and `pencil.svg`; each `.png` / `@2x.png` pair is
  its 32 px and 64 px render (re-export both after editing an SVG). Hotspots: the arrow's tip (3, 3),
  the fingertip (12, 2) and the pencil's point (3, 29), set in `src/styles/pencil.css`.

## Contact form

Fields per the brief; validated in the browser as you go and again on the server. Spam protection is a
hidden honeypot field, a minimum fill time and a per-connection rate limit (no visible CAPTCHA).
Delivery (`src/lib/leads.ts`), configured in `.env.example`:

- `RESEND_API_KEY` emails each request to `LEADS_TO_EMAIL` (default hello@acceleret.com).
- `LEADS_WEBHOOK_URL` POSTs it as JSON, e.g. to a Google Sheet via Apps Script (the "stored somewhere
  founders can see" requirement) or to an automation that sends the optional WhatsApp alert.
- In development it is also written to `.data/leads.jsonl`.

If nothing is configured in production, the visitor sees the email/WhatsApp fallback rather than a false
"thank you". **Set at least one channel before launch.**

## Blog

Articles are written in the CMS at `/admin`. The guide for whoever writes them is
[`docs/blog-editing.md`](docs/blog-editing.md).

- **Collections** (`src/collections/`): Posts (drafts, autosave, version history), Categories, Media
  (images, alt text required, resized to card / content / share sizes) and Users (who can sign in).
- **Editor** (`src/collections/editor.ts`): headings H2–H4, bold, italic, underline, strikethrough,
  sub/superscript, inline code, links (to other articles or any URL, optional new tab and nofollow),
  bulleted, numbered and check lists, quotes, alignment, indent, divider, images with captions,
  tables, and three blocks: Callout, FAQ and Call to action. Each renders through
  `src/components/blog/RichText.tsx` and is styled in `src/styles/blog.css`. In articles, bold shows as
  a highlighter mark at regular weight, keeping the site's no-bold rule.
- **SEO per article** (the SEO tab): search title, description, share image with a live Google preview,
  canonical URL for articles first published elsewhere, and a "hide from search engines" switch. The
  site adds `BlogPosting`, `BreadcrumbList` and, when there is an FAQ block, `FAQPage` structured data;
  the article goes into `sitemap.xml` (with its last-edit date) and `/blog/rss.xml`.
- **Freshness:** blog queries are cached and tagged; saving, publishing or deleting anything in the CMS
  expires the tag (`src/collections/revalidate.ts`), so the change is live on the next page view with no
  redeploy.
- **Images** are served by Payload from `/api/media/file/…`, stored in Vercel Blob when
  `BLOB_READ_WRITE_TOKEN` is set, otherwise in `media/` (only on a server with a writable disk).
- The CMS sends no email (no adapter configured), so a forgotten password is reset by another admin
  under Users, or by adding an email adapter to `src/payload.config.ts`.

## SEO and technical

- Titles and descriptions exactly as in the brief, canonical URLs, an Open Graph image per page.
- `sitemap.xml`, `robots.txt` (keeps `/admin` and the CMS API out; blog images stay crawlable).
- schema.org `Organization` and `WebSite` on Home, `ProfessionalService` (LocalBusiness) on Contact,
  `BreadcrumbList` on case studies and blog pages, `BlogPosting` / `FAQPage` on articles.
- GA4 loads only when `NEXT_PUBLIC_GA_ID` is set; Search Console via `GOOGLE_SITE_VERIFICATION`.
- Security headers (HSTS, CSP, frame, referrer, permissions) in `next.config.ts`.
- `acceleret.in/*` and `www.acceleret.com/*` 301 to `https://acceleret.com/*` (also do this at DNS/host level).

## Launch checklist (hosting)

- Point `acceleret.com` at the host; redirect `www` and `acceleret.in` (rules are in `next.config.ts` too).
- Create the Postgres database (on Vercel: Storage › Neon) and, on Vercel, a Blob store for images.
- Set the environment variables from `.env.example`: `PAYLOAD_SECRET`, `DATABASE_URI`,
  `BLOB_READ_WRITE_TOKEN` (Vercel), and at least one contact-form channel.
- Build with `npm run vercel-build`: it applies database migrations, then builds. Vercel runs it
  automatically; elsewhere, use it as the build command.
- Open `https://acceleret.com/admin` straight after the first deploy and create the admin account.
  Until someone does, anyone who finds `/admin` could.
- Verify Search Console and submit `https://acceleret.com/sitemap.xml`.
- Reserve `careers.acceleret.com` in DNS. Turn on daily backups at the host. SSL comes from the host.
- Fill the `PENDING` placeholders (turn on `site.showPending` to see where they are).

## Measured (local production build, Lighthouse 12 mobile, simulated slow 4G)

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Home | 93 | 100 | 100 | 100 |
| Services | 96 | 100 | 100 | 100 |
| How we work | 96 | 100 | 100 | 100 |
| Products | 96 | 100 | 100 | 100 |
| Work | 97 | 100 | 100 | 100 |
| Sample case study | 95 | 100 | 100 | 66 (noindex on purpose while it's a sample) |
| Contact | 96 | 100 | 100 | 100 |
| Privacy | 97 | 100 | 100 | 100 |

Measured 10 October 2026. Total blocking time 20–40 ms and layout shift 0 on every page. Largest
paint 2.6–3.1 s under Lighthouse's simulated slow 4G (1.6 Mbps). Scores move a
few points between runs.
