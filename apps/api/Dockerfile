# syntax=docker/dockerfile:1

# Stage 1: Base runtime
FROM node:22-alpine AS base
WORKDIR /app

# Stage 2: Production runner (non-root)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY apps/api/deploy ./

# Switch to non-root node user
USER node
EXPOSE 8080

HEALTHCHECK --interval=5s --timeout=3s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
