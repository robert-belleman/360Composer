import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Option(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    annotation_id = db.Column(UUID(as_uuid=True), db.ForeignKey("annotation.id"), unique=False, nullable=False) # UUID of the annotation that this option is connected to
    action_id = db.Column(UUID(as_uuid=True), db.ForeignKey('action.id'), unique=False, nullable=True) # UUID of the action that this option is connected to

    text = db.Column(db.Text)
    feedback = db.Column(db.Text)

    action = db.relationship("Action", primaryjoin="Option.action_id == Action.id", cascade="all, delete", lazy=True)