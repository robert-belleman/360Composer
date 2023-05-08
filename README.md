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

(Re-)install dependencies:
```
docker compose run frontend install
```
