#!/bin/bash
set -ex
# TODO push images to github container registry
docker buildx build -t '360composer-backend' -f scene-editor/backend/ops/Dockerfile scene-editor/backend --load
docker buildx build -t '360composer-frontend' -f scene-editor/frontend/ops/Dockerfile scene-editor/frontend --load
