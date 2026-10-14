# Deploying to a VPS

How to put acceleret.com on your own server, from an empty Ubuntu machine to
the live site. Written for Ubuntu 24.04. Each step is a command you can paste.

The site is one Next.js app with Payload CMS inside it. On the server it needs:

- Node.js 22
- PostgreSQL, for the blog and the case studies
- nginx in front, for HTTPS
- pm2, to keep the app running and restart it after a reboot

Plan for at least 2 GB of RAM. The build needs more memory than running the
site does; on a 1 GB server, add swap first (step 1).

---

## 1. Prepare the server

Log in as root once and create a user to run the site:

```bash
adduser acceleret
usermod -aG sudo acceleret
```

Log in as `acceleret` from now on. Then install everything:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx postgresql certbot python3-certbot-nginx ufw

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Firewall: SSH and web only
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Only on a server with less than 2 GB of RAM, add 2 GB of swap:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Create the database

Pick a strong password and use it in place of `CHANGE_ME`:

```bash
sudo -u postgres psql -c "CREATE USER acceleret WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE acceleret OWNER acceleret;"
```

Postgres only listens on the server itself, so nothing outside can reach it.

## 3. Get the code

```bash
cd ~
git clone https://github.com/<your-account>/<your-repo>.git site
cd site
git checkout main
npm ci
```

Run `npm ci` on the server itself. Never copy `node_modules` from a Windows
machine, because the image library (sharp) is built for each system.

## 4. Settings (`.env`)

Create `~/site/.env`. The build and the running site both read it, and git
ignores it, so it never leaves the server:

```bash
nano ~/site/.env
```

```ini
# --- Required
# Signs admin logins. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PAYLOAD_SECRET=paste-a-long-random-string
DATABASE_URI=postgres://acceleret:CHANGE_ME@localhost:5432/acceleret

# --- Contact form: at least one of these, or every send fails
# Option A, email through Resend (resend.com). acceleret.com must be verified there.
RESEND_API_KEY=
LEADS_TO_EMAIL=support@acceleret.com
LEADS_FROM_EMAIL=Acceleret website <website@acceleret.com>
# Option B, a webhook such as a Google Sheet (Apps Script) or Make/Zapier
LEADS_WEBHOOK_URL=
LEADS_WEBHOOK_SECRET=
# Stopgap: also save every request to ~/site/.data/leads.jsonl on the server
LEADS_FILE=1

# --- Optional
# Admin password-reset emails (a Gmail App Password, not the account password)
SMTP_USER=acceleret.official@gmail.com
SMTP_PASS=
# Google Analytics 4, e.g. G-XXXXXXXXXX
NEXT_PUBLIC_GA_ID=
# Google Search Console HTML-tag token
GOOGLE_SITE_VERIFICATION=
```

```bash
chmod 600 ~/site/.env
```

`NEXT_PUBLIC_GA_ID` is built into the pages, so changing it later needs a
rebuild (step 5). The other settings only need a restart.

## 5. Build

```bash
cd ~/site
npm run build:prod
```

This applies the database changes (migrations) first, then builds the site.
Run it again after every update.

## 6. Add the case studies (first deploy only)

```bash
SEED_PUBLISH=1 npm run seed:work
```

This loads the seven case studies and downloads their cover photos into
`~/site/media/`. It is safe to run twice; existing ones are skipped. Edit them
afterwards in /admin under Case studies.

## 7. Start the site

```bash
cd ~/site
pm2 start npm --name acceleret -- start -- -p 3000
pm2 save
pm2 startup        # prints one sudo command: run it, so the site starts after a reboot
```

Check that it answers: `curl -I http://localhost:3000` should show `200`.

## 8. nginx

```bash
sudo nano /etc/nginx/sites-available/acceleret
```

```nginx
server {
    listen 80;
    server_name acceleret.com www.acceleret.com acceleret.in www.acceleret.in;

    # Image uploads in /admin
    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/acceleret /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

The app itself sends www.acceleret.com and acceleret.in to https://acceleret.com,
so nginx only has to pass every name through. The contact form's spam limit
reads `X-Forwarded-For`, so keep that header.

## 9. Domain and HTTPS

At your domain provider, point these at the server's IP address with an `A`
record:

- `acceleret.com`
- `www.acceleret.com`
- `acceleret.in`
- `www.acceleret.in`

Once they resolve (`ping acceleret.com` shows the server's IP), get the
certificates:

```bash
sudo certbot --nginx -d acceleret.com -d www.acceleret.com -d acceleret.in -d www.acceleret.in
```

Certbot adds HTTPS to the nginx file and renews it on its own. Get HTTPS
working before you share the link: the site tells browsers to use only HTTPS
from then on (HSTS).

## 10. Straight after the first deploy

1. **Create your admin account.** Open https://acceleret.com/admin at once.
   Until an admin exists, the first person to open that page can create one.
2. **Send yourself a test request** through the contact form and check that it
   arrives (email, Sheet, or `~/site/.data/leads.jsonl`).
3. Open the home page, a case study, the blog and a made-up address (it should
   show "This page isn't on the map."), on a phone as well as a computer.

---

## Updating the site

After changes are merged into `main`:

```bash
cd ~/site
git pull
npm ci
npm run build:prod
pm2 reload acceleret
```

The site keeps running during the build and switches over at `pm2 reload`.

## What must never be deleted

- `~/site/media/`: every image uploaded in /admin, and the case-study covers.
  git ignores it, so `git pull` leaves it alone.
- The `acceleret` database.

## Backups

A nightly copy of the database and the images, keeping the last 14 days:

```bash
mkdir -p ~/backups
crontab -e
```

Add this line:

```cron
0 3 * * * pg_dump postgres://acceleret:CHANGE_ME@localhost:5432/acceleret | gzip > ~/backups/db-$(date +\%F).sql.gz && tar -czf ~/backups/media-$(date +\%F).tar.gz -C ~/site media && find ~/backups -mtime +14 -delete
```

Copy `~/backups` off the server now and then (for example with `scp` to your
computer). A backup that only lives on the server is lost with the server.

## When something is wrong

| Problem | Look at |
|---|---|
| Site down or 502 | `pm2 status`, then `pm2 logs acceleret --lines 100` |
| Contact form says it didn't send | `pm2 logs acceleret`, and check the RESEND / webhook settings in `.env` |
| Build fails at "migrate" | `DATABASE_URI` in `.env`, and `sudo systemctl status postgresql` |
| Images missing | `ls ~/site/media`; restore it from a backup |
| HTTPS errors | `sudo certbot renew --dry-run`, then `sudo nginx -t` |
