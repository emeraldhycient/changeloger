# Deployment Guide

This document covers deploying Changeloger to production, including Vercel (recommended), self-hosted setups, infrastructure provisioning, GitHub App registration, and post-deployment verification.

---

## Vercel Deployment (Recommended)

Changeloger is a Next.js 16 application and deploys natively to Vercel with zero build configuration.

### Step-by-Step

**1. Push your repository to GitHub.**

Vercel integrates directly with GitHub for automatic deployments on push.

**2. Import the project in the Vercel Dashboard.**

Navigate to [vercel.com/new](https://vercel.com/new), select your GitHub repository, and import it. Vercel will automatically detect the Next.js framework.

**3. Configure environment variables.**

In the Vercel project settings under "Environment Variables", add all required variables:

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/changeloger?sslmode=require

# Redis
REDIS_URL=redis://default:password@host:6379

# Auth - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/callback/google

# Auth - GitHub OAuth
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GITHUB_CALLBACK_URL=https://your-domain.com/api/auth/callback/github

# GitHub App
GITHUB_APP_ID=your-github-app-id
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
GITHUB_APP_WEBHOOK_SECRET=your-webhook-secret

# AI
OPENAI_API_KEY=sk-your-openai-key
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

# Billing
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_WEBHOOK_SECRET=your-polar-webhook-secret
POLAR_ORGANIZATION_ID=your-polar-org-id

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
JWT_SECRET=generate-a-random-32-character-string
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Widget
WIDGET_CDN_URL=https://your-domain.com/widget
```

Note: For the `GITHUB_APP_PRIVATE_KEY`, replace actual newlines in the PEM file with `\n` escape sequences when entering it as a single-line environment variable.

**4. Deploy.**

Click "Deploy". Vercel will run `next build` automatically and deploy the output. Subsequent pushes to the `main` branch trigger automatic redeployments.

**5. Run database migrations.**

After the first deployment, run migrations against your production database. You can do this from your local machine or a CI pipeline:

```bash
DATABASE_URL="your-production-database-url" pnpm prisma migrate deploy
```

**6. Configure custom domain (optional).**

In the Vercel project settings under "Domains", add your custom domain. After DNS propagation, update:

- `NEXT_PUBLIC_APP_URL` to your custom domain
- All OAuth callback URLs (`GOOGLE_CALLBACK_URL`, `GITHUB_CALLBACK_URL`)
- GitHub App webhook URL
- Polar webhook URL

**7. Register webhook URLs.**

- GitHub App webhook: `https://your-domain.com/api/webhooks/github`
- Polar billing webhook: `https://your-domain.com/api/webhooks/polar`

### Vercel-Specific Considerations

| Concern | Recommendation |
|---|---|
| Serverless function timeout | Vercel Pro plan provides 60-second timeout (sufficient for most operations). Upgrade from Hobby if needed. |
| Background jobs | BullMQ workers require a persistent Node.js process. Use a separate worker deployment (see below) or a dedicated compute service for job processing. |
| Cron jobs | Use Vercel Cron for scheduled tasks (analytics rollup, trial expiry checks, usage resets). |
| Edge functions | Not recommended for API routes that require database access or heavy processing. Use standard serverless functions. |

### Worker Deployment for Background Jobs

BullMQ workers require a long-running process that is not compatible with Vercel's serverless model. Options for running workers:

1. **Separate Node.js process** on a VPS (e.g., Railway, Render, Fly.io) that connects to the same Redis and PostgreSQL instances.
2. **Docker container** running the worker entry point alongside the Vercel deployment.
3. **Vercel Functions with queue polling** as a temporary solution for low-volume workloads.

---

## Self-Hosted Deployment (Node.js)

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20+ |
| PostgreSQL | 16+ |
| Redis | 7+ |
| pnpm | 9+ |

### Step-by-Step

**1. Clone and install dependencies.**

```bash
git clone https://github.com/your-org/changeloger.git
cd changeloger
pnpm install
```

**2. Configure environment variables.**

```bash
cp .env.example .env
```

Edit `.env` with your production values. See the [Environment Variables](#environment-variables-by-deployment-type) section below.

**3. Run database migrations.**

```bash
pnpm prisma migrate deploy
```

**4. Build the application.**

```bash
pnpm build
```

**5. Start the production server.**

```bash
pnpm start
```

The server runs on port 3000 by default. Override with the `PORT` environment variable.

**6. (Recommended) Use a process manager.**

```bash
# Using PM2
pm2 start npm --name changeloger -- start

# Or using systemd (create a service file)
```

**7. Configure a reverse proxy.**

Place nginx or Caddy in front of the Node.js process for TLS termination, HTTP/2, and request buffering.

**nginx example:**

```nginx
server {
    listen 443 ssl http2;
    server_name changeloger.example.com;

    ssl_certificate /etc/letsencrypt/live/changeloger.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/changeloger.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Caddy example (automatic TLS):**

```
changeloger.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

### Docker Considerations

A minimal `Dockerfile` for production:

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t changeloger .
docker run -p 3000:3000 --env-file .env changeloger
```

---

## Environment Variables by Deployment Type

### Required for All Deployments

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (with `?sslmode=require` for remote databases) |
| `REDIS_URL` | Redis connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL (must match deployed domain) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID (for user login) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL (must match deployed domain) |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key in PEM format |
| `GITHUB_APP_WEBHOOK_SECRET` | Secret for HMAC-SHA256 webhook signature verification |
| `OPENAI_API_KEY` | OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | Public-facing application URL (no trailing slash) |
| `JWT_SECRET` | Random secret for signing JWT tokens (minimum 32 characters) |

### Optional / With Defaults

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `openai` | AI provider selection |
| `AI_MODEL` | `gpt-4o-mini` | AI model identifier |
| `JWT_EXPIRY` | `15m` | JWT access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | `7d` | Refresh token lifetime |
| `WIDGET_CDN_URL` | `{NEXT_PUBLIC_APP_URL}/widget` | Widget bundle base URL |

### Billing (Optional)

| Variable | Description |
|---|---|
| `POLAR_ACCESS_TOKEN` | Polar API access token |
| `POLAR_WEBHOOK_SECRET` | Secret for Polar webhook signature verification |
| `POLAR_ORGANIZATION_ID` | Polar organization identifier |

Billing variables are only required if you intend to enable paid plans. The application functions on the free tier without them.

---

## Database Setup

### PostgreSQL

**Create the database and user:**

```sql
CREATE DATABASE changeloger;
CREATE USER changeloger_app WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE changeloger TO changeloger_app;
```

**Connection string format:**

```
postgresql://changeloger_app:your-secure-password@localhost:5432/changeloger
```

For remote databases, append `?sslmode=require`:

```
postgresql://changeloger_app:your-secure-password@db.example.com:5432/changeloger?sslmode=require
```

**Apply migrations:**

```bash
pnpm prisma migrate deploy
```

**Verify:**

```bash
pnpm prisma studio
```

### Recommended Managed PostgreSQL Providers

| Provider | Notes |
|---|---|
| Neon | Serverless PostgreSQL with a free tier. Good fit for Vercel deployments. |
| Supabase | PostgreSQL with additional features. Free tier available. |
| Railway | Simple managed PostgreSQL with straightforward pricing. |
| AWS RDS | Enterprise-grade. Recommended for production workloads with high availability requirements. |

### Redis Setup

Redis serves two functions in Changeloger:

1. **BullMQ job queue** -- Stores pending, active, and completed background jobs.
2. **AI response cache** -- Caches AI provider responses with a 7-day TTL.

**Local development:**

```bash
# macOS
brew install redis
brew services start redis

# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Connection string format:**

```
redis://localhost:6379
redis://default:password@redis.example.com:6379
```

### Recommended Managed Redis Providers

| Provider | Notes |
|---|---|
| Upstash | Serverless Redis with a generous free tier. Native Vercel integration. |
| Redis Cloud | Managed Redis with persistence and high availability. |
| Railway | Simple managed Redis. |

---

## GitHub App Registration

### Step-by-Step

**1. Navigate to GitHub App creation.**

Go to [github.com/settings/apps/new](https://github.com/settings/apps/new) (for personal accounts) or `github.com/organizations/{org}/settings/apps/new` (for organizations).

**2. Fill in the application details.**

| Field | Value |
|---|---|
| GitHub App name | `Changeloger` (must be globally unique) |
| Homepage URL | `https://your-domain.com` |
| Callback URL | `https://your-domain.com/api/github/installation` |
| Setup URL (optional) | `https://your-domain.com/api/github/installation` |
| Webhook URL | `https://your-domain.com/api/webhooks/github` |
| Webhook secret | Generate a random string (e.g., `openssl rand -hex 32`) |
| Webhook active | Checked |

**3. Configure permissions.**

Under "Repository permissions":

| Permission | Access Level |
|---|---|
| Contents | Read-only |
| Metadata | Read-only |

Under "Organization permissions": none required.

Under "Account permissions": none required.

**4. Subscribe to events.**

Check the following webhook events:

- `push` -- Triggered on commits pushed to the repository.
- `create` -- Triggered when a tag or branch is created.
- `release` -- Triggered when a release is published on GitHub.

**5. Set installation scope.**

Select "Any account" to allow any GitHub user or organization to install the app, or restrict to specific accounts for private deployments.

**6. Create the app and collect credentials.**

After creation:

- Note the **App ID** displayed on the app settings page.
- Click "Generate a private key" to download the PEM file.
- Copy the **webhook secret** you entered earlier.

**7. Set environment variables.**

```bash
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_WEBHOOK_SECRET=your-webhook-secret-from-step-2
```

**8. Create OAuth credentials (separate from the App).**

For user authentication, you also need a standard GitHub OAuth App:

1. Go to [github.com/settings/developers](https://github.com/settings/developers).
2. Click "New OAuth App".
3. Set the authorization callback URL to `https://your-domain.com/api/auth/callback/github`.
4. Copy the Client ID and Client Secret.

```bash
GITHUB_CLIENT_ID=your-oauth-client-id
GITHUB_CLIENT_SECRET=your-oauth-client-secret
GITHUB_CALLBACK_URL=https://your-domain.com/api/auth/callback/github
```

---

## Post-Deployment Verification Checklist

Run through this checklist after every production deployment:

### Infrastructure

- [ ] Database migrations applied successfully (`pnpm prisma migrate deploy`)
- [ ] All required environment variables are set and non-empty
- [ ] PostgreSQL connection is functional (application starts without database errors)
- [ ] Redis connection is functional (BullMQ can enqueue and process jobs)
- [ ] SSL/TLS is configured and certificates are valid

### Authentication

- [ ] OAuth callback URLs match the deployed domain exactly
- [ ] Google OAuth sign-in flow completes successfully
- [ ] GitHub OAuth sign-in flow completes successfully
- [ ] JWT tokens are issued and validated correctly
- [ ] Session expiration and refresh work as expected

### GitHub Integration

- [ ] GitHub App webhook URL is registered and active
- [ ] Webhook signature verification passes (push a test commit)
- [ ] GitHub App can be installed by users
- [ ] Installation callback creates `GithubInstallation` records
- [ ] Repository listing works after installation

### Billing (if enabled)

- [ ] Polar webhook URL is registered and active
- [ ] Checkout flow redirects correctly
- [ ] Subscription lifecycle events are processed (create, update, cancel)

### Application

- [ ] Homepage loads without errors (visit `/`)
- [ ] Sign-in page loads (visit `/sign-in`)
- [ ] Dashboard loads after authentication
- [ ] Widget API returns changelog data for a valid embed token
- [ ] Background jobs process within expected timeframes

### Performance

- [ ] API response times are under 200ms for read operations (p95)
- [ ] Marketing pages achieve Lighthouse score above 90
- [ ] No unhandled errors in application logs
