"""add_timeline_start_column

Revision ID: 86ca124deb18
Revises: 045a166ec2fb
Create Date: 2021-01-05 10:18:21.514166

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '86ca124deb18'
down_revision = '045a166ec2fb'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('timeline', sa.Column('start', UUID(), sa.ForeignKey('timeline_scenario.id'), nullable=True),)

def downgrade():
    op.drop_column('timeline', 'start')
