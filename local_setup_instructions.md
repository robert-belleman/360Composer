This document contains instructions on how to set up the PCIT-VR framework to
run locally.

# Player
When downloading the PCIT-VR player from the git branch, make sure you get the
most recent version. In my case, the most recent version was located in the
10758305/new-architectrue-compatibility branch.

Normally, the player runs on localhost:3000. However, the scene editor frontend
also runs on localhost:3000. In order to solve this problem, you should add the
following piece of code to the nuxt.config.js file, located in the root
directory of the player:
```javascript
  server: {
    port: 3001
  },
```
You can also use another port than 3001 if you prefer.

After that, use these commands in the directory in which the player is located:

```bash
cp .env.sample .env
npm install
```

You may encounter problems when installing the dependencies. The errors will
probably look like this:
npm WARN X requires a peer of Y but none is installed. You must install
peer dependencies yourself. In this case, X is a package which you already have
installed, and Y is the dependency.

When you encounter this problem, you should use the command
```bash
npm install --save-dev Y
```
where Y is still the dependency. You should do this for all instances of this
warning, until there are no more errors. Also, some errors can easily be fixed
by using the command
```bash
npm audit fix
```
When you use the npm install command, it will tell you to use this command if
necessary.

Once all peer dependencies are installed and you get no more warnings or only
warnings about optional dependencies, you can build and launch the server using

```bash
npm run build
npm run start
```

or run in development using

```bash
npm run dev
```

# Scene-editor

## Frontend
In order to make the frontend run, like with the player, you should run
```bash
npm install
```
and get rid of all the warnings in the same way.
Then, use
```bash
npm run start
```

It can also be useful to replace line 148 (this may change in the future so you
can use ctrl+f to find a line that starts the same) of
frontend/src/components/TimelineEditorComponents/TimelineUserList.tsx
with the following:
```javascript
      <Typography variant="body1" component="p">{`localhost:3001/player/${timelineID}/${popoverState.id}`}</Typography>
```
If you used another port for the player, then replace the 3001 in this line
with the port you used.

## Backend

### Requirements
This project requires Docker 17.09.0 or newer, and docker-compose 1.17.0 or newer.

### Linux
On most Linux distributions, you should *not* use your distribution's
repositories and should follow the instructions ([Docker][docker-install],
[docker-compose][docker-compose-install]).

Note that you will need root rights for everything Docker. It is
[not recommended][docker-attack-surface] to add yourself to the `docker` group.

### MacOS
On macOS, it's easiest to install Docker using Homebrew Cask:
`brew cask install docker`. This will also install docker-compose.

### Windows
You can get Docker for Windows from the [Docker store][docker-windows].

### Configuration
The only configuration needed for the backend is a database password. To add this, simply create a ```.env``` file in the backend folder. Include the following variables in this environment file

```shell
DATABASE_PASSWORD=<your database password>
JWT_SECRET_KEY=<your secret key>
```

Add a strong, random password here for access to your database.

## Running
To run the backend, make sure you added the ```DATABASE_PASSWORD``` to you ```.env``` file. Now you can run ```docker-compose up --build``` to build and start the docker setup from scratch, or run ```docker-compose up``` if you already built it beforehand.


# Possible problems

## Cannot run player
An error can occur while running the application locally which prevents the
player from retrieving the timeline. This can be solved by replacing the line
```javascript
CORS(app)
```
with
```javascript
CORS(app, supports_credentials=True)
```
in scene-editor/backend/app/app.py and adding the line
```javascript
this.$axios.defaults.withCredentials = true;
```
Just before the line with
```javascript
this.logIn()
```
in pcit-vr-player/pages/_uuid/_user/index.vue

## Cannot access player through IP address
Another problem that may occur is that the player cannot be accessed locally
through the IP address. The solution to this is to add the following lines of
code to the file pcit-vr-player/nuxt.config.js:
```javascript
browserBaseUrl: process.env.API_URL_BROWSER !== undefined ? process.env.API_URL_BROWSER : 'http://x.x.x.x:5000'
```
instead of
```javascript
browserBaseUrl: process.env.API_URL_BROWSER !== undefined ? process.env.API_URL_BROWSER : 'http://localhost:5000'
```
Where the x's should be replaced by the numbers in the IP address of the network
that the machine running the server for the player is connected to and the 5000
represents the port for the backend api. If you changed this port, then the
port in this line should also be changed accordingly.

```javascript
  server: {
    host: '0',
    port: 3001
  }
```
instead of
```javascript
  server: {
    port: 3001
  },
```


# Windows setup:
Run these steps on top of the ones above to setup the application on windows:
- Install docker for windows on https://docs.docker.com/docker-for-windows/install/
- After installing docker on windows and restarting, it will ask you to complete
  another step by downloading WSL2. Follow the link that docker gives and
  follow the specified step. After this, you will be asked to restart again.
  Do this.
- install node.js on https://nodejs.org/en/download/
- install git from https://git-scm.com/download/win
- Open command prompt and go to the directory of the pcit-vr project.
  (you may need to go to OneDrive first and then navigate to the pcit-vr project)
- Delete package-lock.json in scene-editor/frontend
- run the following commands:
  ```bash
  npm install typescript --save-dev
  npm install http-proxy-middleware --save-dev
  npm install node-sass
  ```
  in scene-editor/frontend.
