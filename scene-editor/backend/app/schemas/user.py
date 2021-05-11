from flask_restx import fields

from app.routes.api import api
from app.schemas.project import project_schema

login_schema = api.model("Login", {
    "username": fields.String(description="The Username of the user to login"),
    "password": fields.String(description="The unhashed password of the user to login")
})

user_schema = api.model("User", {
    "username": fields.String(description="The Username of the user that has logged in"),
    "id": fields.String(description="Unique identifier of the user, used to retrieve data"),
})

register_schema = api.model("Register", {
    "username": fields.String(description="The Username of the user to register"),
    "password": fields.String(description="The unhashed password of the user to register")
})

update_password_schema = api.model("Change Password", {
    "id": fields.String(description="The id of the user"),
    "current_password": fields.String(description="The current password of the user"),
    "new_password": fields.String(description="The new password of the user")
})

customer_login_schema = api.model("Customer Login", {
    "id": fields.String(description="The customer id"),
    "access_code": fields.String(description="The access code of the customer")
})

