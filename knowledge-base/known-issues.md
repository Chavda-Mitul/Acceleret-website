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
**Status**: Open
**Severity**: High
**Discovered**: 2026-10-14
**Symptom**: A new Payload database allows the first visitor to create the administrator.
**Root Cause**: Initial-user creation is part of Payload's bootstrap flow.
**Workaround**: Provision the first administrator privately before exposing /admin.
**Fix**:
**Regression Test**: Verify production redirects /admin to login and rejects unauthenticated user creation after bootstrap.
