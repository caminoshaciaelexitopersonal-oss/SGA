from sqlalchemy.orm import Session
from typing import List

from models.gamification import (
    GamificacionAccion, GamificacionPuntosLog, GamificacionMedalla, GamificacionMedallaObtenida
)
from app.schemas.gamification import (
    GamificacionAccionCreate, GamificacionPuntosLogCreate, GamificacionMedallaCreate
)

# --- CRUD for GamificacionAccion ---

def get_accion(db: Session, accion_id: int) -> GamificacionAccion | None:
    return db.query(GamificacionAccion).filter(GamificacionAccion.id == accion_id).first()

def get_acciones_by_tenant(
    db: Session, *, inquilino_id: int, skip: int = 0, limit: int = 100
) -> List[GamificacionAccion]:
    return (
        db.query(GamificacionAccion)
        .filter(GamificacionAccion.inquilino_id == inquilino_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_accion(db: Session, *, obj_in: GamificacionAccionCreate) -> GamificacionAccion:
    db_obj = GamificacionAccion(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# --- CRUD for GamificacionPuntosLog ---

def create_puntos_log(db: Session, *, obj_in: GamificacionPuntosLogCreate) -> GamificacionPuntosLog:
    db_obj = GamificacionPuntosLog(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# --- CRUD for GamificacionMedalla ---

def get_medalla(db: Session, medalla_id: int) -> GamificacionMedalla | None:
    return db.query(GamificacionMedalla).filter(GamificacionMedalla.id == medalla_id).first()

def create_medalla(db: Session, *, obj_in: GamificacionMedallaCreate) -> GamificacionMedalla:
    db_obj = GamificacionMedalla(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# ... and so on for other gamification models as needed.

# --- CRUD for Misiones Grupales ---

def create_mision(db: Session, *, obj_in: "MisionCreate") -> "Mision":
    # Placeholder for creating a new mission. Assumes a Mision model exists.
    # In a real scenario, this would create a new record in the 'misiones' table.
    print(f"CRUD: Creating mission '{obj_in.nombre}'")
    # This is a mock implementation as we cannot alter the DB.
    db_obj = {"id": 1, **obj_in.model_dump()}
    return db_obj

def get_active_misiones(db: Session, *, inquilino_id: int) -> List["Mision"]:
    # Placeholder for getting active missions.
    print(f"CRUD: Getting active missions for tenant {inquilino_id}")
    # Mock implementation
    return [
        {"id": 1, "nombre": "Misión de Bienvenida", "descripcion": "Completa el tutorial", "objetivo_puntos": 100, "fecha_inicio": "2025-01-01T00:00:00Z", "fecha_fin": "2025-12-31T23:59:59Z"}
    ]

# --- CRUD for Mercado de Puntos ---

def create_mercado_item(db: Session, *, obj_in: "MercadoItemCreate") -> "MercadoItem":
    # Placeholder for creating a new marketplace item.
    print(f"CRUD: Creating market item '{obj_in.nombre}'")
    db_obj = {"id": 101, **obj_in.model_dump()}
    return db_obj

def get_mercado_items(db: Session, *, inquilino_id: int) -> List["MercadoItem"]:
    # Placeholder for getting all marketplace items.
    print(f"CRUD: Getting market items for tenant {inquilino_id}")
    return [
        {"id": 101, "nombre": "Avatar de Dragón", "costo_puntos": 500, "tipo": "virtual_avatar"},
        {"id": 102, "nombre": "Banner de Perfil Cósmico", "costo_puntos": 750, "tipo": "virtual_banner"}
    ]

def execute_compra(db: Session, *, item_id: int, alumno_id: int) -> "Compra":
    # Placeholder for executing a purchase.
    print(f"CRUD: Alumno {alumno_id} is attempting to buy item {item_id}")
    # 1. Get item cost
    # 2. Get student's total points
    # 3. Check if points are sufficient
    # 4. Deduct points (create a negative PuntosLog)
    # 5. Create a CompraLog record
    # This is a complex transaction, mocked for now.
    print("CRUD: Purchase successful (mocked).")
    return {"id": 1, "item_id": item_id, "alumno_id": alumno_id, "costo_realizado": 500, "timestamp": "2025-01-01T12:00:00Z"}
