import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class UserTest(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    
    device = db.Column(db.String(128))
    os = db.Column(db.String(128))
    workedbaby = db.Column(db.Boolean)
    commentsbaby = db.Column(db.String(1024))
    workedaframe = db.Column(db.Boolean)
    commentsaframe = db.Column(db.String(1024))

    submitted_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
