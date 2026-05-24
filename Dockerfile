# Build from repo root: docker build -t takvpn-web .
ARG REGISTRY=docker.io/library
ARG NPM_REGISTRY=https://registry.npmjs.org/

FROM ${REGISTRY}/node:20-alpine AS deps
ARG NPM_REGISTRY
WORKDIR /app
COPY packages/shared/package.json packages/shared/
COPY web/package.json web/package-lock.json* web/.npmrc* ./web/
COPY packages/shared ./packages/shared
WORKDIR /app/web
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install

FROM ${REGISTRY}/node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/web/node_modules ./web/node_modules
COPY --from=deps /app/packages/shared ./packages/shared
COPY web ./web
WORKDIR /app/web
RUN apk add --no-cache curl 2>/dev/null || true; \
    for f in Vazirmatn-Regular.ttf Vazirmatn-Medium.ttf Vazirmatn-Bold.ttf; do \
      curl -fsSL --connect-timeout 20 --max-time 60 \
        "https://github.com/rastikerdar/vazirmatn/raw/master/fonts/ttf/$f" \
        -o "public/fonts/vazirmatn/$f" 2>/dev/null || true; \
    done
ARG API_INTERNAL_URL=http://127.0.0.1:8080
ARG NEXT_PUBLIC_USER_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_ADMIN_APP_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV NEXT_PUBLIC_USER_APP_URL=$NEXT_PUBLIC_USER_APP_URL
ENV NEXT_PUBLIC_ADMIN_APP_URL=$NEXT_PUBLIC_ADMIN_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM ${REGISTRY}/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
