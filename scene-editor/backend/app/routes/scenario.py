from flask import request, jsonify, make_response
from flask_restx import Resource, reqparse
from http import HTTPStatus

import json

from functools import wraps

from flask_jwt_extended import get_jwt
from app.util.auth import user_jwt_required, user_or_customer_jwt_required
from app.util.scenario import validate

from app.routes.api import api

from app.models.database import db

from app.schemas.scenario import scenario_schema, scenario_create_schema, scenario_overview_schema, scenario_update_schema, scenario_scenes_schema, scenario_scenes_add_schema, scenario_scenes_link_schema, scenario_scenes_delete_schema, scenario_scenes_update_schema, scenario_scene_connect_schema, scenario_scene_link_delete_schema

from app.models.timeline import Timeline as TimelineModel, TimelineScenario as TimelineScenarioModel
from app.models.scenario import Scenario as ScenarioModel, ScenarioScene as ScenarioSceneModel, ScenarioSceneLink as ScenarioSceneLinkModel
from app.models.annotation import Annotation as AnnotationModel
from app.models.option import Option as OptionModel
from app.models.scene import Scene as SceneModel
from app.models.action import Action as ActionModel
from app.models.project import Project as ProjectModel

from uuid import UUID

def uuid_convert(o):
    if isinstance(o, UUID):
        return str(o)

def update_scenes(scenes):
    for scene_u in scenes:
        scene = ScenarioSceneModel.query.filter_by(id=scene_u['id']).first_or_404()

        scene.position_x = scene_u['position_x']
        scene.position_y = scene_u['position_y']

        for link_u in scene_u['links']:
            link = ScenarioSceneLinkModel.query.filter_by(id=link_u['id']).first_or_404()
            link.target_id = link_u['target_id']

def project_access_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        scenario = ScenarioModel.query.filter_by(id=kwargs['id']).first_or_404()
        project = ProjectModel.query.filter_by(id=scenario.project_id, user_id=claims['id']).first()

        if project is None:
            return make_response(jsonify(msg='No access to project'), HTTPStatus.UNAUTHORIZED)
        else:
            return fn(*args, **kwargs)

    return wrapper

ns = api.namespace("scenario")

@ns.route("/<string:id>/")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class Scenario(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scenario_schema)
    def get(self, id):
        return ScenarioModel.query.filter_by(id=id).first_or_404()

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_update_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()
        scenario.start_scene = api.payload['start_scene']

        update_scenes(api.payload['scenes'])

        db.session.commit()

@ns.route("/<string:id>/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class ScenarioDelete(Resource):

    @user_jwt_required
    @project_access_required
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()
        timeline_scenarios = TimelineScenarioModel.query.filter_by(scenario_id=scenario.id).all()

        if len(timeline_scenarios) != 0:
            return "Scenario still in use", HTTPStatus.CONFLICT

        db.session.delete(scenario)
        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/scenes")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class ScenarioScenes(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(scenario_scenes_schema)
    def get(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()

        scenes = ScenarioSceneModel.query.filter_by(scenario_id=id).all()

        return scenes, HTTPStatus.OK

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_scenes_add_schema)
    @ns.marshal_with(scenario_scenes_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()
        actions = ActionModel.query.filter_by(scene_id=api.payload['scene_id']).all()

        scenario_scene = ScenarioSceneModel(
          scenario_id=id,
          scene_id=api.payload['scene_id'],
          position_x=api.payload['position_x'],
          position_y=api.payload['position_y']
        )

        db.session.add(scenario_scene)
        db.session.flush()

        # make first added scene the start
        if scenario.start_scene is None:
            scenario.start_scene = scenario_scene.id

        db.session.commit()

        return scenario_scene, HTTPStatus.OK

@ns.route("/<string:id>/scenes/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class ScenarioScenesDelete(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_scenes_delete_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()
        scenes_to_delete = ScenarioSceneModel.query.filter(ScenarioSceneModel.id.in_(api.payload['ids'])).all()

        for scene in scenes_to_delete:
            for link in ScenarioSceneLinkModel.query.filter_by(target_id=scene.id).all():
                db.session.delete(link)
            
            if scenario.start_scene == scene.id:
                scenario.start_scene = None

            db.session.delete(scene)

        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/scenes/update")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class ScenarioScenesUpdate(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_scenes_update_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()
        
        update_scenes(api.payload['scenes'])
        db.session.commit()

        return "", HTTPStatus.OK


@ns.route("/<string:id>/scenes/connect")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class ScenarioScenesConnect(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_scene_connect_schema)
    @ns.marshal_with(scenario_scenes_link_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()

        source_id = api.payload['source_id']
        target_id = api.payload['target_id']
        action_id = api.payload['action_id']

        existing_link = ScenarioSceneLinkModel.query.filter_by(source_id=source_id, action_id=action_id).first()

        # should only be possible to have one link from an action
        if existing_link:
            return "Link already exists", HTTPStatus.CONFLICT

        new_link = ScenarioSceneLinkModel(
            source_id=source_id,
            target_id=target_id,
            action_id=action_id
        )

        db.session.add(new_link)
        db.session.commit()

        return new_link, HTTPStatus.OK

@ns.route("/<string:id>/scenes/link/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "The scenario identifier")
class ScenarioScenesLinkDelete(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_scene_connect_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()

        link = ScenarioSceneLinkModel.query.filter_by(id=api.payload['id']).first_or_404()

        db.session.delete(link)
        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/meta")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "the scenario identifier")
class ScenarioMeta(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(scenario_create_schema)
    @ns.marshal_with(scenario_overview_schema)
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()

        scenario.name = api.payload['name']
        scenario.description = api.payload['description']

        db.session.commit()

        return scenario, HTTPStatus.OK

@ns.route("/<string:id>/validate")
@ns.response(HTTPStatus.NOT_FOUND, "Scenario not found")
@ns.param("id", "the scenario identifier")
class ScenarioValidate(Resource):
    @user_jwt_required
    @project_access_required
    def post(self, id):
        scenario = ScenarioModel.query.filter_by(id=id).first_or_404()

        validation = validate(scenario.id)

        return jsonify(validation)

