Server setup settings:

Setting up the scene editor on a server may cause some problems. For me, the
wrong docker-compose file was picked when running run_production.sh even though
the following line was present in that file:
```bash
export COMPOSE_FILE="docker-compose.prod.yml"
```
This can be solved by deleting or renaming the file named "docker-compose.yml"
and renaming "docker-compose.prod.yml" to "docker-compose.yml"

If you encounter a problem when executing
```bash
docker-compose up --build -d
```
in the backend folder or while running run_production.sh where it says:
"error: can't find Rust compiler" while building the wheel for cryptography,
add the following line to scene-editor/backend/ops/Dockerfile.prod.nginx:
ENV CRYPTOGRAPHY_DONT_BUILD_RUST=1
after the line
FROM nginx:alpine
