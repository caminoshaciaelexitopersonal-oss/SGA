from pydantic import BaseModel, EmailStr, Field
from typing import List

# Shared properties
class UserBase(BaseModel):
    # Use an alias to map the `email` field to the `correo` attribute of the ORM model.
    # `populate_by_name=True` allows us to still use `email` in API requests.
    email: EmailStr = Field(validation_alias='correo')
    nombre_completo: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    nombre_usuario: str
    rol: str
    inquilino_id: int

# Properties to return to client
class User(UserBase):
    id: int
    activo: bool
    roles: List[str] = []
