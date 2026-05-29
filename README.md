# TakVPN — Customer Web UI

Standalone Next.js frontend for TakVPN (customer site + user dashboard).  
## Related repos

| Repo | Purpose |
|------|---------|
| [takvpn-backend](https://github.com/rezashams7577/takvpn-backend) | Go API, worker, bot |
| [takvpn-admin](https://github.com/rezashams7577/takvpn-admin) | Admin panel |

Backend API and admin panel run on separate servers (not included in this repo).

## Repository layout

```
packages/shared/   # Shared forms, theme CSS, API helpers (@takvpn/shared)
web/               # Next.js 15 app (customer UI)
```

## Requirements

- Node.js 20+
- Running TakVPN API (Go backend) reachable from this app

## Local development

```bash
cp .env.example .env
# Edit API_INTERNAL_URL to point at your backend

cd web && npm install && npm run dev
```

Open http://localhost:3000

## Environment variables

| Variable | Description |
|----------|-------------|
| `API_INTERNAL_URL` | Backend base URL for `/api/*` rewrites (runtime) |
| `NEXT_PUBLIC_USER_APP_URL` | Public URL of this app (build-time) |
| `NEXT_PUBLIC_ADMIN_APP_URL` | Admin panel URL for staff links (build-time) |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL for metadata (build-time) |
| `NEXT_PUBLIC_TELEGRAM_*` / `NEXT_PUBLIC_SUPPORT_CONTACT` | Optional Telegram URLs and support line (build-time) |

Site feature flags (plan selling, ticketing, login, register) are toggled in **takvpn-admin → Site controls** at runtime; no UI rebuild required.

## Docker (production)

```bash
cp .env.example .env
# Set API_INTERNAL_URL to backend on your network (e.g. http://api.internal:8080)

docker compose build
docker compose up -d
```

## Sync from monorepo

This repo is standalone. Develop here directly, or copy changes from a legacy monorepo before deleting it.

## Deploy on a separate server

1. Deploy **takvpn-backend** and run migrations (including `016_site_settings`).
2. Deploy **takvpn-admin**; configure site flags under **Site controls** (super_admin).
3. Clone this repo on the UI server; set `.env` with production API and public URLs.
4. `docker compose up -d --build` (or build/push image in CI).
5. Put nginx/Caddy in front with TLS; proxy only this host to port 3000.
6. Ensure the UI server can reach the API (`API_INTERNAL_URL`).
