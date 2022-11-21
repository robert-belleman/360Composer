from flask import request
from flask import make_response, jsonify
from flask_restx import Resource
from http import HTTPStatus

from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies, verify_jwt_in_request, unset_jwt_cookies, get_jwt

from app.util.auth import user_jwt_required, user_or_customer_jwt_required

from app.routes.api import api
from app.models.database import db

from app.schemas.customer import customer_schema, customer_create_schema, customer_delete_schema, add_customer_annotation_schema, customer_option_schema, add_customer_option_schema

from app.models.customer import Customer as CustomerModel
from app.models.option import Option as OptionModel
from app.models.customer_annotation import CustomerAnnotation as CustomerAnnotationModel
from app.models.customer_option import CustomerOption as CustomerOptionModel

import sys

ns = api.namespace("customer")

@ns.route('/')
class Customers(Resource):

    @user_jwt_required
    @ns.marshal_with(customer_schema)
    def get(self):
        claims = get_jwt()
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
        claims = get_jwt()

        customer: CustomerModel = CustomerModel.query.filter_by(id=id, therapist_id=claims['id']).first_or_404()

        return customer, HTTPStatus.OK

@ns.route('/create')
class CustomerCreate(Resource):

    @user_jwt_required
    @ns.expect(customer_create_schema)
    @ns.marshal_with(customer_schema)
    def post(self):
        claims = get_jwt()

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
        claims = get_jwt()

        id = api.payload['id']
        therapist_id = api.payload['therapist_id']

        if claims["id"] != therapist_id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        customer = CustomerModel.query.filter_by(id=id, therapist_id=therapist_id).first_or_404()

        db.session.delete(customer)
        db.session.commit()

        return "", HTTPStatus.OK


def delete_customer_option(id, commit=True):
    CustomerOptionModel.query.filter_by(customer_id=id).delete()
    if commit:
        db.session.commit()


def delete_customer_annotation(id, commit=True):
    CustomerAnnotationModel.query.filter_by(customer_id=id).delete()
    if commit:
        db.session.commit()


@ns.route('/<string:id>/options')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class CustomerOptions(Resource):

    @user_or_customer_jwt_required
    @ns.marshal_with(customer_option_schema)
    def get(self, id):
        claims = get_jwt()

        customer_annotation = CustomerAnnotationModel.query.filter_by(customer_id=id).first_or_404()
        annotation_id = customer_annotation.annotation_id

        if claims["id"] != id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        options = (
            db.session.query(OptionModel)\
                .filter(OptionModel.annotation_id == annotation_id)\
                .all()
        )

        if options:
            options_ = []
            for option in options:
                options_.append({"option_id": option.id, "option": option.text})

            delete_customer_annotation(id)
            return options_, HTTPStatus.OK

        return "Options not found", HTTPStatus.NOT_FOUND

    @user_or_customer_jwt_required
    @ns.expect(add_customer_annotation_schema)
    def post(self, id):
        claims = get_jwt()
        annotation_id = api.payload["annotation_id"]

        if claims["id"] != id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        row = CustomerAnnotationModel(
            customer_id=id,
            annotation_id=annotation_id
        )

        delete_customer_annotation(id, False)

        db.session.add(row)
        db.session.commit()

        return "", HTTPStatus.OK


@ns.route('/<string:id>/options/chosen')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class CustomerOptionsChosen(Resource):

    @user_or_customer_jwt_required
    @ns.marshal_with(customer_option_schema)
    def get(self, id):
        claims = get_jwt()

        customer_option = CustomerOptionModel.query.filter_by(customer_id=id).first_or_404()
        option_id = customer_option.option_id

        if claims["id"] != id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        option = OptionModel.query.filter_by(id=option_id).first_or_404()
        option_ = {"option_id": option.id, "option": option.text}
        delete_customer_option(id)

        return option_, HTTPStatus.OK

    @user_or_customer_jwt_required
    @ns.expect(add_customer_option_schema)
    def post(self, id):
        claims = get_jwt()
        option_id = api.payload["option_id"]

        if claims["id"] != id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        row = CustomerOptionModel(
            customer_id=id,
            option_id=option_id
        )

        delete_customer_option(id, False)

        db.session.add(row)
        db.session.commit()

        return "", HTTPStatus.OK


@ns.route('/<string:id>/options/delete')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class CustomerOptionsDelete(Resource):

    @user_or_customer_jwt_required
    def post(self, id):
        claims = get_jwt()

        if claims["id"] != id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        delete_customer_annotation(id)

        return "", HTTPStatus.OK


@ns.route('/<string:id>/options/chosen/delete')
@ns.response(HTTPStatus.NOT_FOUND, "Customer not found")
@ns.param("id", "The customer identifier")
class CustomerOptionsChosenDelete(Resource):

    @user_or_customer_jwt_required
    def post(self, id):
        claims = get_jwt()

        if claims["id"] != id:
            return "Unauthorized for user", HTTPStatus.UNAUTHORIZED

        delete_customer_option(id)

        return "", HTTPStatus.OK
