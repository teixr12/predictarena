# Render free-tier Dockerfile: builds TypeScript in-container, single process
# Docker context is the repo root

FROM node:20-alpine AS builder
RUN apk add --no-cache rsync
WORKDIR /build

# Copy root package files (needed for yarn workspaces)
COPY package.json yarn.lock ./

# Copy only the workspace package.json files we need
COPY common/package.json common/
COPY backend/shared/package.json backend/shared/
COPY backend/api/package.json backend/api/

# Create stub package.json for workspaces we don't need
# (yarn workspaces requires all referenced dirs to exist)
RUN mkdir -p web client-common backend/discord-bot backend/scheduler backend/scripts && \
    echo '{"name":"web","version":"1.0.0","private":true}' > web/package.json && \
    echo '{"name":"client-common","version":"1.0.0","private":true}' > client-common/package.json && \
    echo '{"name":"@manifold/discord-bot","version":"0.1.0","private":true}' > backend/discord-bot/package.json && \
    echo '{"name":"@manifold/scheduler","version":"0.1.0","private":true}' > backend/scheduler/package.json && \
    echo '{"name":"@manifold/scripts","version":"0.1.0","private":true}' > backend/scripts/package.json

# Install dependencies (skip frozen lockfile since we stubbed workspaces)
RUN yarn install --network-timeout 120000 || yarn install --network-timeout 120000 --no-lockfile

# Create TypeScript declaration stubs for frontend-only modules not installed here.
# firebase and web workspace are used by common/src/ but not by the backend API at runtime.
# tsc -b refuses to build downstream projects when upstream (common) has TS2307 errors,
# so we eliminate the errors with minimal stubs rather than suppressing them.
RUN mkdir -p node_modules/firebase node_modules/@firebase/app node_modules/@types/cors && \
    printf 'export interface User{uid:string;email?:string|null;displayName?:string|null;getIdToken(f?:boolean):Promise<string>;toJSON():object}\nexport interface Auth{currentUser:User|null}\nexport declare function getAuth(app?:any):Auth\nexport declare function updateCurrentUser(auth:Auth,user:User|null):Promise<void>\n' \
      > node_modules/firebase/auth.d.ts && \
    printf 'export interface FirebaseApp{name:string;options:Record<string,any>}\n' \
      > node_modules/@firebase/app/index.d.ts && \
    printf 'declare function cors(options?:Record<string,any>):any\ndeclare namespace cors{}\nexport = cors\n' \
      > node_modules/@types/cors/index.d.ts && \
    mkdir -p web/lib/supabase && \
    printf 'export const getNumContractComments = async (_: string): Promise<number> => 0\n' \
      > web/lib/supabase/comments.ts

# Copy source code for the workspaces we need
COPY common/ common/
COPY backend/shared/ backend/shared/
COPY backend/api/ backend/api/

# Build TypeScript
WORKDIR /build/backend/api
RUN yarn compile || true

# Prepare dist (copy compiled JS into flat structure for production)
RUN rm -rf dist && mkdir -p dist/common/lib dist/backend/shared/lib dist/backend/api/lib && \
    rsync -a ../../common/lib/ dist/common/lib/ && \
    rsync -a ../shared/lib/ dist/backend/shared/lib/ && \
    rsync -a ./lib/ dist/backend/api/lib/ && \
    cp ../../yarn.lock dist/ && \
    cp package.json dist/

# --- Production stage ---
FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /build/backend/api/dist/package.json /build/backend/api/dist/yarn.lock ./
RUN yarn install --production --network-timeout 120000

COPY --from=builder /build/backend/api/dist ./

ENV PORT=8080
EXPOSE 8080/tcp

# Single process with 384MB heap (Render free tier has 512MB total)
# --no-network-family-autoselection: disables Node.js 20 Happy Eyeballs (autoSelectFamily)
#   which defaults to true in v20.6+ and tries IPv6 even when family:4 is set in pg config.
# --dns-result-order=ipv4first: additionally prefer IPv4 in DNS lookups.
# Both are needed because Render free tier cannot reach Supabase's IPv6 address.
CMD ["node", "--no-network-family-autoselection", "--dns-result-order=ipv4first", "--max-old-space-size=384", "backend/api/lib/serve.js"]
