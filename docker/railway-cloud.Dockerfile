FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.server.json ./
COPY server ./server
RUN npm run server:build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PAPERLANE_STORAGE_ROOT=/data/paperlane-cloud
ENV PAPERLANE_GHOSTSCRIPT_BINARY=gs
RUN apt-get update \
  && apt-get install -y --no-install-recommends ghostscript ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist-server ./dist-server
COPY server/railway ./server/railway
RUN mkdir -p /data/paperlane-cloud /app/tmp
EXPOSE 8787
CMD ["node", "server/railway/start-cloud-service.mjs"]
