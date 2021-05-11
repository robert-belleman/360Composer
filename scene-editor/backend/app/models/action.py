import uuid
import enum
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class ActionType(enum.Enum):
    next_scene = 0

class Action(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    scene_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scene.id'), unique=False, nullable=False)
    type = db.Column(db.Enum(ActionType), nullable=False)
    payload = db.Column(db.String(128), nullable=True)
    label = db.Column(db.Text, nullable=True)
    scenario_scene_link = db.relation('ScenarioSceneLink', primaryjoin="ScenarioSceneLink.action_id == Action.id", cascade="delete, all", lazy=True)