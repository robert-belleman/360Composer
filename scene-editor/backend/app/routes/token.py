from flask import make_response, jsonify
from flask_restx import Resource

import jwt

from http import HTTPStatus

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, verify_jwt_in_request, get_jwt, exceptions

from app.util.auth import user_jwt_required, user_or_customer_jwt_required

from app.routes.api import api

from app.models.user import User as UserModel
from app.models.customer import Customer as CustomerModel

def filter_for(id, role):
  user = None
  
  if role == 'user':
      user = UserModel.query.filter_by(id=id).first_or_404()
  elif role == 'customer':
      user = CustomerModel.query.filter_by(id=id).first_or_404()
  
  return user

ns = api.namespace("token")

@ns.route("/")
class Token(Resource):

    @user_or_customer_jwt_required
    def get(self):
        try:
            verify_jwt_in_request()
        except jwt.exceptions.ExpiredSignatureError:
            return "Unauthorized", HTTPStatus.UNAUTHORIZED
        except exceptions.NoAuthorizationError:
            return "No cookie set", HTTPStatus.BAD_REQUEST

        current_user = get_jwt_identity()
        return current_user, HTTPStatus.OK

@ns.route("/refresh")
class TokenRefresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        claims = get_jwt()

        user = filter_for(claims['id'], claims['role'])

        if user is None:
            return "", HTTPStatus.UNAUTHORIZED

        identity = {'id': user.id, 'role': claims['role']}

        access_token = create_access_token(identity=identity)
        resp = make_response(identity, HTTPStatus.OK)
        set_access_cookies(resp, access_token)

        return resp
