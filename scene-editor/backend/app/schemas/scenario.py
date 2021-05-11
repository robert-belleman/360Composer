from flask_restx import fields

from app.routes.api import api

from app.schemas.action import action_schema

scenario_overview_schema = api.model("Scenario Overview", {
    "id": fields.String(description="ID of the scenario"),
    "name": fields.String(description="Name of the project to be created"),
    "description": fields.String(description="Description of the scenario to be created")
})

scenario_create_schema = api.model("Scenario Create", {
    "name": fields.String(description="Name of the project to be created"),
    "description": fields.String(description="Description of the scenario to be created")
})

action_label_schema = api.model("Action Label", {
    "label": fields.String(description="Label of the action")
})

scenario_scenes_link_schema = api.model("Scenario Scenes Action", {
    "id": fields.String(description="ID of the action"),
    "source_id": fields.String(description="ID of the source"),
    "target_id": fields.String(description="ID of the target"),
    "action_id": fields.String(description="ID of the action")
})

scene_schema = api.model("Scene", {
    "name": fields.String(description="Name of the scene"),
    "description": fields.String(description="Description of the Scene")
})

scenario_scenes_actions_schema = api.model("Scenario Scenes Actions", {
    "id": fields.String(description="The id of the action"),
    "label": fields.String(description="The label of the action")
})

scenario_scenes_schema = api.model("Scenario Scenes", {
    "id": fields.String(description="ID of the instance of the scene in the scenario"),
    "scene_id": fields.String(description="ID of the scene"),
    "scenario_id": fields.String(description="ID of the scenario"),
    "position_x": fields.Integer(description="The x position of the scene in the timeline"),
    "position_y": fields.Integer(description="The y position of the scene in the timeline"),
    "links": fields.List(fields.Nested(scenario_scenes_link_schema)),
    "actions": fields.List(fields.Nested(scenario_scenes_actions_schema)),
    "scene": fields.Nested(scene_schema)
})

scenario_schema = api.model("Scenario", {
    "id": fields.String(description="ID of the project"),
    "project_id": fields.String(description="ID of the project to which this scenario belongs"),
    "name": fields.String(description="Name of the scenario to be created"),
    "description": fields.String(description="Description of the scenario to be created"),
    "start_scene": fields.String(description="The id of the first scenario scene"),
    "created_at": fields.Date(description="Date at which the scenario was created"),
    "updated_at": fields.Date(description="Date at which the scenario was last updated"),
    "scenes": fields.Nested(scenario_scenes_schema)
})

scenario_scenes_update_schema = api.model("Scenario Scenes Update", {
    "scenes": fields.List(fields.Nested(scenario_scenes_schema))
})

scenario_scenes_add_schema = api.model("Scenario Scenes Add", {
    "scene_id": fields.String(description="ID of the scene to add"),
    "position_x": fields.Integer(description="The x position of the scene in the timeline"),
    "position_y": fields.Integer(description="The y position of the scene in the timeline"),
})

scenario_scenes_delete_schema = api.model("Scenario Scenes Delete", {
    "ids": fields.List(fields.String())
})

scenario_update_schema = api.model("Scenario", {
    "start_scene": fields.String(description="ID of the starting scene"),
    "scenes": fields.Nested(scenario_scenes_update_schema)
})

scenario_scene_connect_schema = api.model("Scenario Scene Connect", {
    "source_id": fields.String(description="ID of the source"),
    "target_id": fields.String(description="ID of the target"),
    "action_id": fields.String(description="ID of the action"),
})

scenario_scene_link_delete_schema = api.model("Scenario Scene Link Delete", {
    "id": fields.String(description="ID of the link to delete")
})