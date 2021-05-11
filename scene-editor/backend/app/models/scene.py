import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Scene(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = db.Column(UUID(as_uuid=True), unique=False, nullable=False) # UUID of user that created the scene
    project_id = db.Column(UUID(as_uuid=True), unique=False, nullable=False) # UUID of the project this scene belongs to
    
    video_id = db.Column(UUID(as_uuid=True), db.ForeignKey('asset.id', ondelete="SET NULL"), unique=False, nullable=True)

    # scene metadata
    name = db.Column(db.String(128))
    description = db.Column(db.Text)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now,
                           onupdate=datetime.now)
    deleted_at = db.Column(db.DateTime, nullable=True)

    action = db.relationship('Action', primaryjoin="Scene.id == Action.scene_id", foreign_keys='Action.scene_id', lazy=True)
    annotations = db.relationship('Annotation', primaryjoin="Scene.id == Annotation.scene_id", foreign_keys='Annotation.scene_id', lazy=True, cascade="all")
    scene_objects = db.relationship('SceneObject', primaryjoin="Scene.id == SceneObject.scene_id", foreign_keys='SceneObject.scene_id', lazy=True, cascade="all")
    scenario_scene = db.relationship('ScenarioScene', primaryjoin="Scene.id == ScenarioScene.scene_id", foreign_keys='ScenarioScene.scene_id', lazy=True, cascade="all") 
