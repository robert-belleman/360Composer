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

The web interface will be available at http://localhost:8080.

### Production

Save the `docker-compose.prod.yaml` file to an empty directory and create a `.env` file with the required settings (both randomly generated strings):
```
DATABASE_PASSWORD=
JWT_SECRET_KEY=
```

Create the `./assets` directory, then start the stack:

```sh
docker compose -f docker-compose.prod.yaml up
```

The web interface will be available at http://localhost:8080.
