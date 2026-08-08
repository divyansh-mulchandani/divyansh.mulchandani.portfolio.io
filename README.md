# Divyansh Mulchandani — Portfolio

Personal portfolio and admin dashboard built with Next.js App Router, TypeScript, Ant Design, and MongoDB.

## Architecture

```
Next.js (App Router)  →  API Routes  →  MongoDB
         ↑
     middleware.ts  (security headers + auth guard)
```

- **Frontend**: Next.js 14, React 18, Ant Design 5, CSS Modules
- **Backend**: Next.js API Routes
- **Database**: MongoDB (official Node.js driver)
- **Auth**: HMAC-SHA256 signed HTTP-only session cookies (5-min TTL)
- **Security**: CSP, HSTS, X-Frame-Options, rate limiting, CORS

## Local Setup

```bash
git clone https://github.com/divyansh-mulchandani/divyansh.mulchandani.portfolio.io.git
cd divyansh.mulchandani.portfolio.io
npm install
cp .env.example .env.local
npm run dev
```

## Build & Start

```bash
npm run build
npm start
```

## MongoDB Setup

```bash
mongod --dbpath /var/lib/mongo
node deploy/mongodb-indexes.js
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site |
| `NEXT_PUBLIC_SITE_NAME` | Site name shown in metadata |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Meta description |
| `AUTH_SECRET` | Secret for HMAC session signing (never expose) |
| `ADMIN_USERNAME` | Admin login username (server-only) |
| `ADMIN_PASSWORD` | Admin login password (server-only) |
| `CORS_ORIGIN` | Allowed CORS origin |
| `MONGODB_URI` | MongoDB connection string (server-only) |
| `MONGODB_DB` | MongoDB database name |

## Authentication

- `POST /api/auth/login` — validates credentials, sets `portfolio_session` HTTP-only cookie
- `POST /api/auth/logout` — clears the cookie
- Session: `HttpOnly; Secure (prod); SameSite=Strict; Max-Age=300`
- Signed with HMAC-SHA256 using `AUTH_SECRET`, expires after 5 minutes

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api` | No | API metadata |
| GET | `/api/status` | No | System health |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/messages` | Yes | List messages |
| POST | `/api/messages` | Yes | Create message |

## Rate Limiting

100 requests/second/IP (process-local sliding window). For multi-instance deployments replace with Redis-backed distributed limiter.

## CORS

Controlled by `CORS_ORIGIN`. `Access-Control-Allow-Origin: *` is never used with credentials.

## Security Headers

Set in `middleware.ts`:

- `Content-Security-Policy` (with `frame-ancestors 'none'`)
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

## HTTPS / Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

Nginx proxies `localhost:3000` and redirects HTTP → HTTPS.

## Logging

Structured JSON logs written to `logs/app.log` and stdout. Passwords, secrets, and credentials are never logged.

## Logrotate

```bash
sudo cp deploy/portfolio-logrotate /etc/logrotate.d/portfolio
sudo logrotate -d /etc/logrotate.d/portfolio
```

Policy: daily, 14 copies, compressed, max 10 MB.

## MongoDB Indexes

```bash
node deploy/mongodb-indexes.js
```

Creates indexes on `createdAt` (desc), `email` (asc), and `id` (unique).

## Production Deployment

```bash
npm run build
npm start
```

To run in the background with a process manager via npx:

```bash
npx --yes pm2 start npm --name portfolio -- start
npx pm2 save
```
