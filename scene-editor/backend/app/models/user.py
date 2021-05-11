from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    username = db.Column(db.String(128))
    password = db.Column(db.String(128))
