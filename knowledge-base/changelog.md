# Changelog

## 2026-10-14 — Host acceleret.com on VPS1 and add gated GitHub deployment
**What**: Deployed the supplied main website over HTTPS and added the GitHub validation/deploy workflow, tested server helpers, isolated database/storage, restricted deployment identity and nightly backups.
**Why**: Host the supplied website on VPS1 at acceleret.com and deploy successful main changes automatically.
**Impact**: New site infrastructure only. All 58 pre-existing containers are unchanged. The website is live; the documented owner must merge setup PR #13 to activate automatic main deployment.
**Files Changed**: .github/workflows/ci-cd.yml, deploy/vps/*, src/scripts/seed-ci.ts, .gitattributes, .gitignore, .env.example, README.md, docs/deploy-vps.md, docs/go-live.md, knowledge-base/*
**Tests**: Local and GitHub typecheck/lint/migrations/build and 87 browser tests pass, with nine intentional skips. Ten Python deployment regressions, Python compilation, shell syntax and actionlint pass. Live route/content/media/auth/redirect/404/contact checks pass; both timers are active. Restricted SSH backup succeeds and a shell command is rejected. Nginx cookie configuration was checked with nginx -t and actual allowed/denied HTTP requests; no unit test added because it is configuration only. Final PR checks run again after the helper update.
**Commit**: `a65d130` (initial setup; follow-up fixes in this PR)

- Production builds use the actual CMS inside a resource-limited container; isolated CI content is never shipped to visitors.
- Every update preserves media/contact data, backs up the database and health-checks a candidate before Nginx promotion. Failed promotion restores the prior proxy.
- The first CMS user is provisioned privately before public routing. External email credentials remain unconfigured.
- No automatic file, release, image or backup deletion is installed. No root operator key is stored in GitHub.
- Fixed a reproduced first-deploy rollback caused by checking HTTPS before Nginx replacement workers served the new configuration; the helper now waits for the exact release header.
- Verified CMS login and added the missing Secure session-cookie flag at the HTTPS proxy. The generated administrator credential is kept in a private local handoff file outside Git.
- CI fixture creation was run twice against an isolated acceleret_ci database; it retained one case study.
- A post-launch database/media/contact backup was copied privately off-host; pg_restore read the archive manifest successfully. No full database restore drill was performed.

## 2026-10-14 — Establish deployment knowledge base
**What**: Added task-relevant architecture, testing, decisions and launch status documentation from the inspected repository.
**Why**: The authorized hosting and CI/CD task found no knowledge-base folder.
**Impact**: Documentation only; no application behavior changed.
**Files Changed**: knowledge-base/README.md, active-context.md, decisions.md, known-issues.md, testing.md, architecture.md, changelog.md
**Tests**: Not run yet; documentation cross-checked with source, existing tests, deployment docs and read-only VPS inspection. No automated test added because this entry documents existing behavior only.
**Commit**: Not yet committed

- Verified that the site requires Next.js, Payload, PostgreSQL and persistent uploaded media.
- Recorded external notification and first-admin bootstrap requirements without claiming deployment completion.
