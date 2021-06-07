from flask_restx import fields

from app.routes.api import api

action = api.model("action", {
  "id": fields.String(description="The id of the correlated action"),
  "type": fields.String(description="The type of action to perform when selecting this option"),
  "payload": fields.String(description="The payload for the action")
})

action_add = api.model("action add", {
  "scene_id": fields.String(description="The ID of the corresponding scene"),
  "type": fields.String(description="The type of action to perform when selecting this option"),
  "payload": fields.String(description="The payload for the action")
})

annotation_option_schema = api.model("Scene Annotation Option", {
  "id": fields.String(description="the id of the option"),
  "text": fields.String(description="The text of the annotation"),
  "feedback": fields.String(description="The feedback of the option"),
  "action": fields.Nested(action)
})

add_annotation_option_schema = api.model("Add Annotation Option", {
  "scene_id": fields.String(description="the id of the scene"),
  "text": fields.String(description="The text of the option"),
  "feedback": fields.String(description="The feedback of the option"),
  "action": fields.Nested(action_add)
})

update_annotation_option_schema = api.model("Update Annotation Option", {
  "id": fields.String(description="Option identifier"),
  "text": fields.String(description="The text of the option"),
  "feedback": fields.String(description="The feedback of the option"),
  "action": fields.Nested(action)
})

delete_annotation_option_schema = api.model("Delete Annotation Option", {
  "id": fields.String(description="Option identifier")
})

option_schema = api.model("Option", {
  "feedback": fields.String(description="The feedback of the option"),
  "next_segment_id": fields.String(description="The identifier for the next segment"),
  "option": fields.String(description="The text of the option")
})

