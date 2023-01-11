"""initial revision

Revision ID: 0f03d2b20fc4
Revises: 
Create Date: 2020-12-03 13:22:19.827504

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects import postgresql 


# revision identifiers, used by Alembic.
revision = '0f03d2b20fc4'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('user',
        sa.Column('username', sa.String(length=128), nullable=False),
        sa.Column('password', sa.String(length=256), nullable=False),
        sa.Column('id', UUID(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('project',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('name', sa.String(128)),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('scene',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('project_id', UUID(), nullable=False),
        sa.Column('name', sa.String(128)),
        sa.Column('description', sa.Text()),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # asset_type = postgresql.ENUM('video', 'model', name='asset_type')
    # asset_type.create(op.get_bind())

    op.create_table('asset',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('project_id', UUID(), nullable=False),
        sa.Column('name', sa.String(128)),
        sa.Column('path', sa.String(128)),
        sa.Column('thumbnail_path', sa.String(128)),
        sa.Column('frames', sa.String(128)),
        sa.Column('fps', sa.String(128)),
        sa.Column('asset_type', sa.Enum('video', 'model', name='asset_type'), nullable=False, server_default='model'),
        sa.Column('view_type', sa.Enum('mono', 'sidetoside', 'toptobottom', name='view_type'), nullable=False, server_default='mono'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


    op.create_table('scene_object', 
        sa.Column('id', UUID(), nullable=False),
        sa.Column('scene_id', UUID(), nullable=False),
        sa.Column('asset_id', UUID(), nullable=False),
        sa.Column('x_pos', sa.Float(), nullable=False),
        sa.Column('y_pos', sa.Float(), nullable=False),
        sa.Column('z_pos', sa.Float(), nullable=False),
        sa.Column('x_rotation', sa.Float(), nullable=False),
        sa.Column('y_rotation', sa.Float(), nullable=False),
        sa.Column('z_rotation', sa.Float(), nullable=False),
        sa.Column('w_rotation', sa.Float(), nullable=False),
        sa.Column('x_scale', sa.Float(), nullable=False),
        sa.Column('y_scale', sa.Float(), nullable=False),
        sa.Column('z_scale', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['scene_id'], ['scene.id'], ),
        sa.ForeignKeyConstraint(['asset_id'], ['asset.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('user')
    op.drop_table('scene')
    op.drop_table('project')
    op.drop_table('asset')
    op.drop_table('scene_object')

    asset_type = postgresql.ENUM('video', 'model', name='asset_type')
    asset_type.drop(op.get_bind())
