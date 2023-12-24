"""added projection format to asset table

Revision ID: 56cd474d3e95
Revises: 0163e785e4f8
Create Date: 2023-12-24 12:52:11.130413

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "56cd474d3e95"
down_revision = "0163e785e4f8"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("asset", sa.Column("projection_format", sa.String(128), server_default=""))


def downgrade():
    op.drop_column("asset", "projection_format")
