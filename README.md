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

First, run npm install once (do this again when package.json is changed):
```sh
docker compose run frontend install
```

Create the assets directory: `mkdir /assets`

Then, start the entire stack:
```sh
docker compose up --build
```

### Production

Images will be uploaded to the GitHub container registry, but for now need to be built locally using the `./docker-build.sh` script.

Export the production compose file and build and start the docker:

```sh
docker compose -f docker-compose.prod.yaml up
```
