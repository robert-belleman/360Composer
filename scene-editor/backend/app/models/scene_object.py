import uuid
from sqlalchemy.dialects.postgresql import UUID

from app.models.database import db
from app.models.scene import Scene
from app.models.asset import Asset


class SceneObject(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    scene_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Scene.id), unique=False, nullable=False, ) # UUID of user that created the scene
    asset_id = db.Column(UUID(as_uuid=True), db.ForeignKey(Asset.id), unique=False, nullable=False) # UUID of the project this scene belongs to
    
    # position
    x_pos = db.Column(db.Float, default=0.0)
    y_pos = db.Column(db.Float, default=0.0)
    z_pos = db.Column(db.Float, default=0.0)

    # scale
    x_scale = db.Column(db.Float, default=1.0)
    y_scale = db.Column(db.Float, default=1.0)
    z_scale = db.Column(db.Float, default=1.0)

    # rotation
    x_rotation = db.Column(db.Float, default=0.0)
    y_rotation = db.Column(db.Float, default=0.0)
    z_rotation = db.Column(db.Float, default=0.0)
    w_rotation = db.Column(db.Float, default=0.0)

    asset = db.relationship('Asset', lazy=True)


