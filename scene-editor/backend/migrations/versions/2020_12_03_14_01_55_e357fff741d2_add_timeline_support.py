"""add timeline support

Revision ID: e357fff741d2
Revises: 0f03d2b20fc4
Create Date: 2020-12-03 14:01:55.514759

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM


# revision identifiers, used by Alembic.
revision = 'e357fff741d2'
down_revision = '0f03d2b20fc4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('scene', sa.Column('video_id', UUID(), nullable=True))
    op.create_foreign_key(constraint_name='scene_video', source_table='scene', referent_table='asset', local_cols=['video_id'], remote_cols=['id'])

    op.add_column('asset', sa.Column('duration', sa.Integer))
    op.add_column('asset', sa.Column('file_size', sa.Integer))

    op.create_table('action',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('scene_id', UUID(), nullable=False),
        sa.Column('type', sa.Enum('next_scene', name='type'), nullable=False),
        sa.Column('payload', sa.String(128)),
        sa.Column('label', sa.Text()),
        sa.ForeignKeyConstraint(['scene_id'], ['scene.id']),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('annotation',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('scene_id', UUID(), nullable=False),
        sa.Column('text', sa.Text()),
        sa.Column('timestamp', sa.Float),
        sa.ForeignKeyConstraint(['scene_id'], ['scene.id']),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('option',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('annotation_id', UUID(), nullable=False),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('action_id', UUID(), nullable=False),
        sa.ForeignKeyConstraint(['annotation_id'], ['annotation.id']),
        sa.ForeignKeyConstraint(['action_id'], ['action.id']),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_column('scene', 'video_id')

    op.drop_column('asset', 'duration')
    op.drop_column('asset', 'file_size')

    op.drop_table('action')
    op.drop_table('annotation')
    op.drop_table('option')
