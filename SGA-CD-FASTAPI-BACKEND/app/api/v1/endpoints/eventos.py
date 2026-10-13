from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import user as user_model

router = APIRouter()

@router.get("/", response_model=List[schemas.Evento])
def read_eventos(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve eventos for the current tenant.
    """
    eventos = crud.evento.get_eventos_by_tenant(db, inquilino_id=current_user.inquilino_id, skip=skip, limit=limit)
    return eventos

@router.post("/", response_model=schemas.Evento)
def create_evento(
    *,
    db: Session = Depends(deps.get_db),
    evento_in: schemas.EventoCreate,
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new evento for the user's tenant.
    """
    if evento_in.inquilino_id != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create evento for another tenant.")

    evento = crud.evento.create_evento(db=db, obj_in=evento_in)
    return evento

@router.post("/participantes/", response_model=schemas.EventoParticipante)
def add_participante_to_evento(
    *,
    db: Session = Depends(deps.get_db),
    participante_in: schemas.EventoParticipanteCreate,
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a participant to an event with tenant validation.
    """
    if participante_in.inquilino_id != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot add participant for another tenant.")

    evento = crud.evento.get_evento(db, evento_id=participante_in.evento_id)
    if not evento or evento.inquilino_id != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento not found in current tenant.")

    participante = crud.evento.add_participante_to_evento(db=db, obj_in=participante_in)
    return participante
