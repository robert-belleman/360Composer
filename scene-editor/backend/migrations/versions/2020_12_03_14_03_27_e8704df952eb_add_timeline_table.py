"""add timeline table

Revision ID: e8704df952eb
Revises: a971e764960f
Create Date: 2020-12-03 14:03:27.013735

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = 'e8704df952eb'
down_revision = 'a971e764960f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('timeline',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('project_id', UUID(), nullable=False),
        sa.Column('name', sa.String(128)),
        sa.Column('description', sa.String(128)),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
        sa.Column('deleted_at', sa.DateTime()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['project.id']),
    )

    op.create_table('timeline_scenario',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('timeline_id', UUID(), nullable=False),
        sa.Column('scenario_id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['timeline_id'], ['timeline.id']),
        sa.ForeignKeyConstraint(['scenario_id'], ['scenario.id']),
    )

def downgrade():
    op.drop_table('timeline')
    op.drop_table('timeline_scenario')
