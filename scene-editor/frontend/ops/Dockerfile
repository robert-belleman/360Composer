FROM node:18 as build

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
WORKDIR /app/scene-editor-frontend
RUN npm ci && npm cache clean --force

COPY src /app/src
COPY public /app/public
COPY tsconfig.json /app

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run build

FROM nginx

COPY --from=build /app/build /var/www/html
