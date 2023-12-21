"""Added resolution column to assets

Revision ID: 0163e785e4f8
Revises: ee20d01f1dd6
Create Date: 2023-12-21 17:20:06.223380

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0163e785e4f8'
down_revision = 'ee20d01f1dd6'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('asset', sa.Column('width', sa.Integer))
    op.add_column('asset', sa.Column('height', sa.Integer))


def downgrade():
    op.drop_column('asset', 'width')
    op.drop_column('asset', 'height')
