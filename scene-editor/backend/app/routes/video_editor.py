"""
Filename: video_editor.py
Description: This file describes how the API should handle requests and
             responses concerning the video editor.
"""

from http import HTTPStatus

from app.models.project import Project as ProjectModel
from app.routes.api import api
from app.util.auth import user_jwt_required
from flask_jwt_extended import get_jwt
from flask_restx import Resource

ns = api.namespace("video-editor")


@ns.route("/<string:id>/trim")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("id", "The project identifier")
class TrimAsset(Resource):
    """Trim the start or end of a video asset."""

    @user_jwt_required
    def get(self, id: str):
        """Get all video assets of the user in this project. """
        claims = get_jwt()
        return ProjectModel.query.filter_by(
            id=id,
            user_id=claims['id']
        ).first_or_404()

    @user_jwt_required
    def post(self, id: str):
        """Trim the asset with FFmpeg."""
        return HTTPStatus.NOT_IMPLEMENTED
