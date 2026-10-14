## Decision: Keep Payload inside the Next.js application
**Date**: 2026-10-14
**Status**: Accepted
**Context**: The existing repository integrates the CMS admin, REST API and public pages in one app.
**Decision**: Preserve the existing application structure and PostgreSQL adapter during VPS deployment.
**Alternatives Considered**: Static export cannot provide the CMS, database queries and contact server action.
**Consequences**: Builds and runtime require PostgreSQL and Payload configuration; uploaded media needs persistent disk.

## Decision: Retain the existing browser test conventions
**Date**: 2026-10-14
**Status**: Accepted
**Context**: tests/e2e already covers routes, contact validation, navigation, CMS publication and responsive behavior.
**Decision**: Continue using Playwright against a production build, with desktop and 360px mobile projects.
**Alternatives Considered**: A separate UI test framework would duplicate the existing contract checks.
**Consequences**: Browser checks require Chrome, a built application and seeded test content for complete CMS coverage.

## Decision: Isolate the site with bounded Docker releases and build against production content
**Date**: 2026-10-14
**Status**: Accepted
**Context**: VPS1 already hosts other applications, has about 3 GiB available RAM at inspection, and has Docker/Nginx but no host Node or PostgreSQL service. CMS queries are cached at build time.
**Decision**: Use a private Docker network/database and dedicated application UID, keep source/builds per release, validate in GitHub, and build production in a bounded container against the actual CMS. Promote through Nginx after health checks.
**Alternatives Considered**: Installing/upgrading host Node/PostgreSQL and following the blank-server guide would unnecessarily affect shared infrastructure. Shipping a build from the isolated CI database would embed test or empty content. Static export cannot serve CMS/actions.
**Consequences**: CI builds do not require production credentials. A production deploy still consumes bounded server resources and requires backward-compatible migrations. Old releases and root-private backups are retained for recovery.

## Decision: Grant GitHub only a fixed deployment capability
**Date**: 2026-10-14
**Status**: Accepted
**Context**: Deployment must operate Docker and Nginx without giving a GitHub runner unrestricted root SSH access.
**Decision**: Create a dedicated key/account with OpenSSH restrict and a forced command; the root-owned helper accepts only current-main SHA deployments, status and backups. Pin the known server key in GitHub.
**Alternatives Considered**: Reusing the operator root key or adding the account to the Docker group would grant broad host control.
**Consequences**: The app release can update itself within its container and database scope, while changes to the root helper require operator review/install.

## Decision: Enforce production session-cookie flags at TLS termination
**Date**: 2026-10-14
**Status**: Accepted
**Context**: Real CMS login returned an HttpOnly cookie without Secure under the supplied Payload defaults. Nginx terminates HTTPS for this deployment.
**Decision**: Apply Secure, HttpOnly and SameSite=Lax to payload-token in the exact site's Nginx proxy and verify the real response.
**Alternatives Considered**: Changing shared Payload authentication configuration would also affect local HTTP development and is unnecessary for this hosting change.
**Consequences**: Production sessions gain HTTPS transport protection without changing the application's auth model or local development behavior.
