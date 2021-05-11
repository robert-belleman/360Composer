from flask_restx import fields

from app.routes.api import api

analytics_add_schema = api.model("Analytics Add", {
  "timeline_id": fields.String(description="The type of action to perform when selecting this option"),
  "timeline_scenario_id": fields.String(description="The payload for the action"),
  "scenario_scene_id": fields.String(description="The payload for the action"),
  "customer_id": fields.String(description="The payload for the action"),
  "action_id": fields.String(description="The payload for the action"),
  "type": fields.String(description="The payload for the action"),
  "payload": fields.String(description="The payload for the action")
})

legacy_analytics_add_schema = api.model("Legacy Analytics Add", {
  "customerID": fields.String(description="The id of the customer"),
  "category": fields.String(description="The category of the event"),
  "label": fields.String(description="The label of the event"),
  "value": fields.String(description="The value of the event"),
  "timelineID": fields.String(description="the id of the timeline"),
  "scenarioID": fields.String(description="the id of the scenario"),
  "sceneIDs": fields.String(description="the id of the scene")
})
