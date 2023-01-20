"""customer_options en customer_chosen toegevoegd

Revision ID: d17a617894fb
Revises: b26bb15312d0
Create Date: 2021-06-21 20:44:07.579213

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = 'd17a617894fb'
down_revision = 'b26bb15312d0'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('customer_annotation',
        sa.Column('customer_id', UUID(), nullable=False),
        sa.Column('annotation_id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('customer_id'),
        sa.ForeignKeyConstraint(['customer_id'], ['customer.id']),
        sa.ForeignKeyConstraint(['annotation_id'], ['annotation.id'])
    )

    op.create_table('customer_option',
        sa.Column('customer_id', UUID(), nullable=False),
        sa.Column('option_id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('customer_id'),
        sa.ForeignKeyConstraint(['customer_id'], ['customer.id']),
        sa.ForeignKeyConstraint(['option_id'], ['option.id'])
    )

def downgrade():
    op.drop_table('customer_annotation')
    op.drop_table('customer_option')
