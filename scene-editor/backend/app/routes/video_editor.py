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


import app.util.ffmpeg as ffmpeg_util
import app.util.util as util

import hashlib
import binascii
import uuid
import datetime

ns = api.namespace("video_editor")

trim_args = reqparse.RequestParser()
trim_args.add_argument("trim_start", required=True, help="The trim start time.")
trim_args.add_argument("trim_end", required=True, help="The trim end time.")
trim_args.add_argument("input_path", type=str,
                       required=True, help="The input file path.")
trim_args.add_argument("output_name", type=str,
                       required=True, help="The output file name.")
# trim_args.add_argument("name", type=str, required=True, help="Name for the asset")


@ns.route("/<string:id>/trim")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class TrimAsset(Resource):

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def get(self, id):
        claims = get_jwt()

        return ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

    @user_jwt_required
    @ns.marshal_with(asset_schema)
    @ns.expect(trim_args)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(
            id=id, user_id=claims['id']).first_or_404()


        args = trim_args.parse_args()

        start = args["trim_start"]
        end = args["trim_end"]
        input_path = args["input_path"]
        output_name = args["output_name"]

        filename = util.random_file_name()
        asset_filename = filename + ".mp4"
        output_path = os.path.join(os.environ.get('ASSET_DIR'), asset_filename)
        input_path = os.path.join(os.environ.get('ASSET_DIR'), input_path)

        print(f"Trimming {input_path} to {output_path} from {start} to {end}")

        if ffmpeg_util.ffmpeg_trim_video(str(start), str(end), input_path, output_path):

            asset_type = AssetType.video

            meta = util.generate_asset_meta(asset_type, filename, output_path)

            row = AssetModel(
                name=output_name,
                user_id=project.user_id, 
                path=asset_filename, 
                asset_type=asset_type, 
                thumbnail_path=meta["thumbnail_path"], 
                duration=meta["duration"], 
                file_size=meta["file_size"], 
                fps=meta["fps"],
                frames=meta["frames"],
                projects=[project])

            db.session.add(row)  
            db.session.commit()

            return row, HTTPStatus.CREATED

        return HTTPStatus.BAD_REQUEST


@ns.route("/<string:id>/export", methods=['POST'])
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class Export(Resource):

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def export(self, id):
        claims = get_jwt()
        
        
        return







join_args = reqparse.RequestParser()
join_args.add_argument("assets", required=True, help="The assets to join.")
trim_args.add_argument("output_name", type=str,
                       required=True, help="The output file name.")

@ns.route("/<string:id>/join")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class JoinAsset(Resource):

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def get(self, id):
        claims = get_jwt()

        return ProjectModel.query.filter_by(id=id, user_id=claims['id']).first_or_404()

    @user_jwt_required
    @ns.marshal_with(asset_schema)
    @ns.expect(join_args)
    def post(self, id):
        claims = get_jwt()
        project = ProjectModel.query.filter_by(
            id=id, user_id=claims['id']).first_or_404()


        args = join_args.parse_args()

        clips = args["clips"] # list of asset ids
        output_name = args["output_name"]

        filename = util.random_file_name()
        asset_filename = filename + ".mp4"
        output_path = os.path.join(os.environ.get('ASSET_DIR'), asset_filename)

        for clipid in clips:
            clip = AssetModel.query.filter_by(id=clipid, user_id=claims['id']).first_or_404()
            input_path = os.path.join(os.environ.get('ASSET_DIR'), clip.path)

            if ffmpeg_util.ffmpeg_join_videos(input_path, output_path):

                asset_type = AssetType.video

                meta = util.generate_asset_meta(asset_type, filename, output_path)

                row = AssetModel(
                    name=output_name,
                    user_id=project.user_id, 
                    path=asset_filename, 
                    asset_type=asset_type, 
                    thumbnail_path=meta["thumbnail_path"], 
                    duration=meta["duration"], 
                    file_size=meta["file_size"], 
                    fps=meta["fps"],
                    frames=meta["frames"],
                    projects=[project])

                db.session.add(row)  
                db.session.commit()

                return row, HTTPStatus.CREATED

            return HTTPStatus.BAD_REQUEST



        input_path = os.path.join(os.environ.get('ASSET_DIR'), input_path)

        print(f"Trimming {input_path} to {output_path} from {start} to {end}")

        if ffmpeg_util.ffmpeg_trim_video(str(start), str(end), input_path, output_path):

            asset_type = AssetType.video

            meta = util.generate_asset_meta(asset_type, filename, output_path)

            row = AssetModel(
                name=output_name,
                user_id=project.user_id, 
                path=asset_filename, 
                asset_type=asset_type, 
                thumbnail_path=meta["thumbnail_path"], 
                duration=meta["duration"], 
                file_size=meta["file_size"], 
                fps=meta["fps"],
                frames=meta["frames"],
                projects=[project])

            db.session.add(row)  
            db.session.commit()

            return row, HTTPStatus.CREATED

        return HTTPStatus.BAD_REQUEST
