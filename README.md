# 360 Composer

360-Composer is a software package containing all the components needed to deploy a 360 video story line editing suite.

## Changes in this branch (f.k.a. robin-variable-quality)

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

Create the assets directory: `mkdir ./assets`

Then, start the entire stack:
```sh
docker compose up --build
```

The web interface will be available at http://localhost:8080.

### Production

Save the `docker-compose.prod.yaml` file to an empty directory:
```
curl -o docker-compose.yaml https://raw.githubusercontent.com/robert-belleman/360Composer/main/docker-compose.prod.yaml
```

Create a `.env` file with the required settings (this is an example, you should generate your own passwords!):
```
DATABASE_PASSWORD=j4jOVqaIp60cnZfUeWNpvsukSJT2JZ
JWT_SECRET_KEY=d0V83DrVapK9pK8j85nPqtSUCE3HJq
```

Start the stack:

```sh
docker compose up
```

Tips:
- The web interface is available at http://localhost:8080
- Exit using Ctrl+C
- Start in background using `docker compose up -d`. Containers will automatically start after a system reboot with the `restart: unless-stopped` restart policy.
- Stop and remove containers using `docker compose down`
- Members of the visualisation lab can push updated docker images to GitHub Container Registry using the ./docker-push.sh script
