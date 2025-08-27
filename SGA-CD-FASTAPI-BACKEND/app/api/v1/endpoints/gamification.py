from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.schemas import gamificacion_social
from app.api import deps

router = APIRouter()

# --- GamificacionAccion Endpoints ---

@router.get("/acciones/", response_model=List[schemas.GamificacionAccion])
def read_acciones(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve gamification actions for the current tenant.
    """
    tenant_id = 1 # Placeholder for current_user.inquilino_id
    acciones = crud.gamification.get_acciones_by_tenant(db, inquilino_id=tenant_id, skip=skip, limit=limit)
    return acciones

@router.post("/acciones/", response_model=schemas.GamificacionAccion)
def create_accion(
    *,
    db: Session = Depends(deps.get_db),
    accion_in: schemas.GamificacionAccionCreate,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new gamification action.
    """
    accion = crud.gamification.create_accion(db=db, obj_in=accion_in)
    return accion

# --- GamificacionPuntosLog Endpoints ---

@router.post("/puntos-log/", response_model=schemas.GamificacionPuntosLog)
def create_puntos_log_entry(
    *,
    db: Session = Depends(deps.get_db),
    log_in: schemas.GamificacionPuntosLogCreate,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new gamification points log entry.
    This would be called by other services when a student completes an action.
    """
    log_entry = crud.gamification.create_puntos_log(db=db, obj_in=log_in)
    return log_entry

# Other endpoints for Medals, etc., would follow the same pattern.

# --- Misiones Grupales Endpoints ---

@router.get("/misiones/", response_model=List[gamificacion_social.Mision])
def get_active_misiones(
    db: Session = Depends(deps.get_db),
    # current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Get all active missions for the tenant.
    """
    tenant_id = 1 # Placeholder
    return crud.gamification.get_active_misiones(db, inquilino_id=tenant_id)

@router.post("/misiones/", response_model=gamificacion_social.Mision)
def create_mision(
    *,
    db: Session = Depends(deps.get_db),
    mision_in: gamificacion_social.MisionCreate,
    # current_user = Depends(deps.role_required(["admin_empresa", "coordinador"])),
) -> Any:
    """
    Create a new group mission.
    """
    return crud.gamification.create_mision(db=db, obj_in=mision_in)


# --- Mercado de Puntos Endpoints ---

@router.get("/mercado/items/", response_model=List[gamificacion_social.MercadoItem])
def get_mercado_items(
    db: Session = Depends(deps.get_db),
    # current_user = Depends(deps.get_current_user),
) -> Any:
    """
    Get all items available in the marketplace.
    """
    tenant_id = 1 # Placeholder
    return crud.gamification.get_mercado_items(db, inquilino_id=tenant_id)

@router.post("/mercado/comprar/", response_model=gamificacion_social.Compra)
def comprar_item(
    *,
    db: Session = Depends(deps.get_db),
    compra_in: gamificacion_social.CompraCreate,
    # current_user: models.Usuario = Depends(deps.role_required(["alumno"])),
) -> Any:
    """
    Purchase an item from the marketplace.
    """
    alumno_id = 1 # Placeholder for current_user.alumno.id
    return crud.gamification.execute_compra(db=db, item_id=compra_in.item_id, alumno_id=alumno_id)
