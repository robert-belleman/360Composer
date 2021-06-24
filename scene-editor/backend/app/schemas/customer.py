from flask_restx import fields

from app.routes.api import api

customer_schema = api.model("Customer", {
  "id": fields.String(description="The ID of the user"),
  "therapist_id": fields.String(description="The id of the therapist"),
  "access_code": fields.String(description="The access code of the user"),
  "tag": fields.String(description="The customer tag"),
  "name": fields.String(description="The name of the user")
})

customer_create_schema = api.model("Customer Create", {
  "therapist_id": fields.String(description="The id of the therapist"),
  "access_code": fields.String(description="The access code of the user"),
  "tag": fields.String(description="The customer tag"),
  "name": fields.String(description="The name of the user")
})

customer_delete_schema = api.model("Customer Delete", {
  "id": fields.String(description="The ID of the user"),
  "therapist_id": fields.String(description="The id of the therapist"),
})

customer_option_schema = api.model("Customer Option", {
  "option_id": fields.String(description="The ID of the option"),
  "option": fields.String(description="The text of the option")
})

add_customer_annotation_schema = api.model("Add Customer Annotation", {
  "annotation_id": fields.String(description="The id of the annotation")
})

add_customer_option_schema = api.model("Add Customer Option", {
  "option_id": fields.String(description="The id of the option")
})