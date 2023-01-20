"""add_legacy_analytics

Revision ID: 045a166ec2fb
Revises: 9f6fe83f230c
Create Date: 2020-12-29 13:04:52.718908

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = '045a166ec2fb'
down_revision = '9f6fe83f230c'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('legacy_analytics',
        sa.Column('id', sa.Integer, nullable=False, autoincrement=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('customer_id', UUID(), nullable=False),
        sa.Column('category', sa.Text(), nullable=False),
        sa.Column('action', sa.Text(), nullable=False),
        sa.Column('label', sa.Text(), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('timeline_id', UUID(), nullable=True),
        sa.Column('scenario_id', UUID(), nullable=True),
        sa.Column('scene_id', UUID(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['customer_id'], ['customer.id']),
        sa.ForeignKeyConstraint(['timeline_id'], ['timeline.id']),
        sa.ForeignKeyConstraint(['scenario_id'], ['timeline_scenario.id']),
        sa.ForeignKeyConstraint(['scene_id'], ['scenario_scene.id'])
    )

def downgrade():
    op.drop_table('legacy_analytics')
