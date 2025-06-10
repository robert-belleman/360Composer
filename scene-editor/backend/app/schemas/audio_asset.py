from flask_restx import fields

from app.routes.api import api

audio_asset_schema = api.model("audio_asset", {
    "scenario_id": fields.String(description="ID of the scenario"),
    "customer_id": fields.String(description="ID of the customer"),
    "tag": fields.String(description="tag of the audio recording"),
    "path": fields.String(description="Path of the recording on the server"),
})
