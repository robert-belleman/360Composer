from flask import request
from flask import make_response, jsonify
from flask_restx import Resource
from http import HTTPStatus

from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, jwt_refresh_token_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, verify_jwt_in_request, unset_jwt_cookies, get_jwt_claims

from app.util.auth import user_jwt_required, user_or_customer_jwt_required

from app.routes.api import api
from app.models.database import db

from app.schemas.customer import customer_schema, customer_create_schema, customer_delete_schema

from app.models.customer import Customer as CustomerModel

from app.schemas.annotation_option import option_schema

import sys

ns = api.namespace("customer")

@ns.route('/')
class Customers(Resource):

    @user_jwt_required
    @ns.marshal_with(customer_schema)
    def get(self):
        claims = get_jwt_claims()
        args = request.args

        if not args or not args["therapist_id"]:
            return "User ID is required", HTTPStatus.BAD_REQUEST

        if args["therapist_id"] != claims['id']:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        customer: CustomerModel = CustomerModel.query.filter_by(therapist_id=args["therapist_id"]).all()
        return customer, HTTPStatus.OK

@ns.route('/<string:id>')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class Customer(Resource):

    @user_jwt_required
    @ns.marshal_with(customer_schema)
    def get(self, id):
        claims = get_jwt_claims()

        customer: CustomerModel = CustomerModel.query.filter_by(id=id, therapist_id=claims['id']).first_or_404()

        return customer, HTTPStatus.OK

@ns.route('/create')
class CustomerCreate(Resource):

    @user_jwt_required
    @ns.expect(customer_create_schema)
    @ns.marshal_with(customer_schema)
    def post(self):
        claims = get_jwt_claims()

        name = api.payload['name']
        access_code = api.payload['access_code']
        tag = api.payload['tag']
        therapist_id = api.payload['therapist_id']

        if therapist_id != claims['id']:
            return "therapist id does not match", HTTPStatus.BAD_REQUEST

        tag_check = CustomerModel.query.filter_by(tag=tag).first()

        if tag_check is not None:
          return "Tag already in use", HTTPStatus.CONFLICT

        customer = CustomerModel(access_code=access_code, name=name, tag=tag, therapist_id=therapist_id)

        db.session.add(customer)
        db.session.commit()

        return customer, HTTPStatus.OK


@ns.route('/delete')
class CustomerDelete(Resource):

    @user_jwt_required
    @ns.expect(customer_delete_schema)
    def post(self):
        claims = get_jwt_claims()

        id = api.payload['id']
        therapist_id = api.payload['therapist_id']

        if claims["id"] != therapist_id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        customer = CustomerModel.query.filter_by(id=id, therapist_id=therapist_id).first_or_404()

        db.session.delete(customer)
        db.session.commit()

        return "", HTTPStatus.OK


customer_options = {}
customer_options_chosen = {}

@ns.route('/<string:id>/options')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class CustomerOptions(Resource):

    @user_or_customer_jwt_required
    @ns.marshal_with(option_schema)
    def get(self, id):
        claims = get_jwt_claims()

        customer: CustomerModel = CustomerModel.query.filter_by(id=id).first_or_404()

        if id in customer_options:
            result = customer_options[id]
            del customer_options[id]
            return result, HTTPStatus.OK

        return "Options not found", HTTPStatus.NOT_FOUND

    @user_or_customer_jwt_required
    @ns.expect(option_schema)
    def post(self, id):
        claims = get_jwt_claims()

        customer: CustomerModel = CustomerModel.query.filter_by(id=id).first_or_404()

        customer_options[id] = api.payload['options']

        return "", HTTPStatus.OK


@ns.route('/<string:id>/options/chosen')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class CustomerOptionsChosen(Resource):

    @user_or_customer_jwt_required
    @ns.marshal_with(option_schema)
    def get(self, id):
        claims = get_jwt_claims()

        customer: CustomerModel = CustomerModel.query.filter_by(id=id).first_or_404()

        # print("customer_options = " + str(customer_options), file=sys.stderr)

        if id in customer_options_chosen:
            result = customer_options_chosen[id]
            del customer_options_chosen[id]
            return result, HTTPStatus.OK

        return "Option not found", HTTPStatus.NOT_FOUND

    @user_or_customer_jwt_required
    @ns.expect(option_schema)
    def post(self, id):
        claims = get_jwt_claims()

        customer: CustomerModel = CustomerModel.query.filter_by(id=id).first_or_404()

        customer_options_chosen[id] = api.payload['chosen']

        return "", HTTPStatus.OK

# """
# https://stackoverflow.com/questions/3433559/python-time-delays
# https://stackoverflow.com/questions/4415672/python-theading-timer-how-to-pass-argument-to-the-callback
# """
