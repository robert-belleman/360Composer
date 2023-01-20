"""nieuwe tabel voor enum annotation type

Revision ID: b26bb15312d0
Revises: 2d57eded2086
Create Date: 2021-06-17 16:26:43.228401

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql.schema import Constraint


# revision identifiers, used by Alembic.
revision = 'b26bb15312d0'
down_revision = '2d57eded2086'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('annotation_type',
        sa.Column('id', sa.Integer, nullable=False, autoincrement=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.execute("INSERT INTO annotation_type(id, text) VALUES (0, 'Tekst')")
    op.execute("INSERT INTO annotation_type(id, text) VALUES (1, 'Knikken/schudden')")
    op.execute("INSERT INTO annotation_type(id, text) VALUES (2, 'Blazen')")
    op.execute("INSERT INTO annotation_type(id, text) VALUES (3, 'Anders')")

    op.create_foreign_key(constraint_name='annotation_type_id_fkey', source_table='annotation', referent_table='annotation_type', local_cols=['type'], remote_cols=['id'])

def downgrade():
    op.drop_table('annotation_type')
