# Acceleret

**Software built around how your business works.**

This is the website for [acceleret.com](https://acceleret.com), a software studio in Surat, India.
Acceleret builds CRM and ERP systems, workflow automation, AI-assisted processes, web portals,
apps and integrations. It works on-site with each client's team, so the software fits the way the
business already runs instead of forcing it to change.

> Build > Automate > Accelerate

## The site

The site follows one customer enquiry through a business. A pencil sketch shows how work is held
together today, through WhatsApp, Excel and memory. A blue line then redraws it as connected
software. Headings are handwritten, diagrams are sketched before they ink in, and visitors can
doodle on the page with a pencil cursor.

| Page | What's on it |
| --- | --- |
| [Home](https://acceleret.com) | The problem, the six services, the process, recent work and the team |
| [Services](https://acceleret.com/services) | CRM, ERP, workflow automation, AI-assisted processes, portals and apps, integrations |
| [How we work](https://acceleret.com/how-we-work) | Embed, Map, Build, Run |
| [Products](https://acceleret.com/products) | Acceleret's own products, starting with a CRM for travel agencies |
| [Work](https://acceleret.com/work) | Case studies: what was built and what changed |
| [Who we are](https://acceleret.com/team) | The founders |
| [Blog](https://acceleret.com/blog) | Practical writing on CRM, ERP, workflow automation and custom software |
| [Contact](https://acceleret.com/contact) | Book a 30-minute operations walkthrough |

## Built with

- [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [GSAP](https://gsap.com) and [Lenis](https://lenis.darkroom.engineering) for scroll animation, with a calm mode for reduced motion
- [Payload CMS 3](https://payloadcms.com) for the blog, at `/admin`, on PostgreSQL
- [Playwright](https://playwright.dev) for end-to-end tests

## Getting started

You need Node.js 20 or later and a PostgreSQL database.

```bash
git clone https://github.com/Chavda-Mitul/Acceleret-website.git
cd Acceleret-website
npm install
cp .env.example .env.local   # then set PAYLOAD_SECRET and DATABASE_URI
npm run dev                  # http://localhost:3000
```

The CMS is at http://localhost:3000/admin. The first visit there creates the admin account.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build:prod` | Apply database migrations, then build for production |
| `npm start` | Serve the production build on port 3000 |
| `npm run check` | Typecheck, lint, build and run the end-to-end tests |
| `npm run seed:blog` | Add an example draft article |

## Project structure

```text
src/
  app/(site)/      Public pages
  app/(payload)/   Blog CMS (/admin) and its API
  content/         All site copy: services, work, team, contact details, SEO text
  components/      Page sections, diagrams, drawings and animation
  collections/     Blog data: posts, categories, images, users
  migrations/      Database migrations
docs/
  blog-editing.md  Guide for whoever writes the blog
```

To change text on the site, edit the files in `src/content/`.

## Deployment

The site runs on a VPS with Node.js and PostgreSQL:

```bash
npm ci
npm run build:prod
npm start            # behind a reverse proxy (e.g. Nginx or Caddy) that serves HTTPS
```

- Set the environment variables listed in `.env.example` on the server.
- Blog images are stored in `media/`. Keep this folder between deploys.
- Open `/admin` right after the first deploy and create the admin account.
  Until someone does, anyone who finds the page could create it.

## Contact

[hello@acceleret.com](mailto:hello@acceleret.com) · Surat, Gujarat, India

© Acceleret. All rights reserved.
