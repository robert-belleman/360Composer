from flask import request, make_response, jsonify
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from http import HTTPStatus

from functools import wraps

from app.models.database import db

from app.routes.api import api

from flask_jwt_extended import get_jwt_claims
from app.util.auth import user_jwt_required, user_or_customer_jwt_required

from app.models.annotation import Annotation as AnnotationModel
from app.models.option import Option as OptionModel
from app.models.action import Action as ActionModel, ActionType
from app.models.scene import Scene as SceneModel
from app.models.project import Project as ProjectModel
from app.models.scenario import ScenarioScene as ScenarioSceneModel, ScenarioSceneLink as ScenarioSceneLinkModel

from app.schemas.annotation_option import annotation_option_schema, add_annotation_option_schema, update_annotation_option_schema, delete_annotation_option_schema

ns = api.namespace("annotation")

def project_access_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt_claims()
        annotation = AnnotationModel.query.filter_by(id=kwargs['id']).first_or_404()
        scene = SceneModel.query.filter_by(id=annotation.scene_id).first_or_404()
        project = ProjectModel.query.filter_by(id=scene.project_id, user_id=claims['id']).first()

        if project is None:
            return make_response(jsonify(msg='No access to project'), HTTPStatus.UNAUTHORIZED)
        else:
            return fn(*args, **kwargs)

    return wrapper


@ns.route("/<string:id>/options")
@ns.response(HTTPStatus.NOT_FOUND, "Annotation not found")
@ns.param("id", "The annotation identifier")
class AnnotationOptions(Resource):

    def action_type(self, action_type_str):
        if action_type_str.lower() == "next_scene" or action_type_str.lower() == "actiontype.next_scene":
            return ActionType.next_scene

        return None

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(annotation_option_schema)
    def get(self, id):
        return OptionModel.query.filter_by(annotation_id=id).all()

    @user_jwt_required
    @project_access_required
    @ns.expect(add_annotation_option_schema)
    @ns.marshal_with(annotation_option_schema)
    def post(self, id):
        scene_id = api.payload['scene_id']

        scene = SceneModel.query.filter_by(id=scene_id).first_or_404()
        annotation = AnnotationModel.query.filter_by(id=id, scene_id=scene.id).first_or_404()

        action_type = self.action_type(api.payload['action']['type'])

        if not action_type:
            return "Invalid Action Type", HTTPStatus.BAD_REQUEST

        feedback = api.payload["feedback"]  

        option = OptionModel(
            annotation_id=annotation.id,
            feedback=feedback if feedback != "" else None,
            text=api.payload["text"],
            action=ActionModel(scene_id=api.payload['scene_id'], type=action_type, payload=api.payload['action']['payload'], label=api.payload['text'])
        )

        db.session.add(option)
        db.session.commit()

        return option, HTTPStatus.OK

    @user_jwt_required
    @project_access_required
    @ns.expect(update_annotation_option_schema)
    @ns.marshal_with(annotation_option_schema)
    def put(self, id):
        annotation = AnnotationModel.query.filter_by(id=id).first_or_404()
        option = OptionModel.query.filter_by(annotation_id=id, id=api.payload['id']).first_or_404()

        action = None

        if api.payload["action"]:
            action = ActionModel.query.filter_by(id=option.action.id).first()
            action.type = self.action_type(api.payload["action"]["type"])
            action.payload = api.payload["action"]["payload"]
            action.label = api.payload["text"]

        option.text = api.payload["text"]
        option.feedback = api.payload["feedback"]

        db.session.commit()

        return option, HTTPStatus.OK

@ns.route("/<string:id>/option/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Annotation not found")
@ns.param("id", "The annotation identifier")
class AnnotationOptionDelete(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(delete_annotation_option_schema)
    def post(self, id):
      annotation = AnnotationModel.query.filter_by(id=id).first_or_404()
      option = OptionModel.query.filter_by(annotation_id=id, id=api.payload['id']).first_or_404()

      db.session.delete(option)
      db.session.commit()

      return HTTPStatus.OK