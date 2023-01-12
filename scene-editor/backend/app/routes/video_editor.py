import os

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

# from app.util.ffmpeg import create_thumbnail, get_duration
import app.util.ffmpeg as ffmpeg_util
import app.util.util as util

import hashlib
import binascii
import os
import uuid
import datetime

ns = api.namespace("video_editor")

trim_args = reqparse.RequestParser()
trim_args.add_argument("cmd", required=True, help="The trim command")
# trim_args.add_argument("name", type=str, required=True, help="Name for the asset")

@ns.route("/<string:id>")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class TrimAsset(Resource):

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def get(self, id):
        claims = get_jwt()

        return ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

    @user_or_customer_jwt_required
    # @ns.marshal_with(asset_schema)
    @ns.expect(trim_args)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(
            id=id, user_id=claims['id']).first_or_404()

        args = trim_args.parse_args()
        trim_start = args["trim_start"]
        trim_end = args["trim_end"]
        asset = args["asset"]
        # TODO find path of assets

        # Example command: {trim_start}/{trim_end}/{asset_id}




        print("this is the command send with the api TESTSTSTSTSTST: " + command)
        return project.assets

    


        # _, extension = os.path.splitext(file.filename)
        # asset_type = self.extension_to_type(extension)


# @ns.route("/<string:trimcmd>")
# @ns.response(HTTPStatus.NOT_FOUND, "Project not found")
# @ns.param("trimcmd", "The trim command for ffmpeg")
# class TrimAssets(Resource):

#     @user_jwt_required
#     @ns.marshal_with(asset_schema)
#     def get(self, id):
#         claims = get_jwt()
#         project = ProjectModel.query.filter_by(
#             id=id, user_id=claims['id']).first_or_404()

#         return project.assets

#     @user_jwt_required
#     @ns.marshal_with(scene_schema)
#     def get(self, id):
#         claims = get_jwt()
#         project = ProjectModel.query.filter_by(
#             id=id, user_id=claims['id']).first_or_404()

#         return project.scenes

#     @user_jwt_required
#     @ns.expect(scene_create_schema)
#     def post(self, id):
#         claims = get_jwt()
#         project = ProjectModel.query.filter_by(
#             id=id, user_id=claims['id']).first_or_404()

#         scene = SceneModel(name=api.payload["name"],
#                            project_id=project.id,
#                            user_id=api.payload["user_id"],
#                            description=api.payload["description"])

#         project.scenes.append(scene)

#         db.session.add(scene)
#         db.session.commit()

#         return "", HTTPStatus.CREATED

