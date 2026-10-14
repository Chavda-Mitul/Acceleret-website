## ISSUE-001: External contact notifications are unconfigured
**Status**: Open
**Severity**: Medium
**Discovered**: 2026-10-14
**Symptom**: Production credentials for Resend or the leads webhook are not available in the repository.
**Root Cause**: Provider configuration is external to source control and must be provisioned separately.
**Workaround**: Source explicitly supports durable `.data/leads.jsonl` storage when LEADS_FILE=1. This does not prove email delivery.
**Fix**:
**Regression Test**: tests/e2e/site.spec.ts covers form submission with file delivery; provider acceptance needs a separate authorized delivery check.

## ISSUE-002: CMS bootstrap must be secured before public launch
**Status**: Resolved
**Severity**: High
**Discovered**: 2026-10-14
**Resolved**: 2026-10-14
**Symptom**: A new Payload database allows the first visitor to create the administrator.
**Root Cause**: Initial-user creation is part of Payload's bootstrap flow.
**Workaround**: Provision the first administrator privately before exposing /admin.
**Fix**: Provisioned the first user through loopback before Nginx promotion. Production has one user; login returns 200 and unauthenticated user creation returns 403. The public admin shell can return 200 with a client-side login redirect.
**Regression Test**: Private first-user provisioning is in deploy/vps/deploy.py. Live checks verified one administrator, successful login and denied unauthenticated creation; no application auth logic was changed.

## ISSUE-003: Immediate HTTPS check can hit old Nginx workers
**Status**: Resolved
**Severity**: Medium
**Discovered**: 2026-10-14
**Resolved**: 2026-10-14
**Symptom**: The first healthy candidate rolled back because HTTPS still returned the previous maintenance response immediately after a successful reload.
**Root Cause**: The reload command returns after signalling the Nginx master; replacement workers do not necessarily accept requests before the next command executes.
**Workaround**: Keep the old release available while waiting for HTTPS to return the exact candidate release header.
**Fix**: Added a bounded retry that requires both HTTP success and X-Acceleret-Release to match the checked SHA. The repeated restricted-SSH deployment completed and public verification matched 61f6d1c4212ce94fec3f5e4c7078f9b7729dba79.
**Regression Test**: deploy/vps/deploy_test.py covers transient maintenance, a healthy stale release, and exhausting the wait without the expected header.

## ISSUE-004: Default CMS session cookie lacks Secure
**Status**: Resolved
**Severity**: Medium
**Discovered**: 2026-10-14
**Resolved**: 2026-10-14
**Symptom**: The first production login returned an HttpOnly session cookie without Secure.
**Root Cause**: The supplied Payload authentication configuration leaves the cookie's Secure option at its default; TLS terminates at Nginx.
**Workaround**: Enforce HTTPS cookie flags at the exact site's proxy.
**Fix**: Added proxy_cookie_flags for payload-token with secure, httponly and samesite=lax. A repeated real login verifies Secure and HttpOnly; unauthenticated creation remains 403.
**Regression Test**: Live HTTP verification asserts actual Set-Cookie flags. No automated unit test added because this is Nginx configuration only; nginx -t and actual allowed/denied HTTP requests verified the behavior.
