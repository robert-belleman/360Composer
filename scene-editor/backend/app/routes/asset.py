"""
Filename: asset.py

Description:
This file describes how the API should handle requests concerning the
creation, modification or deletion of assets or asset data.

"""

from http import HTTPStatus
from pathlib import Path

from app.config import ASSET_DIR
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
from flask_restx import Resource

ns = api.namespace("asset")


@ns.route("/<string:id>")
@ns.response(HTTPStatus.NOT_FOUND, "Asset not found")
@ns.param("id", "The asset identifier")
class Asset(Resource):
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


@ns.route("/<string:id>/thumbnail")
@ns.response(HTTPStatus.NOT_FOUND, "Thumbnail not found")
@ns.param("id", "The asset identifier")
class Thumbnail(Resource):
    """
    Handles requests related to fetching asset thumbnails.
    """

    @user_jwt_required
    @project_access_required
    def get(self, id):
        """
        Fetches the asset's thumbnail location and returns it as a file
        """
        asset = AssetModel.query.filter_by(id=id.split(".")[0]).first_or_404()
        thumbnail_path = Path(ASSET_DIR, asset.thumbnail_path)

        return send_file(thumbnail_path, as_attachment=True)


@ns.route("/<string:id>/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Asset not found")
@ns.param("id", "The asset identifier")
class DeleteAsset(Resource):
    """
    Handles requests related to deleting assets.
    """

    @user_jwt_required
    @project_access_required
    def delete(self, id):
        """
        Deletes the assets with the given ids
        """
        asset: AssetModel
        asset = AssetModel.query.filter_by(id=id.split(".")[0]).first_or_404()

        # Delete the video file, thumbnail and hls playlist from the server.
        try:
            Path(ASSET_DIR, asset.path).unlink()
            Path(ASSET_DIR, asset.thumbnail_path).unlink()
            if asset.hls_path:
                Path(ASSET_DIR, asset.hls_path).unlink()
        except FileNotFoundError:
            pass

        db.session.delete(asset)
        db.session.commit()

        return "", HTTPStatus.OK


@ns.route("/<string:id>/setview/<string:viewtype>")
@ns.response(HTTPStatus.NOT_FOUND, "Asset not found")
@ns.param("id", "The asset identifier")
@ns.param("viewtype", "The asset video type")
class ChangeViewType(Resource):
    """
    Handles requests related to updating asset view types.
    """

    @user_jwt_required
    @project_access_required
    def post(self, id, viewtype):
        """
        Updates the asset view type
        """
        newviewtype = ViewType.mono
        if viewtype == "mono":
            newviewtype = ViewType.mono
        elif viewtype == "sidetoside":
            newviewtype = ViewType.sidetoside
        elif viewtype == "toptobottom":
            newviewtype = ViewType.toptobottom
        else:
            return "Unallowed View Type", HTTPStatus.FORBIDDEN

        asset = AssetModel.query.filter_by(id=id.split(".")[0]).first_or_404()
        asset.view_type = newviewtype
        db.session.commit()

        return "", HTTPStatus.OK


@ns.route("/<string:asset_id>/stream")
@ns.response(HTTPStatus.NOT_FOUND, "Asset not found")
@ns.param("asset_id", "The asset identifier")
class InitializeHLS(Resource):
    """
    Create a HLS playlist of the video in the asset and update its fields
    """

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(asset_schema)
    def put(self, asset_id: int):
        """
        Retrieve the asset with `asset_id`, create a HLS playlist and
        update the fields in the asset.
        """
        asset: AssetModel
        asset = AssetModel.query.filter_by(id=asset_id).first_or_404()

        # Determine path for hls playlist.
        base_name = asset.path.split(".")[0]
        raw_video_path = Path(ASSET_DIR, base_name + ".mp4")

        # Create a directory and store the HLS playlist there.
        hls_output_dir = Path(ASSET_DIR, base_name)
        hls_output_dir.mkdir()
        create_hls(raw_video_path, hls_output_dir)
        hls_playlist = base_name + "/main.m3u8"

        # Update the `hls_path` field of the asset and commit.
        asset.hls_path = hls_playlist
        db.session.commit()

        return asset, HTTPStatus.OK
