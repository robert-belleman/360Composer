from flask_restx import Resource
from app.routes.api import api

ns = api.namespace("helloworld")
@ns.route("/")
class HelloWorld(Resource):
    def get(self):
        return "Hello World!"
