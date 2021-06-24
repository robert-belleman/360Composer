"""add column 'type' to annotations

Revision ID: 2d57eded2086
Revises: b02299e33bba
Create Date: 2021-04-30 16:39:30.167156

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d57eded2086'
down_revision = 'b02299e33bba'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('annotation', sa.Column('type', sa.Integer, nullable=False))

def downgrade():
    op.drop_column('annotation', 'type')
