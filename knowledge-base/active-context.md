## Current Status
**Last Updated**: 2026-10-14
**Last Agent Session**: Prepared isolated VPS1 hosting and GitHub CI/CD; awaiting DNS write and PR validation.
**Test Suite Status**: Baseline typecheck, lint, migrations, production build and full browser suite pass (87 passed, nine intentional skips). Seven deployment regression tests and actionlint pass. Final fixture/GitHub checks in progress.

## In Progress
- [x] Establish baseline checks and isolated server provisioning.
- [ ] Complete the production release after DNS and HTTPS are available.
- [ ] Configure acceleret.com DNS, HTTPS and persistent CMS storage.
- [ ] Add tested GitHub validation and deployment automation.

## Blocked On
- Hostinger browser automation repeatedly times out. Requested root A record @ -> 195.35.6.248, TTL 300; www already has a CNAME to acceleret.com. No DNS write observed yet.
- External email delivery credentials have not been supplied; file persistence is configured.

## Decisions Needed
- Owner-managed PR merge remains the repository's documented process; main auto-deployment starts only after merge.

## Next Steps (for the next agent session)
1. Verify DNS, request the acceleret.com/www certificate with the existing certbot account, and install the reviewed HTTPS host.
2. Deploy the checked current main SHA through the restricted SSH helper and verify public behavior.
3. Inspect the setup PR checks, update launch evidence, and keep merge/deployment status distinct.

## Do Not Touch
- Other VPS1 containers, data, Nginx hosts and credentials.
- Existing CMS data or uploaded images during updates.
