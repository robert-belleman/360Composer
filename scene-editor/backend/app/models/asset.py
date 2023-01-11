import uuid
import enum
from datetime import datetime

class AssetType(enum.Enum):
    video = 0
    model = 1

class ViewType(enum.Enum):
    mono = 0
    sidetoside = 1
    toptobottom = 2

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Asset(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("user.id"), unique=False, nullable=False) # UUID of user that created the scene
    
    # Asset metadata

    name = db.Column(db.String(128))
    path = db.Column(db.String(128))
    thumbnail_path = db.Column(db.String(128))

    # TODO change frames and fps to correct types
    frames = db.Column(db.Integer)
    fps = db.Column(db.Float)

    duration = db.Column(db.Integer)
    file_size = db.Column(db.Integer)

    asset_type = db.Column(db.Enum(AssetType), nullable=False)
    view_type = db.Column(db.Enum(ViewType), nullable=False, default=ViewType.mono)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now,
                           onupdate=datetime.now)
    deleted_at = db.Column(db.DateTime, nullable=True)

    scene = db.relationship('Scene', primaryjoin="Asset.id == Scene.video_id", foreign_keys='Scene.video_id', lazy=True)