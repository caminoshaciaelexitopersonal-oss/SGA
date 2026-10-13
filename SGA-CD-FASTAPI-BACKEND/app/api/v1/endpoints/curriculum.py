from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models import user as user_model

router = APIRouter()

# --- PlanCurricular Endpoints ---

@router.get("/planes/", response_model=List[schemas.PlanCurricular])
def read_planes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: user_model.Usuario = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve curriculum plans for the current tenant.
    """
    planes = crud.curriculum.get_planes_by_tenant(db, inquilino_id=current_user.inquilino_id, skip=skip, limit=limit)
    return planes

@router.post("/planes/", response_model=schemas.PlanCurricular)
def create_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_in: schemas.PlanCurricularCreate,
    current_user: user_model.Usuario = Depends(deps.role_required(["admin_empresa", "profesor", "coordinador"])),
) -> Any:
    """
    Create a new curriculum plan for the user's tenant.
    """
    if plan_in.inquilino_id != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create curriculum plan for another tenant.")

    plan = crud.curriculum.create_plan(db=db, obj_in=plan_in)
    return plan

# --- PlanCurricularTema Endpoints ---

@router.post("/temas/", response_model=schemas.PlanCurricularTema)
def create_tema(
    *,
    db: Session = Depends(deps.get_db),
    tema_in: schemas.PlanCurricularTemaCreate,
    current_user: user_model.Usuario = Depends(deps.role_required(["admin_empresa", "profesor", "coordinador"])),
) -> Any:
    """
    Create a new topic for a curriculum plan with tenant validation.
    """
    plan = crud.curriculum.get_plan(db, plan_id=tema_in.plan_curricular_id)
    if not plan or plan.inquilino_id != current_user.inquilino_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan curricular not found in current tenant.")

    tema = crud.curriculum.create_tema(db=db, obj_in=tema_in)
    return tema
