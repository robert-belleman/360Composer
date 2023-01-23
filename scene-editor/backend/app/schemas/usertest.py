from flask_restx import fields

from app.routes.api import api

usertest_schema = api.model("UserTest", {
    "device": fields.String(description="User Device"),
    "os": fields.String(description="User Os"),
    "workedbaby": fields.Boolean(description="Did babylon work correctly"),
    "commentsbaby": fields.String(description="Comments on babylon"),
    "workedaframe": fields.Boolean(description="Did aframe work correctly"),
    "commentsaframe": fields.String(description="Comments on aframe"),
    "submitted_at": fields.Date(description="Date at which the test was submitted"),
})
