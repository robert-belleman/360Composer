"""remove_analytics_foreign_key_constraint

Revision ID: e8395a1f9862
Revises: 86ca124deb18
Create Date: 2021-01-06 13:42:41.010630

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e8395a1f9862'
down_revision = '86ca124deb18'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(u'legacy_analytics_timeline_id_fkey', 'legacy_analytics', type_='foreignkey')
    op.drop_constraint(u'legacy_analytics_scenario_id_fkey', 'legacy_analytics', type_='foreignkey')
    op.drop_constraint(u'legacy_analytics_scene_id_fkey', 'legacy_analytics', type_='foreignkey')

def downgrade():
    op.create_foreign_key(u'legacy_analytics_timeline_id_fkey', 'legacy_analytics', 'timeline', ['timeline_id'], ['id'])
    op.create_foreign_key(u'legacy_analytics_scenario_id_fkey', 'legacy_analytics', 'scenario', ['scenario_id'], ['id'])
    op.create_foreign_key(u'legacy_analytics_scene_id_fkey', 'legacy_analytics', 'scenee', ['scene_id'], ['id'])
