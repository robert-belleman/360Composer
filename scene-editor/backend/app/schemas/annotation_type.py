from flask_restx import fields

from app.routes.api import api

annotation_type_schema = api.model("Annotation Type", {
  "id": fields.Integer(description="The id of the correlated annotation type"),
  "text": fields.String(description="The text describing the correlated annotation type")
})