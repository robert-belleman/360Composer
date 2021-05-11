from flask_restx import fields

from app.routes.api import api

scene_object_schema = api.model("Scene Object", {
    "id": fields.String(description="ID of the  sceneobject"),
    "scene_id": fields.String(description="ID of the scene to which this object belongs"),
    "asset_id": fields.String(description="ID of the asset thats used with this object"),
    "asset.path": fields.String(description="Path to the asset linked to this object"),
    "x_pos": fields.Float(description="X position of the object in 3D space"),
    "y_pos": fields.Float(description="Y position of the object in 3D space"),
    "z_pos": fields.Float(description="Z position of the object in 3D space"),

    "x_scale": fields.Float(description="Scaling on X-axis of the object"),
    "y_scale": fields.Float(description="Scaling on Y-axis of the object"),
    "z_scale": fields.Float(description="Scaling on Z-axis of the object"),

    "x_rotation": fields.Float(description="Rotation on X-axis of the object"),
    "y_rotation": fields.Float(description="Rotation on Y-axis of the object"),
    "z_rotation": fields.Float(description="Rotation on Z-axis of the object"),
    "w_rotation": fields.Float(description="Rotation on W-axis of the object"),
    
})

scene_object_create_schema = api.model("Scene Object Create", {
    "asset_id": fields.String(description="ID of the asset thats used with this object", required=True),
    "x_pos": fields.Float(description="X position of the object in 3D space", default=0.0, required=True),
    "y_pos": fields.Float(description="Y position of the object in 3D space", default=0.0, required=True),
    "z_pos": fields.Float(description="Z position of the object in 3D space", default=0.0, required=True),

    "x_scale": fields.Float(description="Scaling on X-axis of the object", default=1.0, required=True),
    "y_scale": fields.Float(description="Scaling on Y-axis of the object", default=1.0, required=True),
    "z_scale": fields.Float(description="Scaling on Z-axis of the object", default=1.0, required=True),

    "x_rotation": fields.Float(description="Rotation on X-axis of the object", default=0.0, required=True),
    "y_rotation": fields.Float(description="Rotation on Y-axis of the object", default=0.0, required=True),
    "z_rotation": fields.Float(description="Rotation on Z-axis of the object", default=0.0, required=True),
    "w_rotation": fields.Float(description="Rotation on W-axis of the object", default=1.0, required=True),
})

scene_object_update_schema = api.model("Scene Object Update", {
    "id": fields.String(description="ID of the asset thats used with this object", required=True),
    "x_pos": fields.Float(description="X position of the object in 3D space", default=0.0, required=True),
    "y_pos": fields.Float(description="Y position of the object in 3D space", default=0.0, required=True),
    "z_pos": fields.Float(description="Z position of the object in 3D space", default=0.0, required=True),

    "x_scale": fields.Float(description="Scaling on X-axis of the object", default=1.0, required=True),
    "y_scale": fields.Float(description="Scaling on Y-axis of the object", default=1.0, required=True),
    "z_scale": fields.Float(description="Scaling on Z-axis of the object", default=1.0, required=True),

    "x_rotation": fields.Float(description="Rotation on X-axis of the object", default=0.0, required=True),
    "y_rotation": fields.Float(description="Rotation on Y-axis of the object", default=0.0, required=True),
    "z_rotation": fields.Float(description="Rotation on Z-axis of the object", default=0.0, required=True),
    "w_rotation": fields.Float(description="Rotation on W-axis of the object", default=0.0, required=True),
})
