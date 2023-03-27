from flask_restx import fields

from app.routes.api import api

usertest_schema = api.model("UserTest", {
    "device": fields.String(description="User Device"),
    "browser": fields.String(description="User Browser"),
    "hmd": fields.String(description="User hmd"),
    "enteredVR": fields.Boolean(description="Did the user enter vr"),
    "workedbaboon": fields.Boolean(description="Did baboon scene work correctly"),
    "workedtopbottom": fields.Boolean(description="Did topbottom scene work correctly"),
    "workedsidebyside": fields.Boolean(description="Did sidebyside scene work correctly"),
    "commentsaframe": fields.String(description="Comments on aframe"),
    "detectedbrowsername": fields.String(description="User detectedbrowsername"),
    "detectedbrowserversion": fields.String(description="User detectedbrowserversion"),
    "detectedosname": fields.String(description="User detectedosname"),
    "detectedosversion": fields.String(description="User detectedosversion"),
    "detectedmobilevendor": fields.String(description="User detectedmobilevendor"),
    "detectedmobilemodel": fields.String(description="User detectedmobilemodel"),
    "submitted_at": fields.Date(description="Date at which the test was submitted"),
})
