"""remove usertest

Revision ID: 12158b7272f5
Revises: fd2d04c14e7e
Create Date: 2023-04-03 13:11:41.588218

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '12158b7272f5'
down_revision = 'fd2d04c14e7e'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('user_test')


def downgrade():
    pass
