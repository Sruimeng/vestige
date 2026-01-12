FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_BASE_URL
ARG VITE_USE_MOCK=false
RUN pnpm build-production

FROM caddy:alpine AS runner
COPY --from=builder /app/dist/client /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 8000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
