from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Customer(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    name = db.Column(db.String(128))
    tag = db.Column(db.String(256))
    access_code = db.Column(db.String(128))
    therapist_id = db.Column(UUID(as_uuid=True), nullable=False)
    customer_timeline = db.relationship('CustomerTimeline', cascade="delete, all", lazy=True)
    legacy_analytics = db.relationship("LegacyAnalytics", cascade="all, delete")