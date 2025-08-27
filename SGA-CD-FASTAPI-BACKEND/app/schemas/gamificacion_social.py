from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- Misiones ---

class MisionBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    objetivo_puntos: int
    fecha_inicio: datetime
    fecha_fin: datetime
    recompensa_medalla_key: Optional[str] = None

class MisionCreate(MisionBase):
    pass

class Mision(MisionBase):
    id: int

    class Config:
        orm_mode = True

# --- Mercado de Puntos ---

class MercadoItemBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    costo_puntos: int
    tipo: str = "virtual_avatar"
    stock: Optional[int] = None

class MercadoItemCreate(MercadoItemBase):
    pass

class MercadoItem(MercadoItemBase):
    id: int

    class Config:
        orm_mode = True

# --- Compra de Items ---

class CompraCreate(BaseModel):
    item_id: int
    # alumno_id will be taken from the current user token, not from the request body

class Compra(BaseModel):
    id: int
    item_id: int
    alumno_id: int
    costo_realizado: int
    timestamp: datetime

    class Config:
        orm_mode = True
