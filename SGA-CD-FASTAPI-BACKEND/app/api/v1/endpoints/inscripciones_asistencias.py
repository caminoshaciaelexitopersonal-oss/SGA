from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import user as user_model

router = APIRouter()

# --- Inscripcion Endpoints ---

@router.get("/inscripciones/clase/{clase_id}", response_model=List[schemas.Inscripcion])
def read_inscripciones_by_clase(
    clase_id: int,
    db: Session = Depends(deps.get_db),
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve enrollments for a specific class with tenant validation.
    """
    clase = crud.clase.get_clase(db, clase_id=clase_id)
    if not clase or getattr(clase, "inquilino_id", current_user.inquilino_id) != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    inscripciones = crud.inscripcion_asistencia.get_inscripciones_by_clase(db, clase_id=clase_id)
    return inscripciones

@router.post("/inscripciones/", response_model=schemas.Inscripcion)
def create_inscripcion(
    *,
    db: Session = Depends(deps.get_db),
    inscripcion_in: schemas.InscripcionCreate,
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new enrollment with tenant validation.
    """
    if getattr(inscripcion_in, "inquilino_id", current_user.inquilino_id) != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create enrollment for another tenant.")

    inscripcion = crud.inscripcion_asistencia.create_inscripcion(db=db, obj_in=inscripcion_in)
    return inscripcion

# --- Asistencia Endpoints ---

@router.get("/asistencias/clase/{clase_id}", response_model=List[schemas.Asistencia])
def read_asistencias_by_clase(
    clase_id: int,
    db: Session = Depends(deps.get_db),
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve attendance for a specific class with tenant validation.
    """
    clase = crud.clase.get_clase(db, clase_id=clase_id)
    if not clase or getattr(clase, "inquilino_id", current_user.inquilino_id) != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

    asistencias = crud.inscripcion_asistencia.get_asistencias_by_clase(db, clase_id=clase_id)
    return asistencias

@router.post("/asistencias/", response_model=schemas.Asistencia)
def create_asistencia(
    *,
    db: Session = Depends(deps.get_db),
    asistencia_in: schemas.AsistenciaCreate,
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Log attendance for a student in a class with tenant validation.
    """
    if getattr(asistencia_in, "inquilino_id", current_user.inquilino_id) != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot log attendance for another tenant.")

    asistencia = crud.inscripcion_asistencia.create_asistencia(db=db, obj_in=asistencia_in)
    return asistencia
