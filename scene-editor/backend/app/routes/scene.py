from flask import request, make_response, jsonify
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from http import HTTPStatus

from functools import wraps

from flask_jwt_extended import get_jwt

from app.util.auth import user_jwt_required, user_jwt_required

from app.routes.api import api

from app.models.database import db

from app.schemas.scene_object import scene_object_schema, scene_object_create_schema, scene_object_update_schema
from app.schemas.scene import scene_schema, scene_update_schema
from app.schemas.scene_media import scene_add_media_schema, scene_media_schema
from app.schemas.scene_annotation import get_scene_annotation_schema, add_scene_annotation_schema, scene_annotation_schema
from app.schemas.action import action_schema

from app.models.action import Action as ActionModel
from app.models.scene import Scene as SceneModel
from app.models.asset import Asset as AssetModel, AssetType
from app.models.scene_object import SceneObject as SceneObjectModel
from app.models.annotation import Annotation as AnnotationModel
from app.models.project import Project as ProjectModel

import hashlib, binascii, os
import uuid
import datetime

def project_access_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        scene = SceneModel.query.filter_by(id=kwargs['id']).first_or_404()
        project = ProjectModel.query.filter_by(id=scene.project_id, user_id=claims['id']).first()

        if project is None:
            return make_response(jsonify(msg='No access to project'), HTTPStatus.UNAUTHORIZED)
        else:
            return fn(*args, **kwargs)

    return wrapper


ns = api.namespace("scenes")

@ns.route("/<string:id>/")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class Scene(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_schema)
    def get(self, id):
        return SceneModel.query.filter_by(id=id).first_or_404()

@ns.route("/<string:id>/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneDelete(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_schema)
    def post(self, id):
        scene = SceneModel.query.filter_by(id=id).first_or_404()

        db.session.delete(scene)
        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/meta")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "the scene identifier")
class SceneMeta(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(scene_update_schema)
    @ns.marshal_with(scene_schema)
    def post(self, id):
        scene = SceneModel.query.filter_by(id=id).first_or_404()

        scene.name = api.payload['name']
        scene.description = api.payload['description']

        db.session.commit()

        return scene, HTTPStatus.OK


@ns.route("/<string:id>/media")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneMedia(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_media_schema)
    def get(self, id):
        return SceneModel.query.filter_by(id=id).first_or_404()

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_media_schema)
    @ns.expect(scene_add_media_schema)
    def put(self, id):
        scene = SceneModel.query.filter_by(id=id).first_or_404()

        if api.payload['video_id'] is None:
            scene.video_id = api.payload['video_id']
            db.session.commit()
            return "", HTTPStatus.OK

        video = AssetModel.query.filter_by(id=api.payload['video_id'], asset_type=AssetType.video).first_or_404()

        scene.video_id = video.id

        db.session.flush()

        annotations = AnnotationModel.query.filter_by(scene_id=scene.id).all()

        # if existing annotations have a timestamp that does not exist in the video, reset it
        for annotation in annotations:
            if annotation.timestamp > video.duration:
                annotation.timestamp = video.duration

        db.session.commit()

        return scene, HTTPStatus.OK

@ns.route("/<string:id>/annotations")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneAnnotations(Resource):
    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_annotation_schema)
    def get(self, id):
        return AnnotationModel.query.filter_by(scene_id=id).all()

@ns.route("/<string:id>/annotation")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneAnnotation(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_annotation_schema)
    def get(self, id):
        args = request.args

        if not args or not args["id"]:
            return "Annotation ID is required", HTTPStatus.BAD_REQUEST

        return AnnotationModel.query.filter_by(scene_id=id, id=args["id"]).first_or_404()

    @user_jwt_required
    @project_access_required
    @ns.expect(add_scene_annotation_schema)
    @ns.marshal_with(scene_annotation_schema)
    def post(self, id):
        scene = SceneModel.query.filter_by(id=id).first_or_404()

        annotation = AnnotationModel(
            scene_id=scene.id,
            text=api.payload["text"],
            timestamp=api.payload["timestamp"],
            type=api.payload["type"],
        )

        db.session.add(annotation)
        db.session.commit()

        return annotation, HTTPStatus.OK

    @user_jwt_required
    @project_access_required
    @ns.expect(scene_annotation_schema)
    @ns.marshal_with(scene_annotation_schema)
    def put(self, id):
        annotation = AnnotationModel.query.filter_by(scene_id=id, id=api.payload["id"]).first_or_404()

        annotation.text = api.payload["text"]
        annotation.timestamp = api.payload["timestamp"]
        annotation.type = api.payload["type"]

        db.session.commit()

        return annotation, HTTPStatus.OK


@ns.route("/<string:id>/annotation/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneAnnotationDelete(Resource):
    @user_jwt_required
    @project_access_required
    @ns.expect(get_scene_annotation_schema)
    def post(self, id):
        scene = SceneModel.query.filter_by(id=id).first_or_404()
        annotation = AnnotationModel.query.filter_by(scene_id=id, id=api.payload["id"]).first_or_404()

        db.session.delete(annotation)
        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/actions")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneActions(Resource):
    @user_jwt_required
    @project_access_required
    @ns.marshal_with(action_schema)
    def get(self, id):
        scene = SceneModel.query.filter_by(id=id).first_or_404()

        return ActionModel.query.filter_by(scene_id=scene.id).all()

@ns.route("/<string:id>/objects")
@ns.response(HTTPStatus.NOT_FOUND, "Scene not found")
@ns.param("id", "The scene identifier")
class SceneObjects(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scene_object_schema)
    def get(self, id):
        return SceneObjectModel.query.filter_by(scene_id=id).all()

    @user_jwt_required
    @project_access_required
    @ns.expect(scene_object_create_schema, validate=True)
    def post(self, id):
        # check if scene actually exists
        scene = SceneModel.query.filter_by(id=id).first_or_404()
        scene_object = SceneObjectModel(
            scene_id=scene.id,
            asset_id=ns.payload["asset_id"],
            x_pos=ns.payload["x_pos"],
            y_pos=ns.payload["y_pos"],
            z_pos=ns.payload["z_pos"],
            x_scale=ns.payload["x_scale"],
            y_scale=ns.payload["y_scale"],
            z_scale=ns.payload["z_scale"],
            x_rotation=ns.payload["x_rotation"],
            y_rotation=ns.payload["y_rotation"],
            z_rotation=ns.payload["z_rotation"],
            w_rotation=ns.payload["w_rotation"]
        )

        db.session.add(scene_object)
        db.session.commit()

        return "", HTTPStatus.CREATED

    @user_jwt_required
    @project_access_required
    @ns.expect(scene_object_update_schema, validate=True)
    def put(self, id):
        # check if scene actually exists
        scene_object = SceneObjectModel.query.filter_by(id=ns.payload["id"], scene_id=id).first_or_404()

        scene_object.x_pos = ns.payload["x_pos"]
        scene_object.y_pos = ns.payload["y_pos"]
        scene_object.z_pos = ns.payload["z_pos"]

        scene_object.x_scale = ns.payload["x_scale"]
        scene_object.y_scale = ns.payload["y_scale"]
        scene_object.z_scale = ns.payload["z_scale"]

        scene_object.x_rotation = ns.payload["x_rotation"]
        scene_object.y_rotation = ns.payload["y_rotation"]
        scene_object.z_rotation = ns.payload["z_rotation"]
        scene_object.w_rotation = ns.payload["w_rotation"]

        db.session.add(scene_object)
        db.session.commit()

        return "", HTTPStatus.NO_CONTENT
