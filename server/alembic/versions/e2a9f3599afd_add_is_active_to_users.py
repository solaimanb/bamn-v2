"""add_is_active_to_users

Revision ID: e2a9f3599afd
Revises: ba0eaa936a29
Create Date: 2025-07-06 22:58:13.481762

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2a9f3599afd'
down_revision: Union[str, None] = 'ba0eaa936a29'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
