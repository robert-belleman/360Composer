# 360 Composer

360-Composer is a software package containing all the components needed to deploy a 360 video story line editing suite.

## Changes in robin-variable-quality branch

- Improved docker-compose development stack:
  - Updated base images
  - Development stack no longer uses production build of the frontend, but instead a development server with live reloading (much faster!)
  - Proxying is now done by nginx, instead of http-proxy-middleware.
- HLS transcoding in backend (video path now returns m3u8 playlist instead of mp4 file)
- Modified a-frame video player for HLS support
- (WIP) Modified annotation editor (babylon.js video player) for HLS support

## Installation and usage

When installing you can choose to run a production or development build.

### Development

```bash
docker compose up --build
```

(Re-)install dependencies:
```
docker compose run frontend install
```

### Production

Export the production compose file and build and start the docker:

```bash
export COMPOSE_FILE="docker-compose-prod.yml"
docker compose up --build
```
