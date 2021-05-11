from flask_restx import fields

from app.routes.api import api
from app.schemas.annotation_option import annotation_option_schema

add_scene_annotation_schema = api.model("Add Scene Annotation", {
  "text": fields.String(description="The text of the annotation"),
  "timestamp": fields.Integer(description="When the annotation is shown"),
  "type": fields.Integer(description="The type of the annotation")
})

scene_annotation_schema = api.model("Scene Annotation", {
  "id": fields.String(description="ID of the annotation"),
  "scene_id": fields.String(description="ID of the related scene"),
  "text": fields.String(description="The text of the annotation"),
  "timestamp": fields.Integer(description="When the annotation is shown"),
  "type": fields.Integer(description="The type of the annotation"),
  "options": fields.Nested(annotation_option_schema)
})

get_scene_annotation_schema = api.model("Get Scene Annotation", {
  "id": fields.String(description="ID of the annotation")
})
