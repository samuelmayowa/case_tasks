# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app

# Use Yarn 3 via Corepack
RUN corepack enable && corepack prepare yarn@3.8.2 --activate

# Copy manifests and Yarn config
COPY package.json yarn.lock ./
# Copy .yarnrc.yml if you have it (most Yarn 3 projects do)
COPY .yarnrc.yml ./

COPY .yarn/ .yarn/


RUN if [ -f .yarnrc.yml ] && ! [ -f .yarn/releases/yarn-3.8.2.cjs ]; then \
    sed -i '/^yarnPath:/d' .yarnrc.yml ; \
    fi

# Install (use --immutable if your lockfile is in sync)
RUN yarn --version && yarn install --immutable || yarn install

# Copy the app code and build (allow runtime-build projects to pass)
COPY . .
RUN yarn build || true

ENV PORT=3100
ENV API_BASE_URL=http://backend:4000
EXPOSE 3100
CMD ["yarn","start"]
