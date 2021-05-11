import jwt

from flask import make_response, jsonify

from uuid import UUID

from functools import wraps
from http import HTTPStatus

from app.models.database import db
from app.models.user import User as UserModel
from app.models.customer import Customer as CustomerModel
from app.models.timeline import CustomerTimeline as CustomerTimelineModel

from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt_claims, get_raw_jwt, exceptions

def valid_uuid(str_):
    try:
      # test if valid uuid
      uuid_obj = UUID(str_, version=4)
      return True
    except ValueError:
      return False

def get_model_for_claim(role_claim):
  d = {'user': UserModel, 'customer': CustomerModel}

  try:
    return d[role_claim]
  except KeyError:
    return None

def not_exists():
    return make_response(jsonify(msg='User or customer does not exist'), HTTPStatus.UNAUTHORIZED)

def user_jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
          verify_jwt_in_request()
        except jwt.exceptions.ExpiredSignatureError:
            return "Expired Signature", HTTPStatus.UNAUTHORIZED
        except exceptions.NoAuthorizationError:
            return "No cookie set", HTTPStatus.BAD_REQUEST

        claims = get_jwt_claims()

        if claims['role'] != 'user':
          return make_response(jsonify(msg='Must be user'), HTTPStatus.UNAUTHORIZED)

        if not valid_uuid(claims['id']):
          return not_exists()

        user = UserModel.query.filter_by(id=claims['id']).first()

        if user is None:
            return not_exists()
        else:
            return fn(*args, **kwargs)
    return wrapper

def user_or_customer_jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
          verify_jwt_in_request()
        except jwt.exceptions.ExpiredSignatureError:
            return "Expired Signature", HTTPStatus.UNAUTHORIZED
        except exceptions.NoAuthorizationError:
            return "No cookie set", HTTPStatus.BAD_REQUEST

        claims = get_jwt_claims()

        if claims['role'] != 'user' and claims['role'] != 'customer':
          return make_response(jsonify(msg='Must be user or customer'), HTTPStatus.UNAUTHORIZED)

        if not valid_uuid(claims['id']):
          return not_exists()

        model = get_model_for_claim(claims['role'])
        user = model.query.filter_by(id=claims['id']).first() if model is not None else None

        if user is None:
            return not_exists()
        else:
            return fn(*args, **kwargs)

    return wrapper

def timeline_access_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
      try:
        verify_jwt_in_request()
      except jwt.exceptions.ExpiredSignatureError:
            return "Expired Signature", HTTPStatus.UNAUTHORIZED
      except exceptions.NoAuthorizationError:
          return "No cookie set", HTTPStatus.BAD_REQUEST

      claims = get_jwt_claims()

      if claims['role'] != 'user' and claims['role'] != 'customer':
          return make_response(jsonify(msg='Must be user or customer'), HTTPStatus.UNAUTHORIZED)
      
      if not valid_uuid(claims['id']):
          return not_exists()

      if claims['role'] == 'user':
          return fn(*args, **kwargs)
      else:
          customer_timeline = CustomerTimelineModel.query.filter_by(timeline_id=kwargs['id'], customer_id=claims['id']).first()

          if customer_timeline is None:
              return make_response(jsonify(msg='Customer does not have access to the timeline'), HTTPStatus.UNAUTHORIZED)
          else:
              return fn(*args, **kwargs)
    
    return wrapper