import os
import subprocess

from flask import request
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from http import HTTPStatus

from app.util.auth import user_jwt_required, user_or_customer_jwt_required
from flask_jwt_extended import get_jwt

from app.routes.api import api
from app.models.database import db

from app.schemas.project import project_schema, project_create_schema
from app.schemas.asset import asset_schema
from app.schemas.scene import scene_schema, scene_create_schema
from app.schemas.scenario import scenario_overview_schema, scenario_create_schema
from app.schemas.timeline import timeline_schema, timeline_create_schema

from app.models.project import Project as ProjectModel
from app.models.asset import Asset as AssetModel, AssetType
from app.models.scene import Scene as SceneModel
from app.models.scenario import Scenario as ScenarioModel
from app.models.timeline import Timeline as TimelineModel, TimelineScenario as TimelineScenarioModel

from app.util.ffmpeg import create_thumbnail, get_duration
import app.util.util as util

import hashlib, binascii, os
import uuid
import datetime

ns = api.namespace("project")

@ns.route("/<string:id>/")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class Project(Resource):

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def get(self, id):
        claims = get_jwt()

        return ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def delete(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()
        db.session.delete(project)
        db.session.commit()
        return '', HTTPStatus.NO_CONTENT

asset_upload = reqparse.RequestParser()
asset_upload.add_argument("file", type=FileStorage, location="files", required=True, help="Asset file")
asset_upload.add_argument("name", type=str, required=True, help="Name for the asset")
@ns.route("/<string:id>/assets")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class ProjectAssets(Resource):

    def extension_to_type(self, extension):
        try:
            return {".mp4": AssetType.video, ".glb": AssetType.model}[extension]
        except KeyError:
            return None

    def generate_asset_meta(self, asset_type, filename, path):
        size = os.path.getsize(path)

        # only get duration and thumbnail if it is a video
        if asset_type == AssetType.video:
            thumbnail_path = os.path.join(os.environ.get('ASSET_DIR'), filename + '.png')
            if not create_thumbnail(path, thumbnail_path):
                thumbnail_path = None

            duration = get_duration(path)

            return {"duration": duration, "thumbnail_path": thumbnail_path, "file_size": size}

        return {"duration": None, "thumbnail_path": None, "file_size": size}

    @user_jwt_required
    @ns.marshal_with(asset_schema)
    def get(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        return project.assets

    @user_jwt_required
    @ns.marshal_with(asset_schema)
    @ns.expect(asset_upload)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        args = asset_upload.parse_args()
        file = args["file"]
        asset_name = args["name"]

        _, extension = os.path.splitext(file.filename)
        asset_type = self.extension_to_type(extension)

        if not asset_type:
            return "Invalid extension", HTTPStatus.BAD_REQUEST

        filename = util.random_file_name()
        asset_filename = filename + extension
        path = os.path.join(os.environ.get('ASSET_DIR'), asset_filename)
        util.write_file(request, path, file)

        # TODO Use worker to process async

        for height in ('1080', '720'):
            out_path = os.path.join(os.environ.get('ASSET_DIR'), f'{filename}-{height}.mp4')
            subprocess.check_call(['ffmpeg',
                                   '-i', path,
                                   '-vf', f'scale=-1:{height}',
                                   '-crf', '21',
                                   '-preset', 'veryfast', # don't care about file size for now
                                   '-f', 'mp4',
                                   out_path])

        meta = self.generate_asset_meta(asset_type, filename, path)

        # Only commit to database if files were uploaded and transcoded successfully
        row = AssetModel(name=asset_name, user_id=project.user_id, path=asset_filename, asset_type=asset_type, thumbnail_path=meta["thumbnail_path"], duration=meta["duration"], file_size=meta["file_size"], projects=[project])
        db.session.commit()

        return row, HTTPStatus.CREATED

@ns.route("/<string:id>/objects")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class ProjectObjects(Resource):
    """
    Returns all the 3D object assets in the project
    """
    @user_jwt_required
    @ns.marshal_with(asset_schema)
    def get(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        return project.assets.filter_by(asset_type=AssetType.model).all()

@ns.route("/<string:id>/videos")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class ProjectVideos(Resource):
    """
    Returns all the video assets in the project
    """
    @user_jwt_required
    @ns.marshal_with(asset_schema)
    def get(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        return project.assets.filter_by(asset_type=AssetType.video).all()

@ns.route("/<string:id>/scenes")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class ProjectScenes(Resource):

    @user_jwt_required
    @ns.marshal_with(scene_schema)
    def get(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        return project.scenes

    @user_jwt_required
    @ns.expect(scene_create_schema)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        scene = SceneModel(name=api.payload["name"],
                           project_id=project.id,
                           user_id=api.payload["user_id"],
                           description=api.payload["description"])

        project.scenes.append(scene)

        db.session.add(scene)
        db.session.commit()

        return "", HTTPStatus.CREATED

@ns.route("/<string:id>/scenarios")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class ProjectScenarios(Resource):

    @ns.marshal_with(scenario_overview_schema)
    @user_jwt_required
    def get(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        return ScenarioModel.query.filter_by(project_id=id).all()

    @user_jwt_required
    @ns.expect(scenario_create_schema)
    @ns.marshal_with(scenario_overview_schema)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        scenario = ScenarioModel(name=api.payload['name'],
                                 project_id=project.id,
                                 description=api.payload['description'])
        project.scenarios.append(scenario)

        db.session.add(scenario)
        db.session.commit()

        return scenario, HTTPStatus.OK

@ns.route("/<string:id>/timelines")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class ProjectTimelines(Resource):

    @user_jwt_required
    @ns.marshal_with(timeline_schema)
    def get(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        return project.timelines

    @user_jwt_required
    @ns.expect(timeline_create_schema)
    @ns.marshal_with(timeline_schema)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        timeline = TimelineModel(name=api.payload['name'],
                                 description=api.payload['description'],
                                 randomized=api.payload['randomized'],
                                 start=None,
                                 project_id=project.id
                    )

        project.timelines.append(timeline)

        db.session.add(timeline)
        db.session.commit()

        return timeline, HTTPStatus.OK


@ns.route("/create")
class ProjectCreate(Resource):

    @user_jwt_required
    @ns.expect(project_create_schema)
    @ns.marshal_with(project_schema)
    def post(self):
        project = ProjectModel(user_id=api.payload["id"], name=api.payload["name"])

        db.session.add(project)
        db.session.commit()

        return project
