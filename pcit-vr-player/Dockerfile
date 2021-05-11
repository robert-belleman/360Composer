FROM node:14.4.0-alpine

ENV HOST 0.0.0.0

WORKDIR /player

COPY . /player

RUN npm install
RUN npm run build

EXPOSE 3001

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3001

ENTRYPOINT [ "npm", "start" ]
