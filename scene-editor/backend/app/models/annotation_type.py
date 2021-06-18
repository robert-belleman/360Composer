from app.models.database import db

class AnnotationType(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
    text = db.Column(db.Text, nullable=False)
