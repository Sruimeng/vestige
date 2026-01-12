---
id: strategy-ecs-deploy
type: strategy
status: ready
created: 2026-01-13
updated: 2026-01-13
---

# Strategy: ECS Deployment

## 1. Analysis

**Context:**
- React Router v7 SSR
- Build: `pnpm build-production` -> `./dist`
- Runtime: `react-router-serve ./dist/server/index.js`
- Port: 3000
- Node: >=20.0.0, pnpm: 9.6.0

**Constitution:**
- Ref: reify-sdk (ACR + ECS + docker-compose)
- ACR: `crpi-ij9x44p6hsmr6cr5.cn-hangzhou.personal.cr.aliyuncs.com/srm-project`
- ECS Path: `~/projects/vestige/`
- Secrets: ALIYUN_REGISTRY_USER, ALIYUN_REGISTRY_PWD, ECS_HOST, ECS_USER, ECS_SSH_KEY
- Network: `app_network` (external, shared with Caddy)

**Style Protocol:** Strict Adherence to Hemingway (Iceberg Principle, No Fluff).

**Negative Constraints:**
- NO hardcoded secrets
- NO root user in container
- NO `npm` (use pnpm only)
- NO dev dependencies in production image
- NO exposed ports without reverse proxy
- NO `latest` tag in production workflows

## 2. Assessment

<Assessment>
**Complexity:** Level 2 (Infrastructure, no math)
</Assessment>

## 3. File Manifest

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (node:20-alpine) |
| `docker-compose.yml` | Service definition |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `.env.example` | Deploy vars template |
| `.dockerignore` | Build exclusions |
| `llmdoc/guides/deployment.md` | Ops guide |

## 4. Implementation Specs

### 4.1 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_BASE_URL
ARG VITE_USE_MOCK=false
RUN pnpm build-production

RUN pnpm --filter=. --prod deploy pruned

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/pruned/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs
EXPOSE 3000
CMD ["node", "node_modules/@react-router/serve/dist/cli.js", "./dist/server/index.js"]
```

### 4.2 docker-compose.yml

```yaml
services:
  vestige:
    image: ${ALIYUN_IMAGE:-vestige:latest}
    container_name: vestige_app
    restart: always
    env_file:
      - .env
    environment:
      - TZ=Asia/Shanghai
      - NODE_ENV=production
    networks:
      - app_network

networks:
  app_network:
    external: true
```

### 4.3 .github/workflows/deploy.yml

```yaml
name: Deploy to Aliyun ECS

on:
  workflow_dispatch:

env:
  REGISTRY: crpi-ij9x44p6hsmr6cr5.cn-hangzhou.personal.cr.aliyuncs.com
  NAMESPACE: srm-project
  IMAGE_NAME: vestige
  FULL_IMAGE_TAG: crpi-ij9x44p6hsmr6cr5.cn-hangzhou.personal.cr.aliyuncs.com/srm-project/vestige:latest

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Aliyun ACR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.ALIYUN_REGISTRY_USER }}
          password: ${{ secrets.ALIYUN_REGISTRY_PWD }}

      - name: Build and Push Docker Image
        run: |
          docker build \
            --build-arg VITE_API_BASE_URL=${{ vars.VITE_API_BASE_URL }} \
            --build-arg VITE_USE_MOCK=false \
            -t ${{ env.FULL_IMAGE_TAG }} .
          docker push ${{ env.FULL_IMAGE_TAG }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Copy config to ECS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.ECS_HOST }}
          username: ${{ secrets.ECS_USER }}
          key: ${{ secrets.ECS_SSH_KEY }}
          source: "docker-compose.yml"
          target: "~/projects/vestige/"

      - name: Deploy to ECS via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.ECS_HOST }}
          username: ${{ secrets.ECS_USER }}
          key: ${{ secrets.ECS_SSH_KEY }}
          script: |
            export ALIYUN_IMAGE=${{ env.FULL_IMAGE_TAG }}
            mkdir -p ~/projects/vestige
            cd ~/projects/vestige
            echo "${{ secrets.ALIYUN_REGISTRY_PWD }}" | docker login ${{ env.REGISTRY }} --username "${{ secrets.ALIYUN_REGISTRY_USER }}" --password-stdin
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker logout ${{ env.REGISTRY }}
            docker image prune -f
```

### 4.4 .dockerignore

```
node_modules
dist
pruned
.git
.github
*.md
.env*
!.env.example
llmdoc
.husky
```

### 4.5 .env.example (additions)

```bash
# === Deployment ===
ALIYUN_IMAGE=crpi-ij9x44p6hsmr6cr5.cn-hangzhou.personal.cr.aliyuncs.com/srm-project/vestige:latest
```

### 4.6 ECS Caddy Config (Manual Setup)

Caddyfile entry (add to existing Caddy on ECS):

```
vestige.your-domain.com {
    reverse_proxy vestige_app:3000
}
```

## 5. Execution Plan

<ExecutionPlan>
**Block 1: Local Files**
1. Create `Dockerfile`
2. Create `docker-compose.yml`
3. Create `.github/workflows/deploy.yml`
4. Create `.dockerignore`
5. Update `.env.example` with ALIYUN_IMAGE

**Block 2: GitHub Configuration**
1. Add Secret: ALIYUN_REGISTRY_USER
2. Add Secret: ALIYUN_REGISTRY_PWD
3. Add Secret: ECS_HOST
4. Add Secret: ECS_USER
5. Add Secret: ECS_SSH_KEY
6. Add Variable: VITE_API_BASE_URL

**Block 3: Aliyun ACR**
1. Create repository: srm-project/vestige

**Block 4: ECS Setup**
1. Ensure `app_network` exists: `docker network create app_network`
2. Create dir: `mkdir -p ~/projects/vestige`
3. Create `.env` with ALIYUN_IMAGE
4. Update Caddyfile with vestige reverse proxy
5. Reload Caddy: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`

**Block 5: Documentation**
1. Create `llmdoc/guides/deployment.md`
</ExecutionPlan>

## 6. Verification Checklist

- [ ] `docker build .` succeeds locally
- [ ] Container runs: `docker run -p 3000:3000 vestige:test`
- [ ] GitHub Actions workflow completes
- [ ] ECS container healthy: `docker ps`
- [ ] Domain resolves and serves app
