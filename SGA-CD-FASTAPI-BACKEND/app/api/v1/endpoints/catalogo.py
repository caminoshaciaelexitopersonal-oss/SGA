import re
import html
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app import models
from app.api import deps
from app.models.catalog import CatalogoEspecialidad, EmpresaEspecialidad, ProfesorEspecialidad
from app.models.tenancy import Inquilino
from app.core.catalogo_data import CATALOGO_OFICIAL

router = APIRouter()


# --- Pydantic Schemas ---
class CustomSpecialtyCreate(BaseModel):
    vertical: str = Field(..., description="'deporte' o 'cultura'")
    nombre: str = Field(..., min_length=2, max_length=200)
    categoria: Optional[str] = Field(default="Personalizada", max_length=100)

class AdoptSpecialtiesRequest(BaseModel):
    especialidad_ids: List[int]

class UpdateVocacionRequest(BaseModel):
    vocacion_institucional: str = Field(..., description="'deportiva' o 'cultural'")


def seed_catalogo_if_empty(db: Session):
    """Seed the 1,000 official master specialties into catalogo_especialidades if empty."""
    try:
        count = db.query(func.count(CatalogoEspecialidad.id)).scalar()
        if not isinstance(count, int):
            count = 0
    except Exception:
        count = 0

    if count < 1000:
        existing_codes = set(
            row[0] for row in db.query(CatalogoEspecialidad.codigo_canonico).all()
        )
        items_to_insert = []
        for item in CATALOGO_OFICIAL:
            if item["codigo_canonico"] not in existing_codes:
                items_to_insert.append(
                    CatalogoEspecialidad(
                        vertical=item["vertical"],
                        categoria=item["categoria"],
                        codigo_canonico=item["codigo_canonico"],
                        nombre=item["nombre"],
                        es_estandar=True,
                        activo=True,
                    )
                )
        if items_to_insert:
            db.bulk_save_objects(items_to_insert)
            db.commit()


def sanitize_text(text: str) -> str:
    """Sanitizes text against XSS and script injection."""
    text = html.escape(text.strip())
    # Remove any stray tags or dangerous characters
    clean = re.sub(r'<[^>]*>', '', text)
    return clean


@router.get("/especialidades")
def search_catalogo_especialidades(
    vertical: Optional[str] = Query(None, description="'deporte' o 'cultura'"),
    search: Optional[str] = Query(None, description="Texto de búsqueda"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """
    Search master catalog specialties by vertical and keyword.
    Automatically seeds official catalog on first run.
    """
    seed_catalogo_if_empty(db)

    query = db.query(CatalogoEspecialidad).filter(CatalogoEspecialidad.activo == True)

    if vertical:
        clean_v = vertical.strip().lower()
        if clean_v in ("deporte", "deportiva"):
            query = query.filter(CatalogoEspecialidad.vertical == "deporte")
        elif clean_v in ("cultura", "cultural"):
            query = query.filter(CatalogoEspecialidad.vertical == "cultura")

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(CatalogoEspecialidad.nombre).like(term),
                func.lower(CatalogoEspecialidad.categoria).like(term),
            )
        )

    results = query.order_by(CatalogoEspecialidad.nombre.asc()).limit(limit).all()

    return [
        {
            "id": r.id,
            "vertical": r.vertical,
            "categoria": r.categoria,
            "codigo_canonico": r.codigo_canonico,
            "nombre": r.nombre,
            "es_estandar": r.es_estandar,
        }
        for r in results
    ]


@router.post("/especialidades/custom", status_code=status.HTTP_201_CREATED)
def create_custom_especialidad_on_the_fly(
    payload: CustomSpecialtyCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """
    On-The-Fly specialty creation and tenant adoption mechanism.
    Sanitizes input, checks for existing match (case/trim insensitive),
    creates master entry if new (es_estandar=False), and associates with tenant.
    """
    if not current_user.inquilino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no tiene una organización asociada."
        )

    clean_nombre = sanitize_text(payload.nombre)
    if not clean_nombre or len(clean_nombre) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de especialidad inválido."
        )

    clean_vertical = payload.vertical.strip().lower()
    if clean_vertical in ("deportiva", "deporte"):
        vertical_val = "deporte"
    elif clean_vertical in ("cultural", "cultura"):
        vertical_val = "cultura"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vertical debe ser 'deporte' o 'cultura'."
        )

    clean_cat = sanitize_text(payload.categoria or "Personalizada")

    seed_catalogo_if_empty(db)

    # 1. Search existing (case-insensitive & trimmed)
    existing_spec = (
        db.query(CatalogoEspecialidad)
        .filter(
            CatalogoEspecialidad.vertical == vertical_val,
            func.lower(func.trim(CatalogoEspecialidad.nombre)) == clean_nombre.lower(),
        )
        .first()
    )

    if not existing_spec:
        # Create new master specialty entry
        canon_code = f"custom_{vertical_val[:3]}_{current_user.inquilino_id}_{re.sub(r'[^a-z0-9]+', '_', clean_nombre.lower())[:30]}"
        existing_spec = CatalogoEspecialidad(
            vertical=vertical_val,
            categoria=clean_cat,
            codigo_canonico=canon_code,
            nombre=clean_nombre,
            es_estandar=False,
            creado_por_inquilino_id=current_user.inquilino_id,
            activo=True,
        )
        db.add(existing_spec)
        db.commit()
        db.refresh(existing_spec)

    # 2. Associate with tenant in empresa_especialidades if not already associated
    empresa_assoc = (
        db.query(EmpresaEspecialidad)
        .filter(
            EmpresaEspecialidad.inquilino_id == current_user.inquilino_id,
            EmpresaEspecialidad.especialidad_id == existing_spec.id,
        )
        .first()
    )

    if not empresa_assoc:
        empresa_assoc = EmpresaEspecialidad(
            inquilino_id=current_user.inquilino_id,
            especialidad_id=existing_spec.id,
            activa=True,
        )
        db.add(empresa_assoc)
        db.commit()
        db.refresh(empresa_assoc)
    elif not empresa_assoc.activa:
        empresa_assoc.activa = True
        db.commit()

    return {
        "id": empresa_assoc.id,
        "inquilino_id": empresa_assoc.inquilino_id,
        "especialidad_id": existing_spec.id,
        "nombre": existing_spec.nombre,
        "vertical": existing_spec.vertical,
        "categoria": existing_spec.categoria,
        "es_estandar": existing_spec.es_estandar,
        "activa": empresa_assoc.activa,
        "fecha_adopcion": empresa_assoc.fecha_adopcion,
    }


@router.get("/my-specialties")
def get_my_company_specialties(
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """Get all active adopted specialties for the authenticated user's organization."""
    if not current_user.inquilino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario sin organización asignada."
        )

    assocs = (
        db.query(EmpresaEspecialidad)
        .join(CatalogoEspecialidad, EmpresaEspecialidad.especialidad_id == CatalogoEspecialidad.id)
        .filter(
            EmpresaEspecialidad.inquilino_id == current_user.inquilino_id,
            EmpresaEspecialidad.activa == True,
        )
        .order_by(CatalogoEspecialidad.nombre.asc())
        .all()
    )

    return [
        {
            "empresa_especialidad_id": a.id,
            "especialidad_id": a.especialidad.id,
            "nombre": a.especialidad.nombre,
            "vertical": a.especialidad.vertical,
            "categoria": a.especialidad.categoria,
            "es_estandar": a.especialidad.es_estandar,
            "fecha_adopcion": a.fecha_adopcion,
        }
        for a in assocs
    ]


@router.post("/my-specialties/adopt")
def adopt_company_specialties(
    payload: AdoptSpecialtiesRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """Adopt multiple existing catalog specialties by ID for current tenant."""
    if not current_user.inquilino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario sin organización asignada."
        )

    adopted = []
    for spec_id in payload.especialidad_ids:
        spec = db.query(CatalogoEspecialidad).filter(CatalogoEspecialidad.id == spec_id).first()
        if not spec:
            continue

        assoc = (
            db.query(EmpresaEspecialidad)
            .filter(
                EmpresaEspecialidad.inquilino_id == current_user.inquilino_id,
                EmpresaEspecialidad.especialidad_id == spec_id,
            )
            .first()
        )

        if not assoc:
            assoc = EmpresaEspecialidad(
                inquilino_id=current_user.inquilino_id,
                especialidad_id=spec_id,
                activa=True,
            )
            db.add(assoc)
            db.commit()
            db.refresh(assoc)
        elif not assoc.activa:
            assoc.activa = True
            db.commit()

        adopted.append(
            {
                "empresa_especialidad_id": assoc.id,
                "especialidad_id": spec.id,
                "nombre": spec.nombre,
                "vertical": spec.vertical,
            }
        )

    return {"message": "Especialidades adoptadas exitosamente", "adopted": adopted}


@router.delete("/my-specialties/{especialidad_id}")
def unadopt_company_specialty(
    especialidad_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """Unadopt a specialty for the current tenant."""
    if not current_user.inquilino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario sin organización asignada."
        )

    assoc = (
        db.query(EmpresaEspecialidad)
        .filter(
            EmpresaEspecialidad.inquilino_id == current_user.inquilino_id,
            EmpresaEspecialidad.especialidad_id == especialidad_id,
        )
        .first()
    )

    if not assoc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Especialidad no adoptada por la organización."
        )

    assoc.activa = False
    db.commit()

    return {"message": "Especialidad removida de la organización"}


@router.patch("/vocacion")
def update_tenant_vocacion(
    payload: UpdateVocacionRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.Usuario = Depends(deps.get_current_active_user),
):
    """Update tenant's institutional vocation ('deportiva' | 'cultural')."""
    if not current_user.inquilino_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario sin organización asignada."
        )

    clean_v = payload.vocacion_institucional.strip().lower()
    if clean_v not in ("deportiva", "cultural"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vocación debe ser 'deportiva' o 'cultural'."
        )

    tenant = db.query(Inquilino).filter(Inquilino.id == current_user.inquilino_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Organización no encontrada.")

    tenant.vocacion_institucional = clean_v
    db.commit()

    return {
        "inquilino_id": tenant.id,
        "nombre_empresa": tenant.nombre_empresa,
        "vocacion_institucional": tenant.vocacion_institucional,
    }
