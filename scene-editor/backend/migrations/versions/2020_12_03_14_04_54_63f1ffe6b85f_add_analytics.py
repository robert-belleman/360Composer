"""add analytics

Revision ID: 63f1ffe6b85f
Revises: e8704df952eb
Create Date: 2020-12-03 14:04:54.860448

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM


# revision identifiers, used by Alembic.
revision = '63f1ffe6b85f'
down_revision = 'e8704df952eb'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('customer',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('access_code', sa.String(128), nullable=False),
        sa.Column('name', sa.String(128), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('customer_timeline',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('timeline_id', UUID(), nullable=False),
        sa.Column('customer_id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['timeline_id'], ['timeline.id']),
        sa.ForeignKeyConstraint(['customer_id'], ['customer.id']),
    )

    op.create_table('analytics',
        sa.Column('id', sa.Integer, nullable=False, auto_increment=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('timeline_id', UUID(), nullable=False),
        sa.Column('timeline_scenario_id', UUID(), nullable=False),
        sa.Column('scenario_scene_id', UUID(), nullable=False),
        sa.Column('customer_id', UUID(), nullable=False),
        sa.Column('action_id', UUID(), nullable=True),
        sa.Column('type', sa.String(128), nullable=False),
        sa.Column('payload', sa.String(128), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['timeline_id'], ['timeline.id']),
        sa.ForeignKeyConstraint(['timeline_scenario_id'], ['timeline_scenario.id']),
        sa.ForeignKeyConstraint(['scenario_scene_id'], ['scenario_scene.id']),
        sa.ForeignKeyConstraint(['customer_id'], ['customer.id']),
        sa.ForeignKeyConstraint(['action_id'], ['action.id']),
    )


def downgrade():
    op.drop_table('customer')
    op.drop_table('customer_timeline')
    op.drop_table('analytics')
