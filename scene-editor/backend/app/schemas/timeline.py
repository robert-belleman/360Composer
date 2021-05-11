from flask_restx import fields

from app.routes.api import api

timeline_schema = api.model("Timeline", {
    "id": fields.String(description="ID of the project"),
    "project_id": fields.String(description="ID of the project to which this timeline belongs"),
    "start": fields.String(description="The starting point of the timeline"),
    "randomized": fields.Boolean(description="True if timeline is randomized, false otherwise"),
    "name": fields.String(description="Name of the timeline to be created"),
    "description": fields.String(description="Description of the timeline to be created"),
    "created_at": fields.Date(description="Date at which the timeline was created"),
    "updated_at": fields.Date(description="Date at which the timeline was last updated"),
})

timeline_update_schema = api.model("Timeline Update", {
    "start": fields.String(description="The starting point of the timeline"),
    "randomized": fields.Boolean(description="True if timeline is randomized, false otherwise"),
    "name": fields.String(description="Name of the timeline to be created"),
    "description": fields.String(description="Description of the timeline to be created"),
})

timeline_delete_schema = api.model("Timeline Delete", {
    "id": fields.String(description="The ID of the timeline")
})

timeline_create_schema = api.model("Timeline Create", {
    "name": fields.String(description="Name of the timeline to be created"),
    "description": fields.String(description="Description of the timeline to be created"),
    "randomized": fields.Boolean(description="True if timeline is ranzomized")
})

timeline_scenario_schema = api.model("Timeline Scenario", {
    "id": fields.String(description="ID of the timeline scenario record"),
    "scenario_id": fields.String(description="ID of the scenario"),
    "next_scenario": fields.String(description="The scenario it links to"),
    "scenario": fields.Nested(api.model("Timeline Scenario Info", {
        "name": fields.String(description="The name of the scenario"),
        "description": fields.String(description="The description of the scenario")
    }))
})

timeline_scenario_delete_schema = api.model("Timeline Scenario Delete", {
    "scenario_ids": fields.List(fields.Raw())
})

timeline_scenario_add_schema = api.model("Timeline Add Scenario", {
    "scenarios": fields.List(fields.Raw())
})

timeline_scenario_order_schema = api.model("Timeline Scenario Order", {
    "scenarios": fields.List(
        fields.Nested(
            api.model("", { "id": fields.String(), "next": fields.String() })
        )
    )
})

timeline_customer = api.model("Timeline Customer", {
    "id": fields.String(description="The ID of the user"),
    "access_code": fields.String(description="The access code of the user"),
    "tag": fields.String(description="The customer tag"),
    "name": fields.String(description="The name of the user")
})

timeline_customer_schema = api.model("Timeline Customer Schema", {
    "customer": fields.Nested(timeline_customer)
})

timeline_customer_add_schema = api.model("Timeline Customer Add", {
    "id": fields.String(description="The ID of the user")
})

timeline_customer_delete_schema = api.model("Timeline Customer Add", {
    "ids": fields.List(fields.Raw())
})

timeline_randomize_schema = api.model("Timeline Randomize", {
    "ids": fields.Boolean(description="true if randomized, false otherwise")
})