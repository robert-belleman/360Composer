import os, json, random, itertools

from flask import jsonify, make_response

from flask_restx import Resource
from http import HTTPStatus

from functools import wraps

from flask_jwt_extended import get_jwt_claims
from app.util.auth import user_jwt_required, user_or_customer_jwt_required, timeline_access_required

from app.routes.api import api
from app.models.database import db

from app.schemas.timeline import timeline_schema, timeline_update_schema, timeline_scenario_schema, timeline_scenario_add_schema, timeline_scenario_delete_schema, timeline_customer_schema, timeline_customer_add_schema, timeline_customer_delete_schema, timeline_scenario_order_schema, timeline_randomize_schema

from app.models.timeline import Timeline as TimelineModel, TimelineScenario as TimelineScenarioModel, CustomerTimeline as CustomerTimelineModel
from app.models.scenario import Scenario as ScenarioModel, ScenarioScene as ScenarioSceneModel, ScenarioSceneLink as ScenarioSceneLinkModel
from app.models.scene import Scene as SceneModel
from app.models.action import Action as ActionModel, ActionType as ActionType
from app.models.option import Option as OptionModel
from app.models.project import Project as ProjectModel
from app.models.annotation import Annotation as AnnotationModel

def project_access_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        claims = get_jwt_claims()
        timeline = TimelineModel.query.filter_by(id=kwargs['id']).first_or_404()
        project = ProjectModel.query.filter_by(id=timeline.project_id, user_id=claims['id']).first()

        if project is None:
            return make_response(jsonify(msg='No access to project'), HTTPStatus.UNAUTHORIZED)
        else:
            return fn(*args, **kwargs)

    return wrapper

ns = api.namespace("timeline")

@ns.route("/<string:id>/")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class Timeline(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(timeline_schema)
    def get(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        return timeline, HTTPStatus.OK

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(timeline_update_schema)
    def put(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        timeline.start = api.payload['start']
        timeline.randomized = api.payload['randomized']
        timeline.name = api.payload['name']
        timeline.description = api.payload['description']

        db.session.commit()

        return timeline, HTTPStatus.OK

@ns.route("/<string:id>/scenarios")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineScenarios(Resource):

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(timeline_scenario_schema)
    def get(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        if timeline.start == None:
            timeline_scenarios = TimelineScenarioModel.query.filter_by(timeline_id=timeline.id).all()
            return timeline_scenarios, HTTPStatus.OK

        start = TimelineScenarioModel.query.filter_by(timeline_id=timeline.id, id=timeline.start).first_or_404()

        scenarios = [start]
        nextID = start.next_scenario

        while nextID is not None:
            next_scenario = TimelineScenarioModel.query.filter_by(timeline_id=timeline.id, id=nextID).first_or_404()
            scenarios.append(next_scenario)
            nextID = next_scenario.next_scenario

        return scenarios, HTTPStatus.OK

    @user_jwt_required
    @project_access_required
    @ns.expect(timeline_scenario_add_schema)
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        current_end = TimelineScenarioModel.query.filter_by(timeline_id=timeline.id, next_scenario=None).first()

        added_scenarios = []

        for scenario_id in api.payload['scenarios']:
            timeline_scenario = TimelineScenarioModel(timeline_id=timeline.id, scenario_id=scenario_id)
            added_scenarios.append(timeline_scenario)
            db.session.add(timeline_scenario)

        db.session.flush()

        scenarios_to_update = [current_end] + added_scenarios if current_end is not None else added_scenarios
        scenarios_to_update_length = len(scenarios_to_update)

        for i, scenario in enumerate(scenarios_to_update):
            if i == 0 and timeline.start is None:
                timeline.start = scenario.id

            if i == scenarios_to_update_length-1:
                scenario.next_scenario = None
                continue

            scenario.next_scenario = scenarios_to_update[i+1].id

        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/scenarios/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineScenarioDelete(Resource):

    def find_next(self, timeline_id, ids, timeline_scenario):
        next_scenario_id = timeline_scenario.next_scenario

        while next_scenario_id in ids:
            scenario = TimelineScenarioModel.query.filter_by(id=next_scenario_id, timeline_id=timeline_id).first_or_404()

            if scenario.next_scenario is None:
                return None

            next_scenario_id = scenario.next_scenario

        return next_scenario_id

    @user_jwt_required
    @project_access_required
    @ns.expect(timeline_scenario_delete_schema)
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        for timeline_scenario_id in api.payload['ids']:
            timeline_scenario = TimelineScenarioModel.query.filter_by(id=timeline_scenario_id, timeline_id=timeline.id).first_or_404()

            if timeline.start == timeline_scenario.id:
                timeline.start = timeline_scenario.next_scenario
                db.session.flush()

            previous_scenario = TimelineScenarioModel.query.filter_by(next_scenario=timeline_scenario.id, timeline_id=timeline.id).first()

            if previous_scenario:
                previous_scenario.next_scenario = self.find_next(timeline.id, api.payload['ids'], timeline_scenario)
                db.session.flush()

            db.session.delete(timeline_scenario)

        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/randomize")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineRandomize(Resource):
    @user_jwt_required
    @project_access_required
    @ns.expect(timeline_randomize_schema)
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        timeline.randomized = api.payload['randomized']
        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/scenarios/order")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineScenarioOrder(Resource):

    @user_jwt_required
    @project_access_required
    @ns.expect(timeline_scenario_order_schema)
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        scenarios = api.payload

        if len(scenarios) > 0:
            timeline.start = scenarios[0]['id']

        for scenario in scenarios:
            timeline_scenario = TimelineScenarioModel.query.filter_by(id=scenario['id']).first_or_404()
            timeline_scenario.next_scenario = scenario['next']

        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineDelete(Resource):
    @user_jwt_required
    @project_access_required
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        db.session.delete(timeline)
        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/customers")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineCustomers(Resource):
    @user_jwt_required
    @project_access_required
    @ns.marshal_with(timeline_customer_schema)
    def get(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        customers = CustomerTimelineModel.query.filter_by(timeline_id=id).all()

        return customers, HTTPStatus.OK

    @user_jwt_required
    @project_access_required
    @ns.expect(timeline_customer_delete_schema)
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        ids = api.payload['ids']

        for customer_id in ids:
            row = CustomerTimelineModel(timeline_id=id, customer_id=customer_id)
            db.session.add(row)

        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/customers/delete")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineCustomersDelete(Resource):
    @user_jwt_required
    @project_access_required
    @ns.marshal_with(timeline_customer_delete_schema)
    def post(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        ids = api.payload['ids']

        for customer_id in ids:
            row = CustomerTimelineModel.query.filter_by(timeline_id=id, customer_id=customer_id).first_or_404()
            db.session.delete(row)

        db.session.commit()

        return "", HTTPStatus.OK

@ns.route("/<string:id>/export")
@ns.response(HTTPStatus.NOT_FOUND, "Timeline not found")
@ns.param("id", "The timeline identifier")
class TimelineExport(Resource):
    def annotations(self, scene_id, scenario_scene_id):
        annotations = AnnotationModel.query.filter_by(scene_id=scene_id).all()
        annotations_ = []

        for annotation in annotations:
            options = (
                db.session.query(ActionModel, OptionModel)\
                    .filter(OptionModel.annotation_id == annotation.id)\
                    .filter(OptionModel.action_id == ActionModel.id)\
                    .all()
            )

            options_ = []

            for (action, option) in options:
                link = ScenarioSceneLinkModel.query.filter_by(source_id=scenario_scene_id, action_id=action.id).first()
                next_scene = link.target_id if link is not None else None
                options_.append({"option": option.text, "feedback": option.feedback, "next_segment_id": next_scene})

            annotations_.append({"annotation": annotation.text, "timestamp": annotation.timestamp * 1000000, "type": annotation.type, "options": options_})

        return annotations_

    @user_or_customer_jwt_required
    @timeline_access_required
    def get(self, id):
        timeline = TimelineModel.query.filter_by(id=id).first_or_404()

        scenarios = (
            db.session.query(TimelineScenarioModel, ScenarioModel)\
                .filter(TimelineScenarioModel.timeline_id == timeline.id)\
                .filter(ScenarioModel.id == TimelineScenarioModel.scenario_id)\
                .all()
        )

        scenarios_ = []

        for index, (timeline_scenario, scenario) in enumerate(scenarios):
            scenes = (
                db.session.query(TimelineScenarioModel, ScenarioModel, ScenarioSceneModel, SceneModel)\
                    .filter(TimelineScenarioModel.id == timeline_scenario.id)\
                    .filter(TimelineScenarioModel.timeline_id == timeline.id)\
                    .filter(TimelineScenarioModel.scenario_id == ScenarioModel.id)
                    .filter(TimelineScenarioModel.scenario_id == ScenarioSceneModel.scenario_id)
                    .filter(SceneModel.id == ScenarioSceneModel.scene_id)
                    .all()
            )

            segments = []

            for (_, _, scenario_scene, scene) in scenes:
                o = {
                    "uuid": scenario_scene.id,
                    "scene_id": scene.id,
                    "video": scene.video_id,
                    "annotations": self.annotations(scene.id, scenario_scene.id)
                }

                segments.append(o)

            scenarios_.append({"uuid": timeline_scenario.id, "scenario_id": scenario.id, "start_scene": scenario.start_scene, "segments": segments, "name": scenario.name, "next_scenario": timeline_scenario.next_scenario})

        r = {
            "name": timeline.name,
            "uuid": timeline.id,
            "scenarios": scenarios_,
            "randomized": timeline.randomized,
            "start": timeline.start
        }

        self.future_annotations = {}

        return jsonify(r, HTTPStatus.OK)