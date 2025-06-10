"""
Filename: audio_asset.py

Description:
This file describes how the API should handle requests concerning the
creation, modification or deletion of assets or asset data.
"""
import os
from pathlib import Path

from flask import request
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from http import HTTPStatus

from sqlalchemy.dialects.postgresql import UUID, ENUM

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
from app.models.audioAsset import AudioAsset as AssetModel, AssetType
from app.models.scene import Scene as SceneModel
from app.models.scenario import Scenario as ScenarioModel
from app.models.timeline import Timeline as TimelineModel, TimelineScenario as TimelineScenarioModel

from app.util.ffmpeg import create_thumbnail, get_duration, get_resolution, create_hls
import app.util.util as util
# from app.config import ASSET_DIR

ASSET_DIR = "./data/audio_assets"

import hashlib, binascii, os
import uuid
import datetime

from http import HTTPStatus
from pathlib import Path

from app.models.asset import Asset as AssetModel
from app.models.asset import ViewType
from app.models.database import db
from app.routes.api import api
from app.schemas.asset import asset_schema
from app.util.auth import (
    user_jwt_required,
    user_or_customer_jwt_required,
    project_access_required,
)
from app.util.ffmpeg import create_hls
from flask import send_file
from flask_restx import Resource, reqparse

ns = api.namespace("audioAsset")

@ns.route("/<string:id>")
@ns.response(HTTPStatus.NOT_FOUND, "audioAsset not found")
@ns.param("id", "The audioasset identifier")
class AudioAsset(Resource):
    """
    Handles requests related to fetching asset locations from the database.
    """
    @user_or_customer_jwt_required
    @ns.marshal_with(asset_schema)
    def get(self, id):
        """
        Fetches the asset location from database and returns it as a file
        """
        asset = AssetModel.query.filter_by(id=id.split(".")[0]).first_or_404()
        return asset

asset_upload = reqparse.RequestParser()
asset_upload.add_argument("file", type=FileStorage, location="files", required=True, help="Asset file")
asset_upload.add_argument("name", type=str, required=True, help="Name for the asset")

# @ns.route("/upload", methods=["POST"])
@ns.route("/upload")
class StoreAudioAsset(Resource):
    def post(self):
        print("\n\n\nentered upload\n\n\n")
# def post():
    # pass
    # print("entered upload")
    # if request.method == "POST":
    #     print("entered post!!")

#         claims = get_jwt()
#         print(claims)

@ns.route("/create")
class CreateAudioAsset(Resource):
    """
    Handles requests related to fetching asset locations from the database.
    """
    @user_or_customer_jwt_required
    # @ns.marshal_with(asset_schema)
    # def upload(self, blob, formdata):
    #     print("entered upload func")
    #     print(blob)
    #     print(formdata)
    #     print(type(blob))
    #     pass

    def post(self):
        print("\n\nreceived a post request for audio recording\n\n")
        claims = get_jwt()
        # jwt from uploading asset
        # {'fresh': False,
        # 'iat': 1748196889,
        # 'jti': 'dbb309d7-b3a4-422a-b02e-948cd3f9f940',
        # 'type': 'access',
        # 'sub': {'id': 'e30369a8-4d2a-434d-98f5-219f5fef504e', 'role': 'user'},
        # 'nbf': 1748196889,
        # 'exp': 1748197789,
        # 'id': 'e30369a8-4d2a-434d-98f5-219f5fef504e',
        # 'role': 'user'}


        # args = asset_upload.parse_args()
        # id = UUID(args["scenarioId"])
        # scenario = ScenarioModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

        # file = args["file"]
        # asset_name = args["name"]
        # tag = int(args["tag"])

        # _, extension = os.path.splitext(file.filename)
        # asset_type = self.extension_to_type(extension)

        # if not asset_type:
        #     return "Invalid extension", HTTPStatus.BAD_REQUEST

        # if 'Content-Range' in request.headers:
        #     return "Chunked uploads not supported", HTTPStatus.BAD_REQUEST

        # base_name = util.random_file_name()
        # raw_video_path = Path(ASSET_DIR, base_name + extension)
        # with open(raw_video_path, 'wb') as dest_file:
        #     dest_file.write(file.stream.read())

        # meta = self.generate_asset_meta(asset_type, base_name, raw_video_path)

        # path = base_name + extension

        # # Only commit to database if files were uploaded and transcoded successfully
        # row = AssetModel(
        #     name=asset_name,
        #     path=path,
        #     asset_type=asset_type,
        #     width=meta["width"],
        #     height=meta["height"],
        #     tag=tag,
        #     duration=meta["duration"],
        #     file_size=meta["file_size"],
        #     # scenario=[scenario]
        # )
        # db.session.commit()

        # return row, HTTPStatus.CREATED

    def generate_asset_meta(self, asset_type: AssetType, base_filename: Path, input_path: Path):
        size = os.path.getsize(input_path)

        # only get duration and thumbnail if it is a video
        if asset_type == AssetType.video:

            duration = get_duration(input_path)
            width, height = get_resolution(input_path)

            return {
                "duration": duration,
                "width": width,
                "height": height,
                "file_size": size
            }

        return {"duration": None, "width": None, "height": None, "file_size": size}


# @ns.route("/<string:scenarioID>/audioAssets")
# @ns.response(HTTPStatus.NOT_FOUND, "Audio Asset not found")
# @ns.param("")



# @ns.route("/<string:id>/delete")
# @ns.response(HTTPStatus.NOT_FOUND, "Audio Asset not found")
# @ns.param("id", "The asset identifier")
# class DeleteAsset(Resource):
#     """
#     Handles requests related to deleting audio assets.
#     """
#     @user_jwt_required
#     @project_access_required
#     def post(self, id):
#         """
#         Deletes the audio assets with the given ids
#         """
#         asset: AssetModel
#         asset = AssetModel.query.filter_by(id=id.split(".")[0]).first_or_404()

#         db.session.delete(asset)
#         db.session.commit()

#         return "", HTTPStatus.OK


# asset_edit_meta = reqparse.RequestParser()
# asset_edit_meta.add_argument(
#     "name",
#     type=str,
#     help="Name of the audio asset",
#     required=False,
# )
# asset_edit_meta.add_argument(
#     "length",
#     type=int,
#     help="length of the audio asset",
#     required=False,
# )


# @ns.route("/<string:asset_id>/editmeta")
# @ns.response(HTTPStatus.NOT_FOUND, "Audio Asset not found")
# @ns.param("asset_id", "The asset identifier")
# class EditMetadata(Resource):
#     """
#     Handles requests related to updating audio asset information.
#     """
#     @user_jwt_required
#     @project_access_required
#     @ns.marshal_with(asset_schema)
#     def put(self, asset_id: int):
#         """
#         Updates the asset information
#         """
#         args = asset_edit_meta.parse_args()

#         asset: AssetModel
#         asset = AssetModel.query.filter_by(id=asset_id).first_or_404()

#         try:
#             view_type = getattr(ViewType, args["view_type"])
#         except AttributeError:
#             return "", HTTPStatus.INTERNAL_SERVER_ERROR

#         asset.name = args.get("name", asset.name)
#         asset.width = args.get("length", asset.length)

#         db.session.commit()

#         return asset, HTTPStatus.OK


# does audio even need this though?
# @ns.route("/<string:asset_id>/stream")
# @ns.response(HTTPStatus.NOT_FOUND, "Audio Asset not found")
# @ns.param("asset_id", "The asset identifier")
# class InitializeHLS(Resource):
#     """
#     Create a HLS playlist of the video in the audio asset and update its fields
#     """
#     @user_jwt_required
#     @project_access_required
#     @ns.marshal_with(asset_schema)
#     def put(self, asset_id: int):
#         """
#         Retrieve the asset with `asset_id`, create a HLS playlist and
#         update the fields in the asset.
#         """
#         try:
#             asset: AssetModel
#             asset = AssetModel.query.filter_by(id=asset_id).first_or_404()

#             # Determine path for hls playlist.
#             base_name = asset.path.split(".")[0]
#             raw_video_path = Path(ASSET_DIR, base_name + ".mp4")

#             # Create a directory and store the HLS playlist there.
#             hls_output_dir = Path(ASSET_DIR, base_name)
#             hls_output_dir.mkdir()
#             create_hls(raw_video_path, hls_output_dir)
#             hls_playlist = base_name + "/main.m3u8"

#             # Update the `hls_path` field of the asset and commit.
#             asset.hls_path = hls_playlist
#             db.session.commit()

#             return asset, HTTPStatus.OK

#         except Exception as e:
#             print(f"Error during HLS initialization: {e}")
#             return {"message": "Internal server error"}, HTTPStatus.INTERNAL_SERVER_ERROR
