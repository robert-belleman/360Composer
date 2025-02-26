# 360 Composer

360-Composer is a software package containing all the components needed to deploy a 360 video story line editing suite.

## Installation and usage

When installing you can choose from three different default configurations:

- Development (docker-compose.yaml)
- Production (docker-compose.prod.yaml)
- Production installation from an image (docker-compose.image.yaml)

### Customizing deployment

Before any deployment, you should create an `.env` file with the required settings:

```
DATABASE_PASSWORD=j4jOVqaIp60cnZfUeWNpvsukSJT2JZ
JWT_SECRET_KEY=d0V83DrVapK9pK8j85nPqtSUCE3HJq
```

For a development or production (non-image) configuration, you can alter the location where the database and asset files are stored:

```
PATH_DB=./data/db
PATH_ASSETS=./data/assets
```

If using the default location, make sure it exists: `mkdir -p ./data/{assets,db}`

By default, none of the configurations are SSL-terminated so that you can provide your own. If you instead want SSL termination to occur in the nginx container, you need to provide a custom nginx configuration as well as your SSL certificate and private key:

```
NGINX_CONF=./conf/nginx-{dev,prod}-ssl.conf
SSL_CERT=<path to your SSL certificate>
SSL_PRIVKEY=<path to your SSL private key>
```

### Development

First, run npm install once (do this again when package.json is changed):
```sh
docker compose run frontend install
```

Then, start the entire stack:
```sh
docker compose up --build
```

The web interface will be available at http://localhost:8080.

### Production

Simply start the entire stack:
```sh
docker compose up --build
```

### Production from an image

For simplicity, ready-to-go Docker images are available so that the entire stack can be installed through a single Docker-compose file.

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
