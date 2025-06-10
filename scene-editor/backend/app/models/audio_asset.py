import uuid
import enum
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID


class AudioAsset(db.Model):
    scenario_id = db.Column(UUID(as_uuid=True), primary_key=True)
    customer_id = db.Column(UUID(as_uuid=True), primary_key=True)

    tag = db.Column(db.String(128), primary_key=True)
    path = db.Column(db.String(128))
