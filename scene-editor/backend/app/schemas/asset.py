from flask_restx import fields

from app.routes.api import api

asset_schema = api.model("Asset", {
    "id": fields.String(description="ID of the asset"),
    "name": fields.String(description="Name of the asset"),
    "path": fields.String(description="Path of the asset on the server"),
    "thumbnail_path": fields.String(description="Path of the thumbnail of the asset on the server"),
    "hls_path": fields.String(description="Path to the HLS playlist to stream the asset."),
    "asset_type": fields.String(description="The type of asset, this can either be a video or a model"),
    "view_type": fields.String(description="The view type of the asset. States if the video is stereosopic"),
    "file_size": fields.Integer(description="The size of the file"),
    "duration": fields.Integer(description="The duration of the asset"),
    "created_at": fields.Date(description="Date at which the asset was created"),
    "updated_at": fields.Date(description="Date at which the asset was last updated"),
})
