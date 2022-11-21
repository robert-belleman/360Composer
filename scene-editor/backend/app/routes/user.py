from flask import make_response, jsonify
from flask_restx import Resource
from http import HTTPStatus

from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, verify_jwt_in_request, unset_jwt_cookies, get_jwt

from app.util.auth import user_jwt_required

from app.routes.api import api
from app.models.database import db

from app.schemas.user import login_schema, user_schema, register_schema, customer_login_schema, update_password_schema
from app.schemas.project import project_schema

from app.models.user import User as UserModel
from app.models.customer import Customer as CustomerModel
from app.models.project import Project as ProjectModel

import hashlib, binascii, os

def hash_password(password):
    """Hash a password for storing."""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'),
                                salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')

def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  provided_password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password

ns = api.namespace("user")

@ns.route("/login")
class Login(Resource):

    @ns.expect(login_schema)
    def post(self):
        user: UserModel = UserModel.query.filter_by(username=api.payload["username"]).first_or_404()

        if verify_password(user.password, api.payload["password"]):
            access_token = create_access_token(identity={'id': user.id, 'role': 'user'})
            refresh_token = create_refresh_token(identity={'id': user.id, 'role': 'user'})

            resp = make_response({'id': user.id, 'role': 'user'}, HTTPStatus.OK)

            set_access_cookies(resp, access_token)
            set_refresh_cookies(resp, refresh_token)

            return resp
        else:
            return "", HTTPStatus.NOT_FOUND


@ns.route("/customer-login")
class CustomerLogin(Resource):

    @ns.expect(customer_login_schema)
    def post(self):
        customer: CustomerModel = CustomerModel.query.filter_by(id=api.payload["id"]).first_or_404()

        if customer.access_code == api.payload["access_code"]:
            access_token = create_access_token(identity={'id': customer.id, 'role': 'customer'})
            refresh_token = create_refresh_token(identity={'id': customer.id, 'role': 'customer'})

            resp = make_response({'id': customer.id, 'role': 'customer'}, HTTPStatus.OK)
            resp.headers.add('Connection', 'keep-alive')

            set_access_cookies(resp, access_token)
            set_refresh_cookies(resp, refresh_token)

            return resp
        else:
            return "", HTTPStatus.NOT_FOUND


@ns.route("/logout")
class Logout(Resource):
    def post(self):
        resp = make_response(jsonify({'logout': True}), HTTPStatus.OK)
        unset_jwt_cookies(resp)

        return resp

@ns.route("/register")
class Register(Resource):
    @ns.expect(register_schema)
    def post(self):
        password_hash = hash_password(api.payload["password"])

        # chcek if user already exists
        if  UserModel.query.filter_by(username=api.payload["username"]).first():
            return "Username already taken", HTTPStatus.CONFLICT

        user = UserModel(username=api.payload["username"],
                    password=password_hash
        )

        db.session.add(user)
        db.session.commit()

        return "", HTTPStatus.CREATED

@ns.route("/<string:id>/")
@ns.response(HTTPStatus.NOT_FOUND, "User not found")
@ns.param("id", "The user identifier")
class User(Resource):
    @user_jwt_required
    @ns.marshal_with(user_schema)
    def get(self, id):
        return UserModel.query.filter_by(id=id).first_or_404()


@ns.route("/update-password")
@ns.response(HTTPStatus.NOT_FOUND, "User not found")
class UserUpdatePassword(Resource):
    @user_jwt_required
    @ns.expect(update_password_schema)
    def post(self):
        claims = get_jwt()

        if claims["id"] != api.payload["id"]:
            return "Unauthorized", HTTPStatus.UNAUTHORIZED

        user: UserModel = UserModel.query.filter_by(id=api.payload["id"]).first_or_404()


        if len(api.payload["new_password"]) < 8:
            return "Password must be at least 8 characters long", HTTPStatus.BAD_REQUEST

        if verify_password(user.password, api.payload["current_password"]):
            new_password_hash = hash_password(api.payload["new_password"])
            user.password = new_password_hash

            db.session.commit()
            return "", HTTPStatus.OK

        return "Incorrect password", HTTPStatus.BAD_REQUEST


@ns.route("/<string:id>/projects")
@ns.response(HTTPStatus.NOT_FOUND, "User not found")
@ns.param("id", "The user identifier")
class UserProjects(Resource):

    @user_jwt_required
    @ns.marshal_with(project_schema)
    def get(self, id):
        user = UserModel.query.filter_by(id=id).first_or_404()
        return ProjectModel.query.filter_by(user_id=user.id).all()
