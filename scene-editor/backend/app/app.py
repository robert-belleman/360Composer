from os import environ

from flask import Blueprint, Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.models import database, migrate
from app.routes.api import api

# import the routes
from app.routes.user import Login, CustomerLogin, User, UserProjects, UserUpdatePassword
from app.routes.token import Token, TokenRefresh
from app.routes.project import Project, ProjectAssets, ProjectScenarios, ProjectTimelines, ProjectScenes, ProjectCreate, ProjectObjects, ProjectVideos
from app.routes.asset import Asset
from app.routes.scene import Scene, SceneObjects, SceneActions, SceneMedia, SceneAnnotation, SceneAnnotationDelete, SceneAnnotations, SceneMeta
from app.routes.scenario import Scenario, ScenarioScenes, ScenarioScenesDelete, ScenarioScenesConnect, ScenarioScenesLinkDelete, ScenarioMeta, ScenarioValidate
from app.routes.annotation import AnnotationOptions, AnnotationOptionDelete
from app.routes.timeline import Timeline, TimelineDelete, TimelineScenarios, TimelineScenarioDelete, TimelineCustomers, TimelineCustomersDelete, TimelineRandomize
from app.routes.analytics import Analytics
from app.routes.customer import Customers, Customer, CustomerDelete, CustomerCreate
from app.routes.video_editor import TrimAsset

app = Flask(__name__)
app.config.from_pyfile("config.py")

CORS(app, supports_credentials=True)

database.init_app(app)
migrate.init_app(app, database.db)

print("Database URL: ")	

jwt = JWTManager(app)

@jwt.additional_claims_loader
def add_claims_to_access_token(identity):
    return {'id': identity['id'], 'role': identity['role'] }

blueprint = Blueprint("api", __name__, url_prefix="/api")
api.init_app(blueprint)
app.register_blueprint(blueprint)
