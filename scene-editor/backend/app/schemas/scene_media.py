from flask_restx import fields

from app.routes.api import api

scene_add_media_schema = api.model("Add Scene Media", {
  "id": fields.String(description="ID of the scene"),
  "video_id": fields.String(description="ID of the media")
})

scene_media_schema = api.model("Scene Media", {
  "id": fields.String(description="ID of the scene"),
  "video_id": fields.String(description="ID of the media")
})