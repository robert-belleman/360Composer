"""add scenario

Revision ID: a971e764960f
Revises: e357fff741d2
Create Date: 2020-12-03 14:02:46.261619

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM


# revision identifiers, used by Alembic.
revision = 'a971e764960f'
down_revision = 'e357fff741d2'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('scenario_scene',
        sa.Column('id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('scenario',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('project_id', UUID(), nullable=False),
        sa.Column('start_scene', UUID(), nullable=True),
        sa.Column('name', sa.String(128)),
        sa.Column('description', sa.String(128)),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
        sa.Column('deleted_at', sa.DateTime()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['project.id']),
        sa.ForeignKeyConstraint(['start_scene'], ['scenario_scene.id']),
    )

    op.create_table('scenario_scene_link',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('source_id', UUID(), nullable=False),
        sa.Column('action_id', UUID(), nullable=False),
        sa.Column('target_id', UUID(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['source_id'], ['scenario_scene.id']),
        sa.ForeignKeyConstraint(['action_id'], ['action.id']),
        sa.ForeignKeyConstraint(['target_id'], ['scenario_scene.id'])
    )

    op.add_column('scenario_scene', sa.Column('scenario_id', UUID(), sa.ForeignKey('scenario.id'), nullable=False))
    op.add_column('scenario_scene', sa.Column('scene_id', UUID(), sa.ForeignKey('scene.id'), nullable=False))
    op.add_column('scenario_scene', sa.Column('position_x', sa.Integer))
    op.add_column('scenario_scene', sa.Column('position_y', sa.Integer))

def downgrade():
    op.drop_table('scenario')
    op.drop_table('scenario_scene')
    op.drop_table('scenario_scene_link')
