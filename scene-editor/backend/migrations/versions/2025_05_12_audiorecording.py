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
    op.create_table('audio_asset',
        # sa.Column('id', UUID(), nullable=False),
        sa.Column('scenario_id', UUID(), nullable=False),
        sa.Column('customer_id', UUID(), nullable=False),
        sa.Column('tag', sa.String(128), nullable=False),
        sa.Column('path', sa.String(128), nullable=False),
        sa.PrimaryKeyConstraint('scenario_id', 'customer_id', 'tag'),
        # sa.ForeignKeyConstraint(['customer_id'], ['customer.id']),
        # sa.ForeignKeyConstraint(['scenario_id'], ['scenario.id']),
    )

    # add the tag parameter to the scene so the audio can be stored and
    # retrieved properly
    op.add_column('annotation', sa.Column('tag', sa.Text, nullable=False, server_default=""))


    # add the audio recording annotation types
    op.execute("INSERT INTO annotation_type(id, text) VALUES (4, 'Geluidsopname')")
    op.execute("INSERT INTO annotation_type(id, text) VALUES (5, 'Geluidsplayback')")

    op.create_foreign_key(constraint_name='annotation_type_id_fkey', source_table='annotation', referent_table='annotation_type', local_cols=['type'], remote_cols=['id'])


def downgrade():
    op.drop_table('playback_type')
    op.drop_table('audio_asset')
