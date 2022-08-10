# player

> VR player for PCIT-VR projects

## Build Setup

```bash
# copy env file
cp .env.sample .env

# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

## Running in production

Running the PCIT-VR project in production requires running the Nuxt.js server in the background. This can be achieved using pm2:

```shell script
npm install -g pm2
export API_URL=https://pctivr.nl/
pm2 --name pcitvr start npm -- start
```

The PCIT-VR project now runs in the background at port 3000

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Deploying

`docker-compose` is used for deploying the application in production.

To deploy the application:

```
docker-compose up --build -d
```