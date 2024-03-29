#!/usr/bin/env bash
set -e
cd frontend 
yarn install
yarn build
cd ../backend
export COMPOSE_FILE="docker-compose.prod.yml"
docker-compose up --build -d
