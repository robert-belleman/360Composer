from flask_restx import fields

from app.routes.api import api
from app.schemas.asset import asset_schema

project_schema = api.model("Project", {
    "id": fields.String(description="ID of the project"),
    "user_id": fields.String(description="ID of the user that created the project"),
    "name": fields.String(description="Name of the project to be created"),
    "created_at": fields.Date(description="Date at which the project was created"),
    "updated_at": fields.Date(description="Date at which the project was last updated"),
})

project_create_schema = api.model("Project Create", {
    "id": fields.String(description="User ID for who to create the project"),
    "name": fields.String(description="Name of the project to be created")
})
