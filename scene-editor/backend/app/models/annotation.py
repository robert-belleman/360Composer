import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Annotation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    scene_id = db.Column(UUID(as_uuid=True), db.ForeignKey("scene.id"), unique=False, nullable=False) # UUID of the scene that this annotation is connected to

    text = db.Column(db.Text)
    timestamp = db.Column(db.Integer)
    type = db.Column(db.Integer)
    options = db.relationship('Option', primaryjoin="Option.annotation_id == Annotation.id", cascade="all", lazy=True)
