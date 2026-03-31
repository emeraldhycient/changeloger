# Deployment Guide

## Vercel (Recommended)

Changeloger is built on Next.js and deploys natively to Vercel with zero configuration.

### Steps

1. Push your repository to GitHub.

2. Import the project in [Vercel Dashboard](https://vercel.com/new).

3. Configure environment variables in Vercel's project settings:

   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/callback/google
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   GITHUB_CALLBACK_URL=https://your-domain.com/api/auth/callback/github
   GITHUB_APP_ID=...
   GITHUB_APP_PRIVATE_KEY=...
   GITHUB_APP_WEBHOOK_SECRET=...
   OPENAI_API_KEY=...
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   POLAR_ACCESS_TOKEN=...
   POLAR_WEBHOOK_SECRET=...
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   JWT_SECRET=<random-32-char-string>
   ```

4. Deploy. Vercel automatically detects Next.js and configures the build.

5. Run database migrations:

   ```bash
   npx prisma migrate deploy
   ```

6. Register your GitHub App webhook URL as `https://your-domain.com/api/webhooks/github`.

7. Register your Polar webhook URL as `https://your-domain.com/api/webhooks/polar`.

### Custom Domain

Configure your custom domain in Vercel's project settings under Domains. Update `NEXT_PUBLIC_APP_URL` and all OAuth callback URLs accordingly.

## Self-Hosted (Node.js)

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7+
- pnpm 9+

### Steps

1. Clone and install:

   ```bash
   git clone https://github.com/your-org/changeloger.git
   cd changeloger
   pnpm install
   ```

2. Create `.env` from the template:

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Set up the database:

   ```bash
   npx prisma migrate deploy
   ```

4. Build the application:

   ```bash
   pnpm build
   ```

5. Start the production server:

   ```bash
   pnpm start
   ```

   The server runs on port 3000 by default. Use `PORT` environment variable to change.

6. (Optional) Use a process manager like PM2:

   ```bash
   pm2 start npm --name changeloger -- start
   ```

### Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name changeloger.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Setup

### PostgreSQL

Create the database:

```sql
CREATE DATABASE changeloger;
CREATE USER changeloger_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE changeloger TO changeloger_user;
```

Connection string format:

```
postgresql://changeloger_user:your_password@localhost:5432/changeloger
```

### Managed Databases

Recommended providers:

- **Neon** -- Serverless PostgreSQL, free tier available
- **Supabase** -- PostgreSQL with built-in auth and realtime
- **Railway** -- Simple managed PostgreSQL
- **AWS RDS** -- Enterprise-grade

### Redis

Redis is used for:

- Background job queue (BullMQ)
- AI response caching (7-day TTL)
- Rate limiting

Recommended providers:

- **Upstash** -- Serverless Redis, works with Vercel
- **Redis Cloud** -- Managed Redis
- **Railway** -- Simple managed Redis

## GitHub App Registration

1. Go to [GitHub Developer Settings](https://github.com/settings/apps/new).

2. Fill in the app details:

   | Field | Value |
   |-------|-------|
   | App name | Changeloger |
   | Homepage URL | `https://your-domain.com` |
   | Callback URL | `https://your-domain.com/api/github/installation` |
   | Setup URL | `https://your-domain.com/api/github/installation` |
   | Webhook URL | `https://your-domain.com/api/webhooks/github` |
   | Webhook secret | Generate a random string |

3. Set permissions:

   | Permission | Access |
   |------------|--------|
   | Repository contents | Read-only |
   | Metadata | Read-only |
   | Webhooks | Read & Write |

4. Subscribe to events: `push`, `create`, `release`.

5. After creation, note the App ID and generate a private key.

6. Set environment variables:

   ```
   GITHUB_APP_ID=<app-id>
   GITHUB_APP_PRIVATE_KEY=<private-key-contents>
   GITHUB_APP_WEBHOOK_SECRET=<webhook-secret>
   ```

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set (all required)
- [ ] OAuth callback URLs match deployed domain
- [ ] GitHub App webhook URL registered
- [ ] Polar webhook URL registered
- [ ] SSL/TLS configured
- [ ] Health check: visit `/` and `/sign-in`
- [ ] Test OAuth flow: sign in with Google/GitHub
- [ ] Test webhook: push a commit to a connected repo
