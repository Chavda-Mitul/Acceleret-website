# GitHub CI/CD

## What this subsystem does
`.github/workflows/ci-cd.yml` validates pull requests, main pushes and manual runs. Production deployment depends on successful checks and is restricted to main push/manual events. The documented owner workflow remains a squash merge of reviewed pull requests.

## Structure
The `Production checks` job runs Ubuntu 24.04, Node 22 and an isolated PostgreSQL 17 service. It installs the lockfile including development dependencies, runs TypeScript and ESLint, executes the Python deployment regression tests, applies Payload migrations, seeds test content, builds production and runs both existing browser projects with Chrome. Failed browser traces/reports are retained for seven days.

`src/scripts/seed-ci.ts` creates a deterministic published case-study fixture without network downloads. It refuses to run unless CI=true and the database name is acceleret_ci. The existing seed:blog command creates the example article only inside the isolated test database. Both are seeded before next build so static pages include test content.

The `Deploy VPS1` job uses the repository's production environment and serializes production writes. It calls the root-owned fixed-purpose deployment helper through a dedicated restricted SSH account. It then checks public HTTPS and matches X-Acceleret-Release to the exact checked commit. CI artifacts are never copied into production.

## Configuration
| GitHub setting | Purpose |
|---|---|
| Repository secret VPS_SSH_KEY | Dedicated deployment private key, restricted on VPS1 |
| Repository secret VPS_KNOWN_HOSTS | Existing independently verified VPS1 Ed25519 host pin |
| Repository variable VPS_HOST | 195.35.6.248 |
| Repository variable VPS_USER | acceleret-deploy |

The workflow has contents:read only. Actions are pinned to commit SHAs. No production database, CMS signing or email secret is sent to pull-request checks. PR events cannot run the deployment job. Concurrent deploys are serialized without cancelling a running migration/build.

## Conventions and rules
Merge reviewed changes to main to deploy. A manually dispatched run must target main to deploy. The server rejects stale SHA requests if main has advanced; the subsequent newer workflow is responsible for deploying the new head. Owner-installed deployment helper updates require explicit review and installation on the server; a repository change does not silently replace a root-owned command.

## Known gotchas
- Adding a workflow on a PR branch does not activate main deployment until the owner merges it.
- The production environment may require owner approval if its protection settings are later enabled.
- Existing branch protection was absent at inspection. The workflow gates its own deployment, but an unprotected branch can still be merged without successful PR checks.
- Production builds run with bounded resources on VPS1 against actual content. GitHub checks run independently against test content.
- SSH keys are written only to the ephemeral runner's private temporary files. General commands and short or non-main deployment refs are rejected by the server helper.

## How it is tested
Run the full workflow on the setup pull request, then inspect its actual job conclusions. Run the installed restricted command through SSH and verify that arbitrary commands are refused. Final CI/CD qualification requires a successful main deployment job and a matching public release header; a passing PR check alone does not prove automatic deployment.

## Related documentation
[Deployment](deployment.md), [Testing](testing.md), [Active context](active-context.md).
