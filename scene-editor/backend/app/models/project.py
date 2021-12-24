import uuid
from datetime import datetime

from app.models.database import db
from app.models.project_asset import project_asset
from sqlalchemy.dialects.postgresql import UUID

class Project(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("user.id"), nullable=False) # UUID of user that created the scene
    
    # project metadata
    name = db.Column(db.String(128))

    assets = db.relationship('Asset', secondary=project_asset, lazy='subquery',
        backref=db.backref('projects', lazy=True))

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    deleted_at = db.Column(db.DateTime, nullable=True)
