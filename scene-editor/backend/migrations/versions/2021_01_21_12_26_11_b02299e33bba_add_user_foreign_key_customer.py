"""add_user_foreign_key_customer

Revision ID: b02299e33bba
Revises: e8395a1f9862
Create Date: 2021-01-21 12:26:11.784358

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = 'b02299e33bba'
down_revision = 'e8395a1f9862'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('customer', sa.Column('therapist_id', UUID(), sa.ForeignKey('user.id'), nullable=False))

def downgrade():
    op.drop_column('customer', 'therapist_id')
