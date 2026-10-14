# Going live

The site is not live yet. This file tracks what stands between the repo and a working
acceleret.com. The commands for each step live in [deploy-vps.md](deploy-vps.md); this file
holds the checklist, its current state, and the reasons behind it.

Tick an item (`[x]`) when the user confirms it is done, and delete this file once the site
is live and section 4 is complete.

## 1. Code on `main`

- [ ] PR #10 (contact address becomes support@acceleret.com) merged into `main`. Check with
      `gh pr view 10`. The user merges PRs themselves, with "Squash and merge" on GitHub.
      Earlier work is already on `main` (PRs #5–#9).

## 2. Outside the server

- [ ] A VPS running Ubuntu 24.04, 2 GB RAM or more (the build needs it; add swap below that).
- [ ] DNS `A` records for `acceleret.com`, `www.acceleret.com`, `acceleret.in`,
      `www.acceleret.in`, all pointing at the server's IP.
- [ ] Resend account with acceleret.com verified (their DNS records added) and an API key.
- [ ] The support@acceleret.com mailbox exists and someone reads it. Walkthrough requests
      and every public "email us" link go there.

## 3. Server `.env`

The full template is in deploy-vps.md, step 4. What matters:

| Setting | Required | Why |
|---|---|---|
| `PAYLOAD_SECRET` | yes | Signs admin logins. |
| `DATABASE_URI` | yes | Blog and case studies; `npm run build:prod` migrates before it builds. |
| `RESEND_API_KEY` + `LEADS_TO_EMAIL=support@acceleret.com` | yes | `src/lib/leads.ts` throws in production when no channel is set, so every visitor sees "didn't reach us". |
| `LEADS_FILE=1` | recommended | A backup copy of each request in `~/site/.data/leads.jsonl`. |
| `NEXT_PUBLIC_GA_ID` | later | Baked into the build: changing it needs `npm run build:prod`, not just a restart. |
| `GOOGLE_SITE_VERIFICATION` | later | Search Console. |
| `SMTP_PASS` | later | Only admin forgot-password emails use it; the user is the sole admin and chose to leave it empty. |

## 4. Deploy and first-hour steps

- [ ] Deploy steps 1–9 in deploy-vps.md, including `SEED_PUBLISH=1 npm run seed:work`, which
      loads the seven case studies (production starts empty).
- [ ] HTTPS working before the link is shared. The site sends HSTS, so a broken certificate
      locks browsers out.
- [ ] Admin account created at /admin straight away. Until one exists, whoever opens /admin
      first can create it.
- [ ] A test walkthrough request arrives at support@acceleret.com.
- [ ] Home, a case study, the blog and an unknown URL ("This page isn't on the map.")
      checked on phone and desktop.
- [ ] Nightly backup cron set up, with `~/backups` copied off the server now and then.
      `~/site/media/` (uploads, case-study covers) is outside git and exists only on disk.

## Open content question

The three client quotes in the case studies still name "Innodify", kept verbatim from the old
site. Whether they stay is the user's call; they edit them in /admin under Case studies.
