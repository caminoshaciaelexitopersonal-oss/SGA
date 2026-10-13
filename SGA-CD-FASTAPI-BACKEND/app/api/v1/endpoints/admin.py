from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app import schemas, crud
from app.models import user as user_model
from app.api import deps
from app.core.rate_limiter import rate_limit

router = APIRouter()


@router.get("/roles", response_model=List[str], summary="List all roles")
def get_all_roles(
    db: Session = Depends(deps.get_db),
    current_user: user_model.Usuario = Depends(deps.role_required(["admin_general"]))
):
    """
    Get all available roles in the system.
    (Protected: admin_general only)
    """
    query = text("SELECT nombre FROM roles ORDER BY nombre")
    roles_result = db.execute(query).fetchall()
    return [row[0] for row in roles_result]


@router.get("/users/by-empresa", response_model=List[schemas.User], summary="List users by company", dependencies=[Depends(rate_limit("admin_users_by_empresa", max_requests=30, window_seconds=60))])
def get_users_by_empresa(
    db: Session = Depends(deps.get_db),
    current_user: user_model.Usuario = Depends(deps.get_current_active_user)
):
    """
    Get all users belonging to the current user's empresa (inquilino).
    Accessible by roles that manage users within a company, like admin_empresa or jefe_area.
    """
    # Check for appropriate roles manually since we need the user object
    allowed_roles = {"admin_empresa", "jefe_area", "admin_general"}
    user_roles = set(getattr(current_user, "role_codes", []))
    if not user_roles.intersection(allowed_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized. Requires one of the following roles: {list(allowed_roles)}",
        )

    users = db.query(user_model.Usuario).filter(
        user_model.Usuario.inquilino_id == current_user.inquilino_id
    ).all()

    # Manually attach role_list to each user for response
    for user in users:
        role_query = text("""
            SELECT r.nombre
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = :user_id
        """)
        roles_result = db.execute(role_query, {"user_id": user.id}).fetchall()
        role_names = [row[0] for row in roles_result]
        if not role_names and user.rol:
            role_names = [user.rol.value if hasattr(user.rol, 'value') else str(user.rol)]
        user.role_list = role_names

    return users


@router.get("/areas", response_model=List[schemas.area.Area], summary="List areas by company")
def get_areas_by_empresa(
    db: Session = Depends(deps.get_db),
    current_user: user_model.Usuario = Depends(deps.get_current_active_user)
):
    """
    Get all areas belonging to the current user's empresa (inquilino).
    Accessible by admin_empresa.
    """
    # Role check
    user_roles = set(getattr(current_user, "role_codes", []))
    if "admin_empresa" not in user_roles and "admin_general" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Requires 'admin_empresa' or 'admin_general' role.",
        )

    areas = crud.area.get_areas_by_tenant(db=db, inquilino_id=current_user.inquilino_id)
    return areas