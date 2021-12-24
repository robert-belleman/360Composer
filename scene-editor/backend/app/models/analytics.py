import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Analytics(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
    
    timeline_id = db.Column(UUID(as_uuid=True), db.ForeignKey("timeline.id"), unique=False, nullable=False)
    timeline_scenario_id = db.Column(UUID(as_uuid=True), db.ForeignKey("timeline_scenario.id"), unique=False, nullable=False)
    scenario_scene_id = db.Column(UUID(as_uuid=True), db.ForeignKey("scenario_scene.id"), unique=False, nullable=False)
    customer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('customer.id'), unique=False, nullable=False)
    action_id = db.Column(UUID(as_uuid=True), db.ForeignKey("action.id"), unique=False, nullable=True)

    type = db.Column(db.String(128), nullable=False)
    payload = db.Column(db.String(128), nullable=True)

class LegacyAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
    
    customer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('customer.id'), nullable=False)
    category = db.Column(db.Text, nullable=False)
    action = db.Column(db.Text, nullable=False)
    label = db.Column(db.Text, nullable=False)
    value = db.Column(db.Text, nullable=False)
    timeline_id = db.Column(UUID(as_uuid=True), nullable=True)
    scenario_id = db.Column(UUID(as_uuid=True), nullable=True)
    scene_id = db.Column(UUID(as_uuid=True), nullable=True)