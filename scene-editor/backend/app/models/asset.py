import uuid
import enum
from datetime import datetime

class AssetType(enum.Enum):
    video = 0
    model = 1

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Asset(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("user.id"), unique=False, nullable=False) # UUID of user that created the scene
    project_id = db.Column(UUID(as_uuid=True), db.ForeignKey("project.id"), unique=False, nullable=False) # UUID of the project this scene belongs to
    
    # Asset metadata
    name = db.Column(db.String(128))
    path = db.Column(db.String(128))
    thumbnail_path = db.Column(db.String(128))

    duration = db.Column(db.Integer)
    file_size = db.Column(db.Integer)

    asset_type = db.Column(db.Enum(AssetType), nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now,
                           onupdate=datetime.now)
    deleted_at = db.Column(db.DateTime, nullable=True)

    scene = db.relationship('Scene', primaryjoin="Asset.id == Scene.video_id", foreign_keys='Scene.video_id', lazy=True)