# Incel Customer Feedback

Next.js fullstack customer satisfaction form for Incel Holidays and Tourism.

- Public form: `/`
- Admin: `/admin` (password-protected) + CSV at `/admin/export`
- Postgres via Prisma (`DB_*` / `DATABASE_URL`)
- Google SMTP via nodemailer (`EMAIL_*`) — same env style as incel_prospiz / incel-portal

## Do I need any external SaaS?

**No.** Production uses what you already have:

| Need | Service |
|---|---|
| Hosting | Your CapRover (same as prospiz) |
| Database | Your CapRover Postgres |
| Email | Your Google SMTP / Workspace relay |
| Images | GitHub Container Registry (GHCR) via CI |

No Neon, Resend, Vercel, Formspree, etc.

## Local development

```bash
cp .env.example .env
# fill DB_* + DATABASE_URL for local Postgres
# EMAIL_DEBUG=true → emails print in the terminal

npm install
npx prisma migrate dev
npm run dev
```

- Form: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

## Production deploy (prospiz-style CI/CD)

Same flow as `incel_prospiz`: **push to `main` → GitHub Actions builds Docker image → GHCR → CapRover pulls image**.

### 1. Create the database (one-time)

On your CapRover Postgres:

```sql
CREATE DATABASE incel_feedback_db;
CREATE USER incel_feedback_user WITH PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE incel_feedback_db TO incel_feedback_user;
\c incel_feedback_db
GRANT ALL ON SCHEMA public TO incel_feedback_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO incel_feedback_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO incel_feedback_user;
```

Note the internal host, e.g. `srv-captain--incel-portal-postgres` (same pattern as prospiz).

### 2. Create the CapRover app (one-time)

1. CapRover → **Apps** → create empty app: `incel-feedback`
2. Attach your domain (e.g. `feedback.inceltourism.com`)
3. HTTP port: **3000**
4. **Deployment → Method 3: Deploy via ImageName**  
   Image (after first CI run):  
   `ghcr.io/<your-github-owner>/incel-feedback:latest`
5. Enable webhook deploy and copy the app token (for GitHub secret `CAPROVER_TOKEN_FEEDBACK`)
6. If GHCR packages are private: CapRover → Cluster → Docker Registry → `ghcr.io` + PAT with `read:packages`

### 3. Set CapRover env vars

```env
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

DB_NAME=incel_feedback_db
DB_USER=incel_feedback_user
DB_PASSWORD=
DB_HOST=srv-captain--YOUR-POSTGRES-APP
DB_PORT=5432
# Optional but fine to set explicitly:
# DATABASE_URL=postgresql://incel_feedback_user:PASS@srv-captain--YOUR-POSTGRES-APP:5432/incel_feedback_db

EMAIL_HOST=smtp-relay.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=info@inceltourism.com
EMAIL_SENDER_NAME=Incel Holidays and Tourism
EMAIL_EHLO_DOMAIN=inceltourism.com
EMAIL_ENABLED=true
EMAIL_DEBUG=false
INTERNAL_NOTIFICATION_EMAILS=ops@yourdomain.com
```

`EMAIL_EHLO_DOMAIN` must be a real domain (not a CapRover container hostname). Google returns `421 … (EHLO)` if EHLO is something like `srv-captain--incel-feedback…`.


### 4. GitHub secrets (repo Settings → Secrets)

| Secret | Value |
|---|---|
| `CAPROVER_SERVER` | Same as prospiz (e.g. `https://captain.…`) |
| `CAPROVER_TOKEN_FEEDBACK` | Webhook token from the `incel-feedback` CapRover app |

`GITHUB_TOKEN` is provided automatically for GHCR push.

### 5. Push to `main`

```bash
git push origin main
```

CI workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) will:

1. Build-check the Next.js app  
2. Build & push `ghcr.io/<owner>/incel-feedback:latest`  
3. Trigger CapRover to pull and redeploy  

Container start runs `prisma migrate deploy` then `npm run start` (same idea as prospiz Django `migrate && gunicorn` in its Dockerfile `CMD`).

### 6. Smoke test

- Open the public form URL and submit a test response  
- `/admin/login` with `ADMIN_PASSWORD`  
- Confirm internal inbox got the notification (with `EMAIL_DEBUG=false`)

## About `captain-definition` / `docker-entrypoint.sh`

Those were removed so this matches prospiz.

- **`captain-definition`** — only used when CapRover builds from your git repo / Dockerfile on the server (**Method 1/2**). Prospiz does **not** use that; it deploys a **pre-built image from GHCR**. You do not need `captain-definition`.
- **`docker-entrypoint.sh`** — a custom start script I had added for migrate + URL assembly. Prospiz instead puts start logic in the Dockerfile `CMD` (Django) or CapRover start command. This app now does the same: migrate + start are inline in the Dockerfile `CMD`.

You **do** still need the **`Dockerfile`** — prospiz has one too; CI builds that into the GHCR image CapRover runs.
