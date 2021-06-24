from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class CustomerAnnotation(db.Model):
    customer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('customer.id'), primary_key=True, unique=False, nullable=False)
    annotation_id = db.Column(UUID(as_uuid=True), db.ForeignKey("annotation.id"), primary_key=True, unique=False, nullable=False)
