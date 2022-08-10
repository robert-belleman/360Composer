# 360 Composer

The 360 composer is a software package containing all the components needed to deploy a 360 video story line editing suite. Currently the the 360 composer is structured as follows:

- player: Containing the web-based 360 VR player that is used to play the 360 VR story content created with the scene-editor.
- scene-editor: Containing the back-end Flask app and front-end React app for the creation of the 360 VR story content.

Please refer to the [current structure description of the 360 composer](#software-structure)

## Installation

The 360 composer can be deployed on any system matching the deployment requirments. This repository includes development and production build docker-compose files. For development you can follow the [local development instructions](#local-development).

### Deployment

Requirements:

- Docker ^v20.10
- Docker-compose ^v1.29





### Local development

The 360 composer has several front-end and back-end components that need to be configured, build and installed to have a development setup.

*Work in progress*

## Software structure

As described before the 360 composer is structured in 2 components, the [player](#player) and the [scene editor](#scene-editor). This is will likely change in the future because these components were made separately and combined later. Because of this reason the used front-end frameworks also differ. Further description on the used frameworks to realize both components can be found in their dedicated sections.

### Player

*Work in progress*

### Scene Editor

*Work in progress*