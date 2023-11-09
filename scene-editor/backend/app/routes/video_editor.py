"""
Filename: video_editor.py
Description: This file describes how the API should handle requests and
             responses concerning the video editor.
"""

from http import HTTPStatus

from app.models.project import Project as ProjectModel
from app.routes.api import api

# from app.schemas.asset import asset_schema
from app.schemas.project import project_schema

from app.util.auth import user_jwt_required
from flask_jwt_extended import get_jwt
from flask_restx import Resource

ns = api.namespace("video-editor")


# unused
@ns.route("/<string:id>/assets")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class VideoEditorAssets(Resource):
    """Get all assets in the current project."""

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def get(self, project_id: str):
        """Get all video assets of the user in this project."""
        claims = get_jwt()
        return ProjectModel.query.filter_by(
            id=project_id, user_id=claims["id"]
        ).first_or_404()


# asset_upload = reqparse.RequestParser()
# asset_upload.add_argument("file", type=FileStorage, location="files",
#   required=True, help="Asset file")
# asset_upload.add_argument("name", type=str, required=True,
#   help="Name for the asset")
# @ns.route("/<string:id>/trim")
# @ns.response(HTTPStatus.NOT_FOUND, "Project not found")
# @ns.param("id", "The project identifier")
# class Trimmer(Resource):
#     """Trim the start or end of video assets."""

#     @user_jwt_required
#     @ns.marshal_with(asset_schema)
#     @ns.expect(asset_upload)
#     def post(self, project_id: str):
#         """Trim the asset with FFmpeg."""
#         return HTTPStatus.NOT_IMPLEMENTED
