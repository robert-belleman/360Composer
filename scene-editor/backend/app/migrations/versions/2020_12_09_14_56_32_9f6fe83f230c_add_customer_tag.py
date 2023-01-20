"""add_customer_tag

Revision ID: 9f6fe83f230c
Revises: 63f1ffe6b85f
Create Date: 2020-12-09 14:56:32.978196

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '9f6fe83f230c'
down_revision = '63f1ffe6b85f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('customer', sa.Column('tag', sa.String(256), nullable=False, unique=True))

    # create default values for existing entries
    op.add_column('timeline', sa.Column('randomized', sa.Boolean(), nullable=True, default=False))
    op.execute("UPDATE timeline SET randomized = false")
    op.alter_column('timeline', 'randomized', nullable=False)

    op.add_column('timeline_scenario', sa.Column('next_scenario', UUID(), sa.ForeignKey('timeline_scenario.id'), nullable=True))


def downgrade():
    op.drop_column('customer', 'tag')
    
    op.drop_column('timeline', 'randomized')
    op.drop_column('timeline', 'start')

    op.drop_column('timeline_scenario', 'next_scenario')
