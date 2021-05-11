import os
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from http import HTTPStatus
from flask import send_file, send_from_directory, make_response, jsonify

from app.models.database import db

from functools import wraps

from flask_jwt_extended import get_jwt_claims
from app.util.auth import user_jwt_required, user_or_customer_jwt_required

from app.routes.api import api

from app.schemas.asset import asset_schema
from app.schemas.scene import scene_schema

from app.models.asset import Asset as AssetModel
from app.models.project import Project as ProjectModel
 
ns = api.namespace("asset")


def project_access_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt_claims()
        asset = AssetModel.query.filter_by(id=kwargs['id'].split('.')[0]).first_or_404()
        project = ProjectModel.query.filter_by(id=asset.project_id, user_id=claims['id']).first()

        if project is None:
            return make_response(jsonify(msg='No access to project'), HTTPStatus.UNAUTHORIZED)
        else:
            return fn(*args, **kwargs)

    return wrapper



@ns.route("/<string:id>")
@ns.response(HTTPStatus.NOT_FOUND, "Asset not found")
@ns.param("id", "The asset identifier")
class Asset(Resource):

    @user_or_customer_jwt_required
    @ns.marshal_with(asset_schema)
    def get(self, id):
        """
        Fetches the asset location from database and returns it as a file 
        """
        asset = AssetModel.query.filter_by(id=id.split('.')[0]).first_or_404()

        return asset

@ns.route("/<string:id>/thumbnail")
@ns.response(HTTPStatus.NOT_FOUND, "Thumbnail not found")
@ns.param("id", "The asset identifier")
class Thumbnail(Resource):

    @user_jwt_required
    @project_access_required
    def get(self, id):
        """
        Fetches the asset's thumbnail location from database and returns it as a file
        """
        asset = AssetModel.query.filter_by(id=id.split('.')[0]).first_or_404()

        return send_file(asset.thumbnail_path, as_attachment=True)


@ns.route("/<string:id>/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Thumbnail not found")
@ns.param("id", "The asset identifier")
class Thumbnail(Resource):

    @user_jwt_required
    @project_access_required
    def post(self, id):
        """
        Deletes the assets with the given ids
        """
        asset = AssetModel.query.filter_by(id=id.split('.')[0]).first_or_404()

        db.session.delete(asset)
        db.session.commit()

        return "", HTTPStatus.OK
