# Acceleret website
> Next.js company website with Payload CMS, blog, case studies and walkthrough requests.

## Tech Stack
| Layer | Technology |
|---|---|
| Language | TypeScript |
| Framework | Next.js 16.4.0, React 19.3.0, Payload 3.90.2 |
| Database | PostgreSQL via @payloadcms/db-postgres |
| Hosting | VPS1, Ubuntu 24.04; deployment being configured |
| Auth | Payload users at /admin |
| Test Runner | Playwright 1.64, desktop and 360px mobile Chrome |

## Directory Structure
- `src/app/(site)`: public pages and contact server action.
- `src/app/(payload)`: CMS admin and REST API.
- `src/collections`, `src/payload.config.ts`: CMS schema and adapters.
- `src/migrations`: committed production database migrations.
- `src/scripts`: first-deployment content imports.
- `src/lib`: cached CMS queries, contact delivery and shared utilities.
- `public`: checked-in assets; `media` is untracked persistent CMS storage.
- `tests/e2e`: production browser and validation checks.
- `docs`: editorial guidance and historical launch instructions.

## Critical Rules
- Read root AGENTS.md and docs/go-live.md before launch work; verify documentation against code.
- Never commit credentials, uploaded media, contact submissions or database backups.
- Preserve the database, `media/` and `.data/` across releases.
- Production migrations must run before building against a database.
- PAYLOAD_SECRET and DATABASE_URI are required during build and runtime.
- NEXT_PUBLIC_GA_ID is compiled into the build.
- The documented workflow has owners squash-merge PRs; production follows main.
- Do not modify existing VPS1 applications as part of this deployment.

## Quick Facts
| Key | Value |
|---|---|
| Repo | https://github.com/Chavda-Mitul/Acceleret-website |
| Prod URL | https://acceleret.com |
| VPS1 | srv1922603, 195.35.6.248 |
| Test Command | `npm run check` (requires PostgreSQL and local Chrome) |

## Reading Order
| File | When to Read |
|---|---|
| README.md | Every session |
| active-context.md | Every session |
| decisions.md | Before architecture changes |
| known-issues.md | Before debugging or launch |
| testing.md | Before running or changing checks |
| architecture.md | Before changing execution or persistence |
| deployment.md | VPS1 operations, storage, backups and recovery |
| ci-cd.md | GitHub checks and production deployment |
