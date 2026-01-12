---
id: deployment
type: guide
status: active
created: 2026-01-13
---

# Deployment Guide

## Stack

- **Registry:** Aliyun ACR (cn-hangzhou)
- **Host:** Aliyun ECS
- **Proxy:** Caddy (external network)
- **Runtime:** Node 20 Alpine

## Prerequisites

### GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `ALIYUN_REGISTRY_USER` | ACR username |
| `ALIYUN_REGISTRY_PWD` | ACR password |
| `ECS_HOST` | Server IP |
| `ECS_USER` | SSH user |
| `ECS_SSH_KEY` | SSH private key |

### GitHub Variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint |

### ECS Setup

```bash
docker network create app_network
mkdir -p ~/projects/vestige
```

Create `~/projects/vestige/.env`:

```bash
ALIYUN_IMAGE=crpi-ij9x44p6hsmr6cr5.cn-hangzhou.personal.cr.aliyuncs.com/srm-project/vestige:latest
```

### Caddy Config

Add to Caddyfile:

```
vestige.your-domain.com {
    reverse_proxy vestige_app:8000
}
```

Reload:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Deploy

1. Go to GitHub Actions
2. Select "Deploy to Aliyun ECS"
3. Click "Run workflow"

## Verify

```bash
# On ECS
docker ps | grep vestige
docker logs vestige_app
```

## Rollback

```bash
cd ~/projects/vestige
docker-compose down
# Update ALIYUN_IMAGE in .env to previous tag
docker-compose pull
docker-compose up -d
```

## Local Build Test

```bash
docker build -t vestige:test .
docker run -p 8000:8000 vestige:test
```
