"""Added all missing foreign keys

Revision ID: c2190c23e6a9
Revises: e75fe46e7d4d
Create Date: 2021-12-24 16:33:25.166750

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c2190c23e6a9'
down_revision = 'e75fe46e7d4d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_foreign_key(None, 'analytics', 'scenario_scene', ['scenario_scene_id'], ['id'])
    op.create_foreign_key(None, 'analytics', 'action', ['action_id'], ['id'])
    op.create_foreign_key(None, 'analytics', 'timeline', ['timeline_id'], ['id'])
    op.create_foreign_key(None, 'analytics', 'timeline_scenario', ['timeline_scenario_id'], ['id'])
    op.create_foreign_key(None, 'asset', 'user', ['user_id'], ['id'])
    op.create_foreign_key(None, 'asset', 'project', ['project_id'], ['id'])
    op.create_foreign_key(None, 'scenario', 'project', ['project_id'], ['id'])
    op.create_foreign_key(None, 'scenario_scene', 'scenario', ['scenario_id'], ['id'])
    op.create_foreign_key(None, 'scenario_scene_link', 'scenario_scene', ['source_id'], ['id'])
    op.create_foreign_key(None, 'scene', 'project', ['project_id'], ['id'])
    op.create_foreign_key(None, 'scene', 'user', ['user_id'], ['id'])
    op.create_foreign_key(None, 'timeline', 'project', ['project_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'timeline', type_='foreignkey')
    op.drop_constraint(None, 'scene', type_='foreignkey')
    op.drop_constraint(None, 'scene', type_='foreignkey')
    op.drop_constraint(None, 'scenario_scene_link', type_='foreignkey')
    op.drop_constraint(None, 'scenario_scene', type_='foreignkey')
    op.drop_constraint(None, 'scenario', type_='foreignkey')
    op.drop_constraint(None, 'asset', type_='foreignkey')
    op.drop_constraint(None, 'asset', type_='foreignkey')
    op.drop_constraint(None, 'analytics', type_='foreignkey')
    op.drop_constraint(None, 'analytics', type_='foreignkey')
    op.drop_constraint(None, 'analytics', type_='foreignkey')
    op.drop_constraint(None, 'analytics', type_='foreignkey')
    # ### end Alembic commands ###
