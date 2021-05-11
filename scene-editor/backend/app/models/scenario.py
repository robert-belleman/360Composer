import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID
from app.models.scene import Scene

class Scenario(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    project_id = db.Column(UUID(as_uuid=True), unique=False, nullable=False) # UUID of the related project
    
    # project metadata
    name = db.Column(db.String(128))
    description = db.Column(db.String(128))
    start_scene = db.Column(UUID(as_uuid=True), db.ForeignKey("scenario_scene.id", ondelete='SET NULL'), unique=False, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    deleted_at = db.Column(db.DateTime, nullable=True)
    scenes = db.relationship("ScenarioScene", primaryjoin="ScenarioScene.scenario_id == Scenario.id", foreign_keys="ScenarioScene.scenario_id", lazy=True)

class ScenarioScene(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    scenario_id = db.Column(UUID(as_uuid=True), unique=False, nullable=False) # UUID of the related scenario
    scene_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Scene.id), unique=False, nullable=False) # UUID of the related scene
    position_x = db.Column(db.Integer, default=0)
    position_y = db.Column(db.Integer, default=0)
    scene = db.relationship('Scene', lazy=True)
    actions = db.relationship("Action",
        primaryjoin="and_(ScenarioScene.scene_id == Action.scene_id, Action.type == 'next_scene')",
        foreign_keys="Action.scene_id",
        uselist=True,
        lazy=True,
        passive_deletes=True
    )
    links = db.relationship("ScenarioSceneLink",
        primaryjoin="ScenarioSceneLink.source_id == ScenarioScene.id",
        foreign_keys="ScenarioSceneLink.source_id",
        cascade="all, delete",
        order_by="desc(ScenarioSceneLink.id)"
    )
    target_links = db.relationship("ScenarioSceneLink",
        primaryjoin="ScenarioSceneLink.target_id == ScenarioScene.id",
        foreign_keys="ScenarioSceneLink.target_id",
        cascade="all, delete",
        order_by="desc(ScenarioSceneLink.id)"
    )
    start = db.relationship("Scenario", primaryjoin="ScenarioScene.id == Scenario.start_scene", foreign_keys="Scenario.start_scene", lazy=True)

class ScenarioSceneLink(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    source_id = db.Column(UUID(as_uuid=True), unique=False, nullable=False) # UUID of the related scenario
    target_id = db.Column(UUID(as_uuid=True), db.ForeignKey('scenario_scene.id'), unique=False, nullable=True) # UUID of the related scenario
    action_id = db.Column(UUID(as_uuid=True), db.ForeignKey('action.id'), unique=False, nullable=False) # UUID of the related scenario
