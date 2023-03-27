import uuid
from datetime import datetime

from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

class UserTest(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    
    device = db.Column(db.String(128))
    browser = db.Column(db.String(128))
    hmd = db.Column(db.String(128))
    
    enteredVR = db.Column(db.Boolean)
    workedbaboon = db.Column(db.Boolean)
    workedtopbottom = db.Column(db.Boolean)
    workedsidebyside = db.Column(db.Boolean)
    commentsaframe = db.Column(db.String(1024))

    detectedbrowsername = db.Column(db.String(128))
    detectedbrowserversion = db.Column(db.String(128))
    detectedosname = db.Column(db.String(128))
    detectedosversion = db.Column(db.String(128))
    detectedmobilevendor = db.Column(db.String(128))
    detectedmobilemodel = db.Column(db.String(128))

    submitted_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
