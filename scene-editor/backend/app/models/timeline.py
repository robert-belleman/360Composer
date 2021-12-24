import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class Timeline(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    project_id = db.Column(UUID(as_uuid=True), db.ForeignKey("project.id"), unique=False, nullable=False) # UUID of the related project

    name = db.Column(db.String(128))
    description = db.Column(db.String(128))
    randomized = db.Column(db.Boolean)

    start = db.Column(UUID(as_uuid=True), db.ForeignKey("timeline_scenario.id", ondelete="SET NULL"), unique=False, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    deleted_at = db.Column(db.DateTime, nullable=True)

    timeline_scenarios = db.relationship("TimelineScenario", foreign_keys="TimelineScenario.timeline_id", cascade="all, delete")
    timeline_customers = db.relationship("CustomerTimeline", foreign_keys="CustomerTimeline.timeline_id", cascade="all, delete")

class TimelineScenario(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    timeline_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Timeline.id, ondelete="CASCADE"), unique=False, nullable=False)
    scenario_id = db.Column(UUID(as_uuid=True), db.ForeignKey("scenario.id", ondelete="CASCADE"), unique=False, nullable=False)
    next_scenario = db.Column(UUID(as_uuid=True), db.ForeignKey('timeline_scenario.id', ondelete="SET NULL"), unique=False, nullable=True)
    scenario = db.relationship("Scenario", foreign_keys=[scenario_id])

    linking_scenarios = db.relationship("TimelineScenario", remote_side=next_scenario, foreign_keys="TimelineScenario.next_scenario")    
    timeline_start = db.relationship("Timeline", primaryjoin="Timeline.start == TimelineScenario.id", foreign_keys="Timeline.start", lazy=True, post_update=True)

class CustomerTimeline(db.Model):
    __tablename__ = "customer_timeline"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    timeline_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Timeline.id), unique=False, nullable=False)
    customer_id = db.Column(UUID(as_uuid=True), db.ForeignKey("customer.id", ondelete="CASCADE"), unique=False, nullable=False)
    customer = db.relationship("Customer", foreign_keys=[customer_id])