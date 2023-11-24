"""added a hls_path column to assets to separate editing and streaming location

Revision ID: ee20d01f1dd6
Revises: 12158b7272f5
Create Date: 2023-11-24 16:22:13.973322

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ee20d01f1dd6'
down_revision = '12158b7272f5'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('asset', sa.Column('hls_path', sa.String(128), nullable=True))
    pass


def downgrade():
    op.drop_column('asset', 'hls_path')
    pass
