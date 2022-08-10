import io, csv
from datetime import date, datetime, timedelta

from flask import request, make_response
from flask_restx import Resource, reqparse
from http import HTTPStatus

from flask_jwt_extended import get_jwt

from sqlalchemy import func, extract

from app.models.database import db

from app.util.auth import user_or_customer_jwt_required, user_jwt_required

from app.routes.api import api

from app.models.analytics import Analytics as AnalyticsModel, LegacyAnalytics as LegacyAnalyticsModel
from app.models.timeline import Timeline as TimelineModel, TimelineScenario as TimelineScenarioModel
from app.models.scenario import ScenarioScene as ScenarioSceneModel
from app.models.action import Action as ActionModel
from app.models.customer import Customer as CustomerModel

from app.schemas.analytics import analytics_add_schema, legacy_analytics_add_schema

ns = api.namespace("analytics")

@ns.route("/")
@ns.response(HTTPStatus.NOT_FOUND, "Not found")
class Analytics(Resource):

  @user_or_customer_jwt_required
  @ns.expect(analytics_add_schema)
  def post(self):
    row = AnalyticsModel(
      timeline_id=api.payload['timeline_id'],
      timeline_scenario_id=api.payload['timeline_scenario_id'],
      scenario_scene_id=api.payload['scenario_scene_id'],
      customer_id=api.payload['customer_id'],
      action_id=api.payload['action_id'],
      type=api.payload['type'],
      payload=api.payload['payload']
    )

    db.session.add(row)
    db.session.commit()

    return "", HTTPStatus.OK

@ns.route("/legacy")
@ns.response(HTTPStatus.NOT_FOUND, "Not found")
class LegacyAnalytics(Resource):

  @user_or_customer_jwt_required
  @ns.expect(legacy_analytics_add_schema)
  def post(self):
    row = LegacyAnalyticsModel(
      customer_id = api.payload['customerID'],
      category = api.payload['category'],
      action = api.payload['action'],
      label = api.payload['label'],
      value = api.payload['value'],
      timeline_id = None if api.payload['timelineID'] == "" else api.payload['timelineID'],
      scenario_id = None if api.payload['scenarioID'] == "" else api.payload['scenarioID'],
      scene_id = None if api.payload['sceneID'] == "" else api.payload['sceneID']
    )

    db.session.add(row)
    db.session.commit()

    return "", HTTPStatus.OK

@ns.route("/legacy/export")
class LegacyAnalyticsExport(Resource):

  @user_jwt_required
  def get(self):
    claims = get_jwt()

    num_days = request.args.get('days', default=30)

    filter_after = datetime.today() - timedelta(days = int(num_days))

    rows = db.session.query(LegacyAnalyticsModel, CustomerModel)\
      .filter(LegacyAnalyticsModel.customer_id == CustomerModel.id)\
      .filter(CustomerModel.therapist_id == claims['id'])\
      .filter(LegacyAnalyticsModel.timestamp >= filter_after)\
      .order_by(LegacyAnalyticsModel.timestamp.desc())\
      .all()

    si = io.StringIO()
    cw = csv.writer(si)
    
    cw.writerow(['id', 'timestamp', 'customer_id', 'category', 'action', 'label', 'value', 'timeline_id', 'scenario_id', 'scene_id', 'user_tag', 'therapist_id'])

    for (a, c) in rows:
      cw.writerow([a.id, a.timestamp, a.customer_id, a.category, a.action, a.label, a.value, a.timeline_id, a.scenario_id, a.scene_id, c.tag, c.therapist_id])

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=export.csv"
    output.headers["Content-type"] = "text/csv"
    return output
