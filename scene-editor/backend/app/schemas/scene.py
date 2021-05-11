from flask_restx import fields

from app.routes.api import api

scene_schema = api.model("Scene", {
    "id": fields.String(description="ID of the scene"),
    "project_id": fields.String(description="ID of the project to which this scene belongs"),
    "name": fields.String(description="Name of the scene"),
    "video_id": fields.String(description="ID of the video used"),
    "description": fields.String(description="Description of the scene"),
    "created_at": fields.Date(description="Date at which the scene was created"),
    "updated_at": fields.Date(description="Date at which the scene was last updated"),
})

scene_create_schema = api.model("Scene Create", {
    "user_id": fields.String(description="ID of the user that wants to create the scene"),
    "name": fields.String(description="Name of the scene"),
    "description": fields.String(description="Description of what will be happening in this scene"),
})

scene_update_schema = api.model("Scene Update", {
    "name": fields.String(description="Name of the scene"),
    "description": fields.String(description="Description of what will be happening in this scene"),
})