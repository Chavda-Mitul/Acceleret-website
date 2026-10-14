# VPS1 deployment

## What this subsystem does
VPS1 hosts the supplied Next.js/Payload application behind its existing Nginx, using an isolated Docker network and PostgreSQL container. The application runs as an unprivileged dedicated Unix UID. Each production release is built in a fresh directory against the production database; the previous release keeps serving until the candidate passes health checks.

## Structure
- Host: srv1922603, 195.35.6.248, Ubuntu 24.04.
- `/opt/acceleret/config.json`: root-owned runtime image digest and application UID/GID.
- `/opt/acceleret/secrets/app.env`, `db.env`, `admin.json`: private configuration; never copy to Git, logs or reports.
- `/opt/acceleret/postgres`: isolated persistent database files, container `acceleret-db`, no published database port.
- `/opt/acceleret/shared/media` and `shared/.data`: persistent CMS uploads and contact archive.
- `/opt/acceleret/releases/<sha>-<timestamp>-<nonce>`: individual source, dependencies and builds.
- `/opt/acceleret/current.json`, `history`: active release identity and retained previous states.
- `/opt/acceleret/nginx-upstream.conf`: exact app port and public X-Acceleret-Release header.
- `/opt/acceleret/backups`: database dumps, media/contact archives and release metadata.
- `deploy/vps/provision.py`: reviewed one-time root setup; refuses an existing installation.
- `deploy/vps/deploy.py`: installed root-owned at `/usr/local/sbin/acceleret-deploy`.
- `deploy/vps/nginx.conf`: HTTPS host template for acceleret.com and www.acceleret.com.

## Conventions and rules
The deployment helper accepts only `deploy <full 40-character SHA>`, `status`, or `backup`. Deployment verifies that the SHA is the current remote main commit both before building and before promotion. It validates archive paths, rejects symlinks/special files, saves a backup before migrations, then installs dependencies and builds in a restricted container. Only the first release imports the seven existing case studies; the example blog seed is never run in production.

The app alternates loopback ports 3210 and 3211. Nginx switches only after public-page and database API checks, a private first-admin bootstrap, and Nginx syntax validation. A failed proxy promotion restores the previous proxy configuration. A failed public HTTPS check also restores it. Previous files and stopped containers are retained; no automatic file/image/backup deletion is configured.

Node is pinned by the official node:22.23.2-bookworm-slim image digest captured at provisioning. Build containers have 1 CPU and 2 GiB RAM (3 GiB including swap); runtime has 1 CPU and 768 MiB RAM. PostgreSQL has 0.25 CPU and 256 MiB RAM. Container logs rotate at three 10 MiB files. The app cannot access the Docker socket or host secrets directory.

DNS is an A record for @ to 195.35.6.248, TTL 300; the existing www CNAME points to acceleret.com. Existing mail records and service subdomains must remain unchanged. Only acceleret.com and www.acceleret.com are in this task's domain scope. acceleret.in is not provisioned by this deployment.

## Backups and recovery
`sudo /usr/local/sbin/acceleret-deploy backup` saves a PostgreSQL custom-format dump and uploads/contact files. The systemd timer `acceleret-backup.timer` runs around 03:00 IST (21:30 UTC) with up to five minutes of jitter. Backups are root-private and retained. Copy them off-host; server-local backups alone do not cover host loss.

To inspect the current release as the deployment account: `ssh acceleret-deploy@195.35.6.248 status`. General shell access is rejected. The operator's existing root SSH access is separate.

For manual application rollback, an operator must inspect current.json and the matching history, start the retained previous app container, health-check its loopback port, restore its known proxy configuration, run nginx -t, reload Nginx, then record the new current state. Do not automatically reverse migrations: restoring a database can discard edits received since the backup and requires a deliberate recovery decision.

## Known gotchas
- CMS pages cache data during next build. A CI build containing test content must never be deployed as production output.
- Migrations must remain backward-compatible with the previous live application during a release; app rollback cannot reverse database changes.
- A production rebuild is required to change NEXT_PUBLIC_GA_ID.
- LEADS_FILE=1 saves successful requests only to a private server file unless another delivery channel is configured. File delivery does not establish an email notification.
- The first admin is provisioned privately from root-only admin.json before routing public requests. Its credential must be shared through a private channel.
- Retaining all releases and backups consumes disk. The deploy command refuses to start with less than 6 GiB free. No cleanup is authorized by this workflow.
- Existing unrelated Nginx protocol/OCSP warnings predate this change; successful nginx -t is required.

## How it is tested
`python -m unittest discover -s deploy/vps -p '*_test.py' -v` covers command rejection, archive containment, port alternation, proxy validation and rollback. Python compilation and shell syntax checks cover the installed helpers. Deployment verification additionally requires actual database migration, bootstrapped admin, case-study content/media, HTTPS, redirects, contact persistence, and a before/after comparison of unrelated containers. See active-context.md for observed launch results; this document is not itself proof of live qualification.

## Related documentation
[CI/CD](ci-cd.md), [Architecture](architecture.md), [Testing](testing.md), [Known issues](known-issues.md).
