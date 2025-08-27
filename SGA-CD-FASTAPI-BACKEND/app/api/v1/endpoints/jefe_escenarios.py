from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas, crud
from app.models import user as user_model
from app.api import deps

router = APIRouter()

@router.get("/scenarios", response_model=List[schemas.escenario.Escenario], summary="List all scenarios for the current user's company")
def get_my_company_scenarios(
    db: Session = Depends(deps.get_db),
    current_user: user_model.Usuario = Depends(deps.role_required(["jefe_escenarios"]))
):
    """
    Get all scenarios belonging to the current user's company (inquilino).
    (Protected: jefe_escenarios only)
    """
    scenarios = crud.escenario.get_escenarios_by_tenant(db=db, inquilino_id=current_user.inquilino_id)
    return scenarios
