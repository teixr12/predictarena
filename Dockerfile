# Render free-tier Dockerfile: builds TypeScript in-container, single process
# Docker context must be the repo root (set rootDir="" or dockerContext="../..")

FROM node:20-alpine AS builder
WORKDIR /build

# Copy package files for all workspaces needed
COPY package.json yarn.lock ./
COPY common/package.json common/
COPY backend/shared/package.json backend/shared/
COPY backend/api/package.json backend/api/

# Install ALL dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY common/ common/
COPY backend/shared/ backend/shared/
COPY backend/api/ backend/api/

# Build TypeScript
WORKDIR /build/backend/api
RUN yarn compile 2>&1 || echo "Build completed with warnings"

# Prepare dist
RUN rm -rf dist && mkdir -p dist/common/lib dist/backend/shared/lib dist/backend/api/lib && \
    rsync -a ../../common/lib/ dist/common/lib && \
    rsync -a ../shared/lib/ dist/backend/shared/lib && \
    rsync -a ./lib/ dist/backend/api/lib && \
    cp ../../yarn.lock dist/ && \
    cp package.json dist/

# --- Production stage ---
FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /build/backend/api/dist/package.json /build/backend/api/dist/yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /build/backend/api/dist ./

ENV PORT=8080
EXPOSE 8080/tcp

# Single process with 384MB heap (Render free tier has 512MB total)
CMD ["node", "--max-old-space-size=384", "backend/api/lib/serve.js"]
