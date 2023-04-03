# 360 Composer

The 360 compose is a software package containing all the components needed to deploy a 360 video story line editing suite.

## Requirements

Docker:
https://docs.docker.com/get-docker/

NodeJs:
https://nodejs.org/en/download/

## Installation and usage

When installing you can choose to run a production or development build.

### Production

Export the production compose file and build and start the docker:

```bash
export COMPOSE_FILE="docker-compose-prod.yml"
docker compose up --build
```

### Development

```bash
docker compose up --build
```

When working on the scene-editor it can be very cumbersome and time consuming to rebuild the frontend after every change.
I recommend the following to speed up development:

```bash
cd scene-editor/frontend
export NODE_OPTIONS=--openssl-legacy-provider
npm install
npm start
```

Note that these environment is not connected to the server. So all assets that are used by the application should be transferred
to the the public folder in the front end.
