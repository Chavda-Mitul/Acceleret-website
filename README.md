# acceleret.com

The Acceleret website: what Acceleret builds (custom software around how a business already
works), how it works with clients, its work, its team, a blog and a contact form to book a walkthrough.

Built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. The blog is written in Payload CMS
at `/admin`, stored in Postgres.

## Run it

Copy `.env.example` to `.env.local` and set `PAYLOAD_SECRET` and `DATABASE_URI`.

```bash
npm install
npm run dev          # http://localhost:3000, CMS at /admin
npm run check        # typecheck, lint, build, e2e tests
```

## Deploy (VPS)

```bash
npm ci
npm run build:prod   # applies database migrations, then builds
npm start            # serves on port 3000; put a reverse proxy with HTTPS in front
```

Set the variables from `.env.example` on the server. Uploaded blog images are saved in `media/`;
keep that folder between deploys. Create the admin account at `/admin` right after the first deploy.

Content lives in `src/content/`; the writer's guide for the blog is [`docs/blog-editing.md`](docs/blog-editing.md).
