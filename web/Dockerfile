# Use Arvancloud mirror (Iran). Override: docker compose build --build-arg REGISTRY=docker.io/library
ARG REGISTRY=docker.arvancloud.ir/library
ARG APK_MIRROR=https://mirror.arvancloud.ir/alpine
ARG NPM_REGISTRY=https://package-mirror.liara.ir/repository/npm/

FROM ${REGISTRY}/node:20-alpine AS deps
ARG NPM_REGISTRY
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install

FROM ${REGISTRY}/node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Self-hosted Vazirmatn (optional; falls back to Tahoma if download fails)
RUN apk add --no-cache curl 2>/dev/null || true; \
    for f in Vazirmatn-Regular.woff2 Vazirmatn-Medium.woff2 Vazirmatn-Bold.woff2; do \
      curl -fsSL --connect-timeout 20 --max-time 60 \
        "https://github.com/rastikerdar/vazirmatn/raw/master/fonts/webfonts/$f" \
        -o "public/fonts/vazirmatn/$f" 2>/dev/null || true; \
    done
ARG API_INTERNAL_URL=http://takvpn-api:8080
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM ${REGISTRY}/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
