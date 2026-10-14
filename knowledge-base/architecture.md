# Architecture

## System Overview
One Next.js application serves public company pages, Payload's administration interface and its REST API. PostgreSQL stores CMS content and users. Uploads live on disk outside Git. The contact form is a server action that attempts each configured delivery channel and succeeds if any channel succeeds.

## Architecture Diagram
Browser -> Nginx HTTPS -> Next.js / Payload -> PostgreSQL
                                      -> media/ uploads
                                      -> .data/leads.jsonl / Resend / webhook

## Layers & Responsibilities
| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js, React, Tailwind, GSAP | Company pages, animations and contact UI |
| Backend/API | Payload, Next server actions | CMS editing, uploads, contact validation and delivery |
| Database | PostgreSQL | Posts, categories, case studies, media metadata, users |
| Auth | Payload users | CMS sessions and login throttling |
| Storage | Persistent local disk | Uploaded images and optional contact submission archive |
| Hosting | Existing VPS1 Nginx | Exact-host HTTPS routing; new app isolation being configured |
| Testing | Playwright, tsc, ESLint | Public behavior and static validation |

## Data Flow
Public blog and case-study queries use Payload's local API with explicit published-only filters. Next cache tags are invalidated by collection hooks. Production migrations in src/migrations create the schema. src/scripts/seed-work.ts imports missing case studies and cover photos; existing entries are skipped. The contact action validates fields and applies spam checks before src/lib/leads.ts delivers to configured channels.

## Key Design Patterns
The integrated CMS shares the application process. Production database migration and content seeding are explicit operations, separate from HTTP runtime. File delivery is a supported server-side contact channel when LEADS_FILE=1.

## External Dependencies
PostgreSQL is required for builds and dynamic CMS routes. Resend/webhook are optional configured contact channels. Gmail SMTP is used only for admin email when SMTP_PASS exists. Next public analytics values require a rebuild to change.

## Scalability & Limits
VPS1 also runs unrelated applications. Build workloads should run off-host. One site process and one isolated PostgreSQL database suffice for the current scope; uploaded media and caches must remain writable and persistent as appropriate.

## What NOT to Do
- Do not use a static export for this app.
- Do not share another application's database role or expose PostgreSQL publicly.
- Do not overwrite uploads or contact records during a release.
- Do not infer email delivery from a successful file-only contact submission.

## Related documentation
See [testing.md](testing.md), [known-issues.md](known-issues.md), and the launch checklist at ../docs/go-live.md.
