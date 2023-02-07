import os
from flask_restx import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from http import HTTPStatus
from flask import send_file, send_from_directory, make_response, jsonify

from app.models.database import db

from functools import wraps

from flask_jwt_extended import get_jwt
from app.util.auth import user_jwt_required, user_or_customer_jwt_required

from app.routes.api import api

from app.schemas.usertest import usertest_schema

from app.models.usertest import UserTest as UserTestModel
 
ns = api.namespace("usertest")

@ns.route("/get")
@ns.response(HTTPStatus.NOT_FOUND, "Usertest not found")
class GetUserTest(Resource):

    @user_or_customer_jwt_required
    @ns.marshal_with(usertest_schema)
    def get(self):
        """
        Fetches the asset location from database and returns it as a file 
        """
        usertests = UserTestModel.query.all()

        return usertests

@ns.route("/post")
@ns.response(HTTPStatus.NOT_FOUND, "Usertest not found")
class PostUserTest(Resource):

    @user_or_customer_jwt_required
    @ns.expect(usertest_schema)
    def post(self):
        """
        Fetches the asset location from database and returns it as a file 
        """
        row = UserTestModel(
            device = api.payload['device'],
            os = api.payload['os'],
            workedbaby = api.payload['workedbaby'],
            commentsbaby = api.payload['commentsbaby'],
            workedaframe = api.payload['workedAframe'],
            commentsaframe = api.payload['commentsAframe']
        )

        db.session.add(row)
        db.session.commit()

        return "", HTTPStatus.OK