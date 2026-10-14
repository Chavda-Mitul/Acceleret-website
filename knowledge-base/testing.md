# Testing

## Test Frameworks in Use
Playwright (@playwright/test ^1.64.0) runs against `next start` on port 3219. TypeScript and ESLint provide static checks.

## How to Run Tests
| Command | What it runs |
|---|---|
| `npm run typecheck` | Next type generation and tsc |
| `npm run lint` | ESLint |
| `npm run build:prod` | Payload migrations and Next production build |
| `npm run test:e2e` | Full desktop and mobile browser suite |
| `npm run check` | Typecheck, lint, build and browser suite |
| `python -m unittest discover -s deploy/vps -p '*_test.py' -v` | Deployment command, archive and rollback contracts |

## Test File Conventions
Existing tests live in tests/e2e and use *.spec.ts. playwright.config.ts starts a fresh production server and enables local lead storage.

## What Must Be Tested
Deployments need typecheck, lint, production build and the full browser suite. Infrastructure changes also need syntax validation and focused deployment-contract checks.

## Mocks, Fakes, and Fixtures
Use an isolated PostgreSQL database for validation, never production. `seed:work` imports the seven existing case studies; `seed:blog` adds an example article. SEED_PUBLISH=1 publishes these test fixtures. Production must not receive the example blog seed. Contact tests use LEADS_FILE=1 instead of real outbound notifications.

GitHub uses the dedicated acceleret_ci database, the generated example blog and deterministic src/scripts/seed-ci.ts case study, avoiding external photo downloads. The fixture script refuses other database names or non-CI execution. Deployment helper tests use Python's standard unittest module without new dependencies. Temporary test files are retained locally under the applicable recoverable-removal policy.

## Known Flaky Tests
The initial full local production suite passed 87 tests with nine intentional device/pure-logic skips, after importing all seven case studies and the example blog. No failures observed. Seed test content so CMS coverage does not skip. Final GitHub verification is tracked in active-context.md.
