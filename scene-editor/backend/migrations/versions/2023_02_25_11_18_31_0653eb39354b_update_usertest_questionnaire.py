"""update usertest questionnaire

Revision ID: 0653eb39354b
Revises: 9bde56981cf8
Create Date: 2023-02-25 11:18:31.222226

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0653eb39354b'
down_revision = '9bde56981cf8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user_test', sa.Column('browser', sa.String(128)))
    op.add_column('user_test', sa.Column('hmd', sa.String(128)))
    op.add_column('user_test', sa.Column('workedbaboon', sa.Boolean))
    op.add_column('user_test', sa.Column('workedtopbottom', sa.Boolean))
    op.add_column('user_test', sa.Column('workedsidebyside', sa.Boolean))
    op.add_column('user_test', sa.Column('detectedbrowsername', sa.String(128)))
    op.add_column('user_test', sa.Column('detectedbrowserversion', sa.String(128)))
    op.add_column('user_test', sa.Column('detectedosname', sa.String(128)))
    op.add_column('user_test', sa.Column('detectedosversion', sa.String(128)))
    op.add_column('user_test', sa.Column('detectedmobilevendor', sa.String(128)))
    op.add_column('user_test', sa.Column('detectedmobilemodel', sa.String(128)))


def downgrade():
    op.drop_column('user_test', 'workedbaby')
    op.drop_column('user_test', 'commentsbaby')
    op.drop_column('user_test', 'workedaframe')
