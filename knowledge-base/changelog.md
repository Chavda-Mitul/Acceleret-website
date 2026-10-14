# Changelog

## 2026-10-14 — Prepare isolated VPS1 hosting and gated GitHub deployment
**What**: Added the GitHub validation/deploy workflow, tested server helpers, isolated database/storage, restricted deployment identity and nightly backups.
**Why**: Host the supplied website on VPS1 at acceleret.com and deploy successful main changes automatically.
**Impact**: New site infrastructure only. Existing applications remain outside this task. Production requires DNS/HTTPS and an initial release; automatic main deployment requires the owner to merge the setup PR.
**Files Changed**: .github/workflows/ci-cd.yml, deploy/vps/*, src/scripts/seed-ci.ts, .gitattributes, .gitignore, README.md, docs/deploy-vps.md, knowledge-base/*
**Tests**: Baseline typecheck/lint/migrations/build pass; full production browser suite 87 passed with nine existing intentional skips. Seven Python deployment tests, Python compilation, shell syntax and actionlint pass. Restricted SSH backup succeeds and an arbitrary shell command is rejected. Final fixture and GitHub workflow checks pending.
**Commit**: Not yet committed

- Production builds use the actual CMS inside a resource-limited container; isolated CI content is never shipped to visitors.
- Every update preserves media/contact data, backs up the database and health-checks a candidate before Nginx promotion. Failed promotion restores the prior proxy.
- The first CMS user is provisioned privately before public routing. External email credentials remain unconfigured.
- No automatic file, release, image or backup deletion is installed. No root operator key is stored in GitHub.

## 2026-10-14 — Establish deployment knowledge base
**What**: Added task-relevant architecture, testing, decisions and launch status documentation from the inspected repository.
**Why**: The authorized hosting and CI/CD task found no knowledge-base folder.
**Impact**: Documentation only; no application behavior changed.
**Files Changed**: knowledge-base/README.md, active-context.md, decisions.md, known-issues.md, testing.md, architecture.md, changelog.md
**Tests**: Not run yet; documentation cross-checked with source, existing tests, deployment docs and read-only VPS inspection. No automated test added because this entry documents existing behavior only.
**Commit**: Not yet committed

- Verified that the site requires Next.js, Payload, PostgreSQL and persistent uploaded media.
- Recorded external notification and first-admin bootstrap requirements without claiming deployment completion.
