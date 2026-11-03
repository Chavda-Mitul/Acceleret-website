# Deployment and CMS security

## What this subsystem does
The deployment exposes only the intended public website and CMS over HTTPS, protects the first CMS account before public access, and limits GitHub's server capability to this application's release operations. This documents the scoped launch controls, not a comprehensive application security audit.

## Structure
- `src/collections/Users.ts`: existing Payload authentication, five failed-login attempts and ten-minute lockout.
- `src/payload.config.ts`: CMS signing secret and PostgreSQL adapter.
- `deploy/vps/deploy.py`: private first-user bootstrap and constrained production commands.
- `deploy/vps/ssh-command.sh`: forced SSH entry point through restricted sudo.
- `deploy/vps/nginx.conf`: exact hosts, valid TLS, forwarded client address, upload limits and session-cookie flags.
- `/opt/acceleret/secrets`: root-only signing/database configuration and initial administrator handoff. No secret values belong in this knowledge base.

## Conventions and rules
The first user is created through the loopback candidate before Nginx routes public traffic. Later deployments leave existing users unchanged. The initial administrator email is support@acceleret.com; obtain its generated password through the private handoff, never GitHub, public chat artifacts, logs or screenshots. Administrator password-reset email is not configured.

Nginx marks payload-token Secure, HttpOnly and SameSite=Lax, and redirects HTTP/www to https://acceleret.com while preserving path/query. X-Forwarded-For is overwritten with the actual direct client address to avoid accepting a caller-supplied value for the contact rate limit. Database and app ports are not published on external interfaces.

The CI key is distinct from the operator's root key. OpenSSH restrict disables forwarding/PTY capabilities, and a forced command permits only current-main deployment, status or backup. Repository credentials never include the production database or Payload secret. Untrusted release code executes as an unprivileged UID in a container without the Docker socket or host secrets-directory mount.

## Known gotchas
- Authenticated CMS users retain the existing application's editing permissions; no new role model was introduced.
- Email notifications and password resets remain unconfigured until their provider credentials are supplied.
- Local developer machine DNS cached the old www absence during launch. Fresh server DNS and the certificate authority resolved it and all www redirects passed; do not change server routing to accommodate a stale resolver.
- The application sends HSTS including subdomains; certificate renewal must remain active.
- Root-only backup archives contain private contact records and CMS account hashes. Off-host copies need equivalent private storage.

## How it is tested
The public production checks observed successful administrator login, Secure/HttpOnly Set-Cookie flags, denied unauthenticated user creation, all intended HTTPS redirects and no example blog publication. Ten Python deployment tests cover restricted command input, archive containment and promotion/rollback contracts. The restricted account successfully backed up its own app and rejected a general shell command. Nginx syntax validation passes; unchanged unrelated-container identities are recorded separately.

## Related documentation
[Deployment](deployment.md), [CI/CD](ci-cd.md), [Known issues](known-issues.md), [Testing](testing.md).
