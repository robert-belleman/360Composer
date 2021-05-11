from flask_restx import fields

from app.routes.api import api

action_schema = api.model("Action", {
    "id": fields.String(description="ID of the action"),
    "type": fields.String(description="The type of the action"),
    "scene_id": fields.String(description="The ID of the corresponding scene"),
    "payload": fields.String(description="The payload of the action")
})