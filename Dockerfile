FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY lib/db/package.json lib/api-zod/package.json lib/db/
COPY lib/api-zod/package.json lib/api-zod/
COPY artifacts/api-server/package.json artifacts/api-server/

RUN pnpm install --frozen-lockfile

COPY lib/ lib/
COPY artifacts/api-server/ artifacts/api-server/

RUN pnpm --filter @workspace/api-server run build

FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/pnpm-lock.yaml pnpm-lock.yaml
COPY --from=builder /app/artifacts/api-server/dist artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json artifacts/api-server/package.json
COPY --from=builder /app/package.json package.json

ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
