#!/bin/bash
set -ex

# Script to push production images to the GitHub container registry.
# To be used by members of the Visualisation Lab.

docker buildx build -t 'ghcr.io/visualisationlab/360composer-backend'  -f scene-editor/backend/ops/Dockerfile  --push scene-editor/backend
docker buildx build -t 'ghcr.io/visualisationlab/360composer-frontend' -f scene-editor/frontend/ops/Dockerfile --push scene-editor/frontend
