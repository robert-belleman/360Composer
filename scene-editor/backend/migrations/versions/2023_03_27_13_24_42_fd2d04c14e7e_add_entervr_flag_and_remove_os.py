"""add entervr flag and remove os

Revision ID: fd2d04c14e7e
Revises: 0653eb39354b
Create Date: 2023-03-27 13:24:42.932621

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fd2d04c14e7e'
down_revision = '0653eb39354b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user_test', sa.Column('enteredVR', sa.Boolean))


def downgrade():
    op.drop_column('user_test', 'os')
