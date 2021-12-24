from app.models.database import db
from sqlalchemy.dialects.postgresql import UUID

project_asset = db.Table('project_asset',
    db.Column('project_id', UUID(as_uuid=True), db.ForeignKey('project.id'), primary_key=True),
    db.Column('asset_id', UUID(as_uuid=True), db.ForeignKey('asset.id'), primary_key=True)
)