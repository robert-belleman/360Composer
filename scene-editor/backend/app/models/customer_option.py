from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class CustomerOption(db.Model):
    customer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('customer.id'), primary_key=True, unique=False, nullable=False)
    option_id = db.Column(UUID(as_uuid=True), db.ForeignKey("option.id"), primary_key=True, unique=False, nullable=False)
