"""Automatic migrate with flask-migrate, might contain non-desirable changes

Revision ID: e75fe46e7d4d
Revises: d17a617894fb
Create Date: 2021-12-24 15:30:44.620321

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e75fe46e7d4d'
down_revision = 'd17a617894fb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, 'action', ['id'])
    op.create_unique_constraint(None, 'analytics', ['id'])
    op.drop_constraint('analytics_timeline_scenario_id_fkey', 'analytics', type_='foreignkey')
    op.drop_constraint('analytics_action_id_fkey', 'analytics', type_='foreignkey')
    op.drop_constraint('analytics_scenario_scene_id_fkey', 'analytics', type_='foreignkey')
    op.drop_constraint('analytics_timeline_id_fkey', 'analytics', type_='foreignkey')
    op.alter_column('annotation', 'type',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.create_unique_constraint(None, 'annotation', ['id'])
    op.drop_constraint('annotation_type_id_fkey', 'annotation', type_='foreignkey')
    op.create_unique_constraint(None, 'annotation_type', ['id'])
    op.create_unique_constraint(None, 'asset', ['id'])
    op.drop_constraint('asset_user_id_fkey', 'asset', type_='foreignkey')
    op.drop_constraint('asset_project_id_fkey', 'asset', type_='foreignkey')
    op.alter_column('customer', 'tag',
               existing_type=sa.VARCHAR(length=256),
               nullable=True)
    op.alter_column('customer', 'access_code',
               existing_type=sa.VARCHAR(length=128),
               nullable=True)
    op.drop_constraint('customer_tag_key', 'customer', type_='unique')
    op.create_unique_constraint(None, 'customer', ['id'])
    op.drop_constraint('customer_therapist_id_fkey', 'customer', type_='foreignkey')
    op.create_unique_constraint(None, 'customer_timeline', ['id'])
    op.drop_constraint('customer_timeline_customer_id_fkey', 'customer_timeline', type_='foreignkey')
    op.create_foreign_key(None, 'customer_timeline', 'customer', ['customer_id'], ['id'], ondelete='CASCADE')
    op.create_unique_constraint(None, 'legacy_analytics', ['id'])
    op.alter_column('option', 'action_id',
               existing_type=postgresql.UUID(),
               nullable=True)
    op.create_unique_constraint(None, 'option', ['id'])
    op.create_unique_constraint(None, 'project', ['id'])
    op.alter_column('scenario', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False)
    op.alter_column('scenario', 'updated_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False)
    op.create_unique_constraint(None, 'scenario', ['id'])
    op.drop_constraint('scenario_project_id_fkey', 'scenario', type_='foreignkey')
    op.drop_constraint('scenario_start_scene_fkey', 'scenario', type_='foreignkey')
    op.create_foreign_key(None, 'scenario', 'scenario_scene', ['start_scene'], ['id'], ondelete='SET NULL')
    op.create_unique_constraint(None, 'scenario_scene', ['id'])
    op.drop_constraint('scenario_scene_scenario_id_fkey', 'scenario_scene', type_='foreignkey')
    op.create_unique_constraint(None, 'scenario_scene_link', ['id'])
    op.drop_constraint('scenario_scene_link_source_id_fkey', 'scenario_scene_link', type_='foreignkey')
    op.create_unique_constraint(None, 'scene', ['id'])
    op.drop_constraint('scene_user_id_fkey', 'scene', type_='foreignkey')
    op.drop_constraint('scene_video', 'scene', type_='foreignkey')
    op.drop_constraint('scene_project_id_fkey', 'scene', type_='foreignkey')
    op.create_foreign_key(None, 'scene', 'asset', ['video_id'], ['id'], ondelete='SET NULL')
    op.alter_column('scene_object', 'x_pos',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'y_pos',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'z_pos',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'x_scale',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'y_scale',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'z_scale',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'x_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'y_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'z_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.alter_column('scene_object', 'w_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=True)
    op.create_unique_constraint(None, 'scene_object', ['id'])
    op.alter_column('timeline', 'randomized',
               existing_type=sa.BOOLEAN(),
               nullable=True)
    op.alter_column('timeline', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False)
    op.alter_column('timeline', 'updated_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False)
    op.create_unique_constraint(None, 'timeline', ['id'])
    op.drop_constraint('timeline_project_id_fkey', 'timeline', type_='foreignkey')
    op.drop_constraint('timeline_start_fkey', 'timeline', type_='foreignkey')
    op.create_foreign_key(None, 'timeline', 'timeline_scenario', ['start'], ['id'], ondelete='SET NULL')
    op.create_unique_constraint(None, 'timeline_scenario', ['id'])
    op.drop_constraint('timeline_scenario_timeline_id_fkey', 'timeline_scenario', type_='foreignkey')
    op.drop_constraint('timeline_scenario_next_scenario_fkey', 'timeline_scenario', type_='foreignkey')
    op.drop_constraint('timeline_scenario_scenario_id_fkey', 'timeline_scenario', type_='foreignkey')
    op.create_foreign_key(None, 'timeline_scenario', 'timeline_scenario', ['next_scenario'], ['id'], ondelete='SET NULL')
    op.create_foreign_key(None, 'timeline_scenario', 'timeline', ['timeline_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'timeline_scenario', 'scenario', ['scenario_id'], ['id'], ondelete='CASCADE')
    op.alter_column('user', 'username',
               existing_type=sa.VARCHAR(length=128),
               nullable=True)
    op.alter_column('user', 'password',
               existing_type=sa.VARCHAR(length=256),
               nullable=True)
    op.create_unique_constraint(None, 'user', ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'user', type_='unique')
    op.alter_column('user', 'password',
               existing_type=sa.VARCHAR(length=256),
               nullable=False)
    op.alter_column('user', 'username',
               existing_type=sa.VARCHAR(length=128),
               nullable=False)
    op.drop_constraint(None, 'timeline_scenario', type_='foreignkey')
    op.drop_constraint(None, 'timeline_scenario', type_='foreignkey')
    op.drop_constraint(None, 'timeline_scenario', type_='foreignkey')
    op.create_foreign_key('timeline_scenario_scenario_id_fkey', 'timeline_scenario', 'scenario', ['scenario_id'], ['id'])
    op.create_foreign_key('timeline_scenario_next_scenario_fkey', 'timeline_scenario', 'timeline_scenario', ['next_scenario'], ['id'])
    op.create_foreign_key('timeline_scenario_timeline_id_fkey', 'timeline_scenario', 'timeline', ['timeline_id'], ['id'])
    op.drop_constraint(None, 'timeline_scenario', type_='unique')
    op.drop_constraint(None, 'timeline', type_='foreignkey')
    op.create_foreign_key('timeline_start_fkey', 'timeline', 'timeline_scenario', ['start'], ['id'])
    op.create_foreign_key('timeline_project_id_fkey', 'timeline', 'project', ['project_id'], ['id'])
    op.drop_constraint(None, 'timeline', type_='unique')
    op.alter_column('timeline', 'updated_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)
    op.alter_column('timeline', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)
    op.alter_column('timeline', 'randomized',
               existing_type=sa.BOOLEAN(),
               nullable=False)
    op.drop_constraint(None, 'scene_object', type_='unique')
    op.alter_column('scene_object', 'w_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'z_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'y_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'x_rotation',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'z_scale',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'y_scale',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'x_scale',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'z_pos',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'y_pos',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.alter_column('scene_object', 'x_pos',
               existing_type=postgresql.DOUBLE_PRECISION(precision=53),
               nullable=False)
    op.drop_constraint(None, 'scene', type_='foreignkey')
    op.create_foreign_key('scene_project_id_fkey', 'scene', 'project', ['project_id'], ['id'])
    op.create_foreign_key('scene_video', 'scene', 'asset', ['video_id'], ['id'])
    op.create_foreign_key('scene_user_id_fkey', 'scene', 'user', ['user_id'], ['id'])
    op.drop_constraint(None, 'scene', type_='unique')
    op.create_foreign_key('scenario_scene_link_source_id_fkey', 'scenario_scene_link', 'scenario_scene', ['source_id'], ['id'])
    op.drop_constraint(None, 'scenario_scene_link', type_='unique')
    op.create_foreign_key('scenario_scene_scenario_id_fkey', 'scenario_scene', 'scenario', ['scenario_id'], ['id'])
    op.drop_constraint(None, 'scenario_scene', type_='unique')
    op.drop_constraint(None, 'scenario', type_='foreignkey')
    op.create_foreign_key('scenario_start_scene_fkey', 'scenario', 'scenario_scene', ['start_scene'], ['id'])
    op.create_foreign_key('scenario_project_id_fkey', 'scenario', 'project', ['project_id'], ['id'])
    op.drop_constraint(None, 'scenario', type_='unique')
    op.alter_column('scenario', 'updated_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)
    op.alter_column('scenario', 'created_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)
    op.drop_constraint(None, 'project', type_='unique')
    op.drop_constraint(None, 'option', type_='unique')
    op.alter_column('option', 'action_id',
               existing_type=postgresql.UUID(),
               nullable=False)
    op.drop_constraint(None, 'legacy_analytics', type_='unique')
    op.drop_constraint(None, 'customer_timeline', type_='foreignkey')
    op.create_foreign_key('customer_timeline_customer_id_fkey', 'customer_timeline', 'customer', ['customer_id'], ['id'])
    op.drop_constraint(None, 'customer_timeline', type_='unique')
    op.create_foreign_key('customer_therapist_id_fkey', 'customer', 'user', ['therapist_id'], ['id'])
    op.drop_constraint(None, 'customer', type_='unique')
    op.create_unique_constraint('customer_tag_key', 'customer', ['tag'])
    op.alter_column('customer', 'access_code',
               existing_type=sa.VARCHAR(length=128),
               nullable=False)
    op.alter_column('customer', 'tag',
               existing_type=sa.VARCHAR(length=256),
               nullable=False)
    op.create_foreign_key('asset_project_id_fkey', 'asset', 'project', ['project_id'], ['id'])
    op.create_foreign_key('asset_user_id_fkey', 'asset', 'user', ['user_id'], ['id'])
    op.drop_constraint(None, 'asset', type_='unique')
    op.drop_constraint(None, 'annotation_type', type_='unique')
    op.create_foreign_key('annotation_type_id_fkey', 'annotation', 'annotation_type', ['type'], ['id'])
    op.drop_constraint(None, 'annotation', type_='unique')
    op.alter_column('annotation', 'type',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.create_foreign_key('analytics_timeline_id_fkey', 'analytics', 'timeline', ['timeline_id'], ['id'])
    op.create_foreign_key('analytics_scenario_scene_id_fkey', 'analytics', 'scenario_scene', ['scenario_scene_id'], ['id'])
    op.create_foreign_key('analytics_action_id_fkey', 'analytics', 'action', ['action_id'], ['id'])
    op.create_foreign_key('analytics_timeline_scenario_id_fkey', 'analytics', 'timeline_scenario', ['timeline_scenario_id'], ['id'])
    op.drop_constraint(None, 'analytics', type_='unique')
    op.drop_constraint(None, 'action', type_='unique')
    # ### end Alembic commands ###