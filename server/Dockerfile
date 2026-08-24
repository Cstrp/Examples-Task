# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable
RUN corepack install --global pnpm@11.23.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

FROM build AS production

RUN pnpm prune --prod

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=production --chown=node:node /app/package.json ./package.json
COPY --from=production --chown=node:node /app/node_modules ./node_modules
COPY --from=production --chown=node:node /app/dist ./dist
COPY --from=production --chown=node:node /app/prisma ./prisma
COPY --from=production --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --from=production --chown=node:node /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod 755 ./docker-entrypoint.sh
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["./docker-entrypoint.sh"]
