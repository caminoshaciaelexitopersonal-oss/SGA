from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps

router = APIRouter()

# --- PlanCurricular Endpoints ---

@router.get("/planes/", response_model=List[schemas.PlanCurricular])
def read_planes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve curriculum plans for the current tenant.
    """
    tenant_id = 1 # Placeholder for current_user.inquilino_id
    planes = crud.curriculum.get_planes_by_tenant(db, inquilino_id=tenant_id, skip=skip, limit=limit)
    return planes

@router.post("/planes/", response_model=schemas.PlanCurricular)
def create_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_in: schemas.PlanCurricularCreate,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new curriculum plan.
    """
    plan = crud.curriculum.create_plan(db=db, obj_in=plan_in)
    return plan

# --- PlanCurricularTema Endpoints ---

@router.post("/temas/", response_model=schemas.PlanCurricularTema)
def create_tema(
    *,
    db: Session = Depends(deps.get_db),
    tema_in: schemas.PlanCurricularTemaCreate,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new topic for a curriculum plan.
    """
    tema = crud.curriculum.create_tema(db=db, obj_in=tema_in)
    return tema

# --- Disciplina Endpoints ---

@router.get("/disciplinas/", response_model=List[schemas.Disciplina])
def read_disciplinas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve disciplines.
    """
    # Assuming tenant_id would be part of the user or a general dependency
    tenant_id = 1 # Placeholder
    disciplinas = crud.curriculum.get_disciplinas_by_tenant(db, inquilino_id=tenant_id, skip=skip, limit=limit)
    return disciplinas

@router.post("/disciplinas/", response_model=schemas.Disciplina)
def create_disciplina(
    *,
    db: Session = Depends(deps.get_db),
    disciplina_in: schemas.DisciplinaCreate,
    # current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Create new discipline.
    """
    disciplina = crud.curriculum.create_disciplina(db=db, obj_in=disciplina_in)
    return disciplina
