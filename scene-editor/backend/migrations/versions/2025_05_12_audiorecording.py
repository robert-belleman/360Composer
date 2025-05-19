"""nieuwe tabel voor enum annotation type

Revision ID: b26bb15312d1
Revises: 56cd474d3e95
Create Date: 2021-06-17 16:26:43.228401

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql.schema import Constraint
from sqlalchemy.dialects.postgresql import UUID, ENUM


# revision identifiers, used by Alembic.
revision = 'b26bb15312d1'
down_revision = '56cd474d3e95'
branch_labels = None
depends_on = None


def upgrade():
    # how the audio recordings are stored
    op.create_table('audio_recording',
        sa.Column('scenario', UUID(), nullable=False),
        sa.Column('tag', sa.Integer(), nullable=False),
        sa.Column('id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # op.create_table('audio_assets',
    #     sa.Column('id', sa.Integer, nullable=False),
    #     sa.Column('name', sa.Text(), nullable=False))

    # how to decide which audio recording to play
    op.create_table('playback_type',
        sa.Column('id', sa.Integer, nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.Integer, nullable=False),
        sa.PrimaryKeyConstraint('id'))

    op.execute("INSERT INTO playback_type(id, text) VALUES (0, 'recorded audio')")
    op.execute("INSERT INTO playback_type(id, text) VALUES (1, 'audio file')")

    # add the audio recording annotation types
    op.execute("INSERT INTO annotation_type(id, text) VALUES (4, 'Geluidsopname')")
    op.execute("INSERT INTO annotation_type(id, text) VALUES (5, 'Geluidsplayback')")

    op.create_foreign_key(constraint_name='annotation_type_id_fkey', source_table='annotation', referent_table='annotation_type', local_cols=['type'], remote_cols=['id'])


def downgrade():
    op.drop_table('playback_type')
    op.drop_table('audio_recording')
