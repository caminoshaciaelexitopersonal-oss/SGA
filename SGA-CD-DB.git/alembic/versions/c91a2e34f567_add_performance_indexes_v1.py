"""add_performance_indexes_v1

Revision ID: c91a2e34f567
Revises: 36f3d0a15892
Create Date: 2025-05-18 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c91a2e34f567'
down_revision = '36f3d0a15892'
branch_labels = None
depends_on = None


def upgrade():
    # Performance indexes for tenant isolation & foreign key queries
    op.create_index('ix_usuarios_inquilino_id', 'usuarios', ['inquilino_id'], unique=False, if_not_exists=True)
    op.create_index('ix_alumnos_inquilino_id', 'alumnos', ['inquilino_id'], unique=False, if_not_exists=True)
    op.create_index('ix_alumnos_usuario_id', 'alumnos', ['usuario_id'], unique=False, if_not_exists=True)
    op.create_index('ix_mallas_inquilino_id', 'mallas_curriculares', ['inquilino_id'], unique=False, if_not_exists=True)
    op.create_index('ix_asignaturas_inquilino_id', 'asignaturas', ['inquilino_id'], unique=False, if_not_exists=True)
    op.create_index('ix_elementos_inquilino_estado', 'elementos', ['inquilino_id', 'estado'], unique=False, if_not_exists=True)
    op.create_index('ix_prestamos_inquilino_estado', 'prestamos', ['inquilino_id', 'estado'], unique=False, if_not_exists=True)
    op.create_index('ix_inscripciones_inquilino_alumno', 'inscripciones', ['inquilino_id', 'alumno_id'], unique=False, if_not_exists=True)
    op.create_index('ix_asistencias_inquilino_clase', 'asistencias', ['inquilino_id', 'clase_id'], unique=False, if_not_exists=True)
    op.create_index('ix_notificaciones_inquilino_usuario', 'notificaciones', ['inquilino_id', 'usuario_id', 'leida'], unique=False, if_not_exists=True)


def downgrade():
    op.drop_index('ix_notificaciones_inquilino_usuario', table_name='notificaciones', if_exists=True)
    op.drop_index('ix_asistencias_inquilino_clase', table_name='asistencias', if_exists=True)
    op.drop_index('ix_inscripciones_inquilino_alumno', table_name='inscripciones', if_exists=True)
    op.drop_index('ix_prestamos_inquilino_estado', table_name='prestamos', if_exists=True)
    op.drop_index('ix_elementos_inquilino_estado', table_name='elementos', if_exists=True)
    op.drop_index('ix_asignaturas_inquilino_id', table_name='asignaturas', if_exists=True)
    op.drop_index('ix_mallas_inquilino_id', table_name='mallas_curriculares', if_exists=True)
    op.drop_index('ix_alumnos_usuario_id', table_name='alumnos', if_exists=True)
    op.drop_index('ix_alumnos_inquilino_id', table_name='alumnos', if_exists=True)
    op.drop_index('ix_usuarios_inquilino_id', table_name='usuarios', if_exists=True)
