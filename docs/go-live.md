# Going live

The site is live at **https://acceleret.com** on VPS1 as of 2026-10-14, serving
main commit `61f6d1c4212ce94fec3f5e4c7078f9b7729dba79`. HTTP and www redirect
to the canonical HTTPS host. The CMS, seven case studies, cover images and private
contact storage were verified. Email notifications remain unconfigured.

Current operations are documented in [deployment.md](../knowledge-base/deployment.md)
and [ci-cd.md](../knowledge-base/ci-cd.md). The blank-server commands in deploy-vps.md
are historical. Keep this file as launch evidence and track remaining provider work;
check items only after direct verification or owner confirmation.

## 1. Code on `main`

- [x] All supplied site work merged into `main` through PR #12. The user merges PRs themselves, with "Squash and merge" on
      GitHub; the server deploys whatever is on `main`.

## 2. Outside the server

- [x] VPS1 running Ubuntu 24.04, with isolated site containers and bounded build/runtime resources.
- [x] DNS `A` record for `acceleret.com` to 195.35.6.248 (added by the owner); existing
      `www.acceleret.com` CNAME to acceleret.com. acceleret.in aliases were outside this task.
- [ ] Resend account with acceleret.com verified (their DNS records added) and an API key.
- [ ] The support@acceleret.com mailbox exists and someone reads it. Walkthrough requests
      and every public "email us" link go there.

## 3. Server `.env`

The full template is in deploy-vps.md, step 4. What matters:

| Setting | Required | Why |
|---|---|---|
| `PAYLOAD_SECRET` | yes | Signs admin logins. |
| `DATABASE_URI` | yes | Blog and case studies; `npm run build:prod` migrates before it builds. |
| `RESEND_API_KEY` or `LEADS_WEBHOOK_URL` | for external notifications | Not configured. File delivery succeeds independently; no mailbox/provider delivery is claimed. |
| `LEADS_FILE=1` | configured | A private persistent copy at `/opt/acceleret/shared/.data/leads.jsonl`; one labelled real browser submission was verified. |
| `NEXT_PUBLIC_GA_ID` | later | Baked into the build: changing it needs `npm run build:prod`, not just a restart. |
| `GOOGLE_SITE_VERIFICATION` | later | Search Console. |
| `SMTP_PASS` | later | Only admin forgot-password emails use it; the user is the sole admin and chose to leave it empty. |

## 4. Deploy and first-hour steps

- [x] Deploy through the reviewed restricted SSH helper, with migrations and all seven
      case studies loaded. No example blog article was published.
- [x] HTTPS working, with certificate renewal active. Certificate covers acceleret.com
      and www.acceleret.com and expires 2027-01-12.
- [x] Admin created privately before public routing; real login succeeds and unauthenticated
      user creation returns 403. Session cookie has Secure and HttpOnly.
- [ ] A test walkthrough request arrives at support@acceleret.com.
- [x] Home, a case study, the blog and an unknown URL ("This page isn't on the map.")
      checked on phone and desktop.
- [x] Nightly backup systemd timer active, saving private database/media/contact archives
      under `/opt/acceleret/backups`. Uploads persist across releases. A private off-host
      copy was saved on the owner's PC and its PostgreSQL archive manifest verified.
- [ ] Owner merges [CI/CD PR #13](https://github.com/Chavda-Mitul/Acceleret-website/pull/13),
      then the actual main deployment job and public release header are verified.

## Open content question

The three client quotes in the case studies still name "Innodify", kept verbatim from the old
site. Whether they stay is the user's call; they edit them in /admin under Case studies.
