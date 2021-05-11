# PCIT-VR Editor Suite Backend

## Requirements
This project requires Docker 17.09.0 or newer, and docker-compose 1.17.0 or newer.

### Linux
On most Linux distributions, you should *not* use your distribution's
repositories and should follow the instructions ([Docker][docker-install],
[docker-compose][docker-compose-install]).

Note that you will need root rights for everything Docker. It is
[not recommended][docker-attack-surface] to add yourself to the `docker` group.

### macOS
On macOS, it's easiest to install Docker using Homebrew Cask:
`brew cask install docker`. This will also install docker-compose.

### Windows
You can get Docker for Windows from the [Docker store][docker-windows].

## Configuration
The only configuration needed for the backend is a database password. To add this, simply create a ```.env``` file in the backend folder. Include the following variable in this environment file 

```shell
DATABASE_PASSWORD=<your database password>
```

Add a strong, random password here for access to your database.

## Running
To run the backend, make sure you added the ```DATABASE_PASSWORD``` to you ```.env``` file. Now you can run ```docker-compose up --build``` to build and start the docker setup from scratch, or run ```docker-compose up``` if you already built it beforehand. 

## Database Revisions
Whenever you need to change something in the database, a new migration is needed in order to preserve the database contents. In order to create a new revision, run the following commands

```bash
cd ./migrations/
alembic revision -m "your revision message"
```

This will create a new revision file, in here you can add which tables to create and/or update with this revision.

To apply a database revision, simply run ```docker-compose up --build```, this will rebuild the docker container and apply the database migrations.

# API

When running the backend, an overview of the API endpoints can be found at [localhost:5000/api/](http://localhost:5000/api/). Here you can try out the API functionality with a Swagger interface.

